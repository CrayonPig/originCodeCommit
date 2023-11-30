# 动态更新模块

在 Vuex 初始化阶段我们构造了模块树，初始化了模块上各个部分。在有一些场景下，我们需要动态去注入一些新的模块，Vuex 提供了模块动态注册功能，在 `store` 上提供了一个 `registerModule` 的 API。

```js
registerModule (path, rawModule, options = {}) {
  if (typeof path === 'string') path = [path]

  if (process.env.NODE_ENV !== 'production') {
    assert(Array.isArray(path), `module path must be a string or an Array.`)
    assert(path.length > 0, 'cannot register the root module by using registerModule.')
  }

  this._modules.register(path, rawModule)
  installModule(this, this.state, path, this._modules.get(path), options.preserveState)
  // reset store to update getters...
  resetStoreVM(this, this.state)
}
```

`registerModule` 支持传入一个 `path` 模块路径 和 `rawModule` 模块定义，首先执行 `register` 方法扩展我们的模块树，接着执行 `installModule` 去安装模块，最后执行 `resetStoreVM` 重新实例化 `store._vm`，并销毁旧的 `store._vm`。

相对的，有动态注册模块的需求就有动态卸载模块的需求，Vuex 提供了模块动态卸载功能，在 `store` 上提供了一个 `unregisterModule` 的 API。

```js
unregisterModule (path) {
  if (typeof path === 'string') path = [path]

  if (process.env.NODE_ENV !== 'production') {
    assert(Array.isArray(path), `module path must be a string or an Array.`)
  }

  this._modules.unregister(path)
  this._withCommit(() => {
    const parentState = getNestedState(this.state, path.slice(0, -1))
    Vue.delete(parentState, path[path.length - 1])
  })
  resetStore(this)
}
```

`unregisterModule` 支持传入一个 `path` 模块路径，首先执行 `unregister` 方法去修剪我们的模块树：

```js
unregister (path) {
  const parent = this.get(path.slice(0, -1))
  const key = path[path.length - 1]
  if (!parent.getChild(key).runtime) return

  parent.removeChild(key)
}
```
注意，这里只会移除我们运行时动态创建的模块。

接着会删除 `state` 在该路径下的引用，最后执行 `resetStore` 方法：

```js
function resetStore (store, hot) {
  store._actions = Object.create(null)
  store._mutations = Object.create(null)
  store._wrappedGetters = Object.create(null)
  store._modulesNamespaceMap = Object.create(null)
  const state = store.state
  // init all modules
  installModule(store, state, [], store._modules.root, true)
  // reset vm
  resetStoreVM(store, state, hot)
}
```

该方法就是把 `store` 下的对应存储的 `_actions`、`_mutations`、`_wrappedGetters` 和 `_modulesNamespaceMap` 都清空，然后重新执行 `installModule` 安装所有模块以及 `resetStoreVM` 重置 `store._vm`。
