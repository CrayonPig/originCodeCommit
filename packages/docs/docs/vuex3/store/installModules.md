# 安装 Modules

初始化模块后，执行安装模块的相关逻辑，它的目标就是对模块中的将 `Vuex` 模块及其子模块的`state`、`getters`、`mutations`、`actions`  注册到 `Vuex` 的 `store` 中，它的入口代码是：

```js
const state = this._modules.root.state

// 初始化根模块
// 递归地注册所有子模块
// 并收集this._wrappedGetters内的所有模块getter
installModule(this, state, [], this._modules.root)
```

我们来看看 `installModule` 函数的实现:

```js
function installModule (store, rootState, path, module, hot) {
  // 检测是否是根模块
  const isRoot = !path.length
  // 获取模块的命名空间
  const namespace = store._modules.getNamespace(path)

  // 如果模块启用了命名空间，将模块注册到命名空间映射表中
  if (module.namespaced) {
    if (store._modulesNamespaceMap[namespace] && __DEV__) {
      console.error(`[vuex] duplicate namespace ${namespace} for the namespaced module ${path.join('/')}`)
    }
    store._modulesNamespaceMap[namespace] = module
  }

  // 设置模块的状态（state）
  if (!isRoot && !hot) {
    // 获取父模块的状态
    const parentState = getNestedState(rootState, path.slice(0, -1))
    // 获取当前模块的名称
    const moduleName = path[path.length - 1]
    // 使用 store._withCommit 包装以确保状态变更在 mutation 中进行
    store._withCommit(() => {
      if (__DEV__) {
        // 在开发环境下，如果模块的状态字段与同名模块冲突，发出警告
        if (moduleName in parentState) {
          console.warn(
            `[vuex] state field "${moduleName}" was overridden by a module with the same name at "${path.join('.')}"`
          )
        }
      }
      // 使用 Vue.set 方法设置状态
      Vue.set(parentState, moduleName, module.state)
    })
  }

  // 创建模块的本地上下文
  const local = module.context = makeLocalContext(store, namespace, path)

  // 遍历模块的 mutations，将其注册到 store 中
  module.forEachMutation((mutation, key) => {
    const namespacedType = namespace + key
    registerMutation(store, namespacedType, mutation, local)
  })

  // 遍历模块的 actions，将其注册到 store 中
  module.forEachAction((action, key) => {
    const type = action.root ? key : namespace + key
    const handler = action.handler || action
    registerAction(store, type, handler, local)
  })

  // 遍历模块的 getters，将其注册到 store 中
  module.forEachGetter((getter, key) => {
    const namespacedType = namespace + key
    registerGetter(store, namespacedType, getter, local)
  })

  // 遍历模块的子模块，递归安装子模块
  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child, hot)
  })
}
```

`installModule` 的参数有五个：

- `store`：Vuex Store 的实例。
- `rootState`：根状态，即整个应用的状态。
- `path`：模块在状态树中的路径，是一个数组。
- `module`：要安装的模块。
- `hot`：一个布尔值，表示是否是热重载模块。

我们来分析具体实现逻辑

1. **检测是否是根模块：**

检查路径 `path` 的长度，如果长度为 0，说明当前模块是根模块。

```javascript
const isRoot = !path.length;
```

2. **获取模块的命名空间：**

使用 Vuex Store 实例的 `_modules` 属性获取模块的命名空间。

```javascript
const namespace = store._modules.getNamespace(path);
```

3. **注册模块的命名空间：**

如果模块启用了命名空间 (`module.namespaced`)，则将模块注册到 Vuex Store 实例的命名空间映射表 `_modulesNamespaceMap` 中。如果已存在相同命名空间的模块，则在开发环境下发出警告。

```javascript
if (module.namespaced) {
  if (store._modulesNamespaceMap[namespace] && __DEV__) {
    console.error(`[vuex] duplicate namespace ${namespace} for the namespaced module ${path.join('/')}`);
  }
  store._modulesNamespaceMap[namespace] = module;
}
```

4. **设置模块的状态（state）：**

如果不是根模块且不是热重载模块，则将当前模块的状态设置到父模块的相应字段中。在开发环境下，如果状态字段与同名模块冲突，会发出警告。

```javascript
if (!isRoot && !hot) {
  const parentState = getNestedState(rootState, path.slice(0, -1));
  const moduleName = path[path.length - 1];
  store._withCommit(() => {
    if (__DEV__) {
      if (moduleName in parentState) {
        console.warn(
          `[vuex] state field "${moduleName}" was overridden by a module with the same name at "${path.join('.')}"`
        );
      }
    }
    Vue.set(parentState, moduleName, module.state);
  });
}
```

5. **创建模块的本地上下文：**

使用 `makeLocalContext` 函数创建模块的本地上下文，并将其赋值给 `module.context` 属性。

```javascript
const local = module.context = makeLocalContext(store, namespace, path);
```

6. **遍历注册模块的 mutations、actions、getters：**

遍历模块的 mutations、actions、getters，通过相应的注册函数将它们注册到 Vuex Store 实例中。如果是命名空间模块，会在类型前加上命名空间。

```javascript
module.forEachMutation((mutation, key) => {
  const namespacedType = namespace + key;
  registerMutation(store, namespacedType, mutation, local);
});

module.forEachAction((action, key) => {
  const type = action.root ? key : namespace + key;
  const handler = action.handler || action;
  registerAction(store, type, handler, local);
});

module.forEachGetter((getter, key) => {
  const namespacedType = namespace + key;
  registerGetter(store, namespacedType, getter, local);
});
```

7. **递归安装子模块：**

递归调用 `installModule` 函数，安装子模块。

```javascript
module.forEachChild((child, key) => {
  installModule(store, rootState, path.concat(key), child, hot);
});
```

在以上过程中，需要注意下`makeLocalContext`的实现

```js
// src/store.js
// 创建本地上下文
function makeLocalContext (store, namespace, path) {
  // 判断当前模块是否有命名空间
  const noNamespace = namespace === ''

  // local 对象中包含 dispatch 和 commit 方法
  const local = {
    // 如果没有命名空间，则直接使用 store 的 dispatch 方法
    // 如果有命名空间，对 dispatch 方法进行二次封装
    dispatch: noNamespace ? store.dispatch : (_type, _payload, _options) => {
      // 将参数统一格式
      const args = unifyObjectStyle(_type, _payload, _options)
      const { payload, options } = args
      let { type } = args

      // 如果 dispatch 的 options 中没有 root 属性，那么就需要添加命名空间
      if (!options || !options.root) {
        type = namespace + type
        // 在开发环境下，如果没有对应的 action，打印警告信息
        if (__DEV__ && !store._actions[type]) {
          console.error(`[vuex] unknown local action type: ${args.type}, global type: ${type}`)
          return
        }
      }

      // 执行 dispatch
      return store.dispatch(type, payload)
    },

    // 对 commit 方法进行类似的处理
    commit: noNamespace ? store.commit : (_type, _payload, _options) => {
      const args = unifyObjectStyle(_type, _payload, _options)
      const { payload, options } = args
      let { type } = args

      if (!options || !options.root) {
        type = namespace + type
        if (__DEV__ && !store._mutations[type]) {
          console.error(`[vuex] unknown local mutation type: ${args.type}, global type: ${type}`)
          return
        }
      }

      // 执行 commit
      store.commit(type, payload, options)
    }
  }

  // getters and state object must be gotten lazily
  // because they will be changed by vm update
  // 因为 getters 和 state 可能会随着 vm 的更新而改变，所以需要用 getter 方法来获取最新的值
  Object.defineProperties(local, {
    getters: {
      get: noNamespace
        ? () => store.getters
        : () => makeLocalGetters(store, namespace)
    },
    state: {
      get: () => getNestedState(store.state, path)
    }
  })

  return local
}
```

`makeLocalContext`接受三个参数

- `store` 代表的是 `Vuex` 的 `store`
- `namespace` 是当前模块的命名空间
- `path` 是当前模块的路径

我们来分析具体实现逻辑

- 判断是否设置了 `namespace`，如果没有设置（也就是说 `noNamespace` 为 true），那么在 `local` 中的 `dispatch` 和 `commit` 方法就直接使用 `store` 的 `dispatch` 和 `commit` 方法。
- 对于设置了 `namespace` 的情况，`dispatch` 和 `commit` 方法会增加一些额外的处理，例如判断 `action` 或 `mutation` 类型是否存在，如果不存在则会在开发环境下抛出警告；同时会修改 `type`，将其转成 "`namespace/type`" 的格式。
- 对于 `getters` 和 `state` 来说，需要通过 `Object.defineProperties` 来定义，因为 `getters` 和 `state` 可能会随着 `vm` 的更新而改变，所以需要用 `getter` 方法来获取最新的值。
- `getNestedState` 方法用来从 `store` 的 `state` 中获取指定路径的 `state`，`makeLocalGetters` 方法用来处理带命名空间的 `getters`。
