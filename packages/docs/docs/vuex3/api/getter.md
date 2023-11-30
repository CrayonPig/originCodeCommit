# 数据获取

Vuex 最终存储的数据是在 `state` 上的，我们之前分析过在 `store.state` 存储的是 `root state`，那么对于模块上的 `state`，假设我们有 2 个嵌套的 `modules`，它们的 `key` 分别为 `a` 和 `b`，我们可以通过 `store.state.a.b.xxx` 的方式去获取。它的实现是在发生在 `installModule` 的时候：

```js
function installModule (store, rootState, path, module, hot) {
  const isRoot = !path.length
  
  // ...
  // set state
  if (!isRoot && !hot) {
    const parentState = getNestedState(rootState, path.slice(0, -1))
    const moduleName = path[path.length - 1]
    store._withCommit(() => {
      Vue.set(parentState, moduleName, module.state)
    })
  }
  // ...
}
```

在递归执行 `installModule` 的过程中，就完成了整个 `state` 的建设，这样我们就可以通过 `module` 名的 `path` 去访问到一个深层 `module` 的 `state`。

有些时候，我们获取的数据不仅仅是一个 `state`，而是由多个 `state` 计算而来，Vuex 提供了 `getters`，允许我们定义一个 `getter` 函数，如下：

````js
getters: {
  total (state, getters, localState, localGetters) {
    // 可访问全局 state 和 getters，以及如果是在 modules 下面，可以访问到局部 state 和 局部 getters
    return state.a + state.b
  }
}
````

我们在 `installModule` 的过程中，递归执行了所有 `getters` 定义的注册，在之后的 `resetStoreVM` 过程中，执行了 `store.getters` 的初始化工作：

```js
function installModule (store, rootState, path, module, hot) {
  // ...
  const namespace = store._modules.getNamespace(path)
  // ...
  const local = module.context = makeLocalContext(store, namespace, path)

  // ...

  module.forEachGetter((getter, key) => {
    const namespacedType = namespace + key
    registerGetter(store, namespacedType, getter, local)
  })

  // ...
}

function registerGetter (store, type, rawGetter, local) {
  if (store._wrappedGetters[type]) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[vuex] duplicate getter key: ${type}`)
    }
    return
  }
  store._wrappedGetters[type] = function wrappedGetter (store) {
    return rawGetter(
      local.state, // local state
      local.getters, // local getters
      store.state, // root state
      store.getters // root getters
    )
  }
}


function resetStoreVM (store, state, hot) {
  // ...
  // bind store public getters
  store.getters = {}
  const wrappedGetters = store._wrappedGetters
  const computed = {}
  forEachValue(wrappedGetters, (fn, key) => {
    // use computed to leverage its lazy-caching mechanism
    computed[key] = () => fn(store)
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key],
      enumerable: true // for local getters
    })
  })

  // use a Vue instance to store the state tree
  // suppress warnings just in case the user has added
  // some funky global mixins
  // ...
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
  // ...
}
```

在 `installModule` 的过程中，为建立了每个模块的上下文环境，
因此当我们访问 `store.getters.xxx` 的时候，实际上就是执行了 `rawGetter(local.state,...)`，`rawGetter` 就是我们定义的 `getter` 方法，这也就是为什么我们的 `getter` 函数支持这四个参数，并且除了全局的 `state` 和 `getter` 外，我们还可以访问到当前 `module` 下的 `state` 和 `getter`。
