# 数据存储

## mutation

Vuex 对数据存储的存储本质上就是对 `state` 做修改，并且只允许我们通过提交 `mutaion` 的形式去修改 `state`，`mutation` 是一个函数，如下：
    
```js
mutations: {
  increment (state) {
    state.count++
  }
}
```

`mutations` 的初始化也是在 `installModule` 的时候：

```js
function installModule (store, rootState, path, module, hot) {
  // ...
  const namespace = store._modules.getNamespace(path)

  // ...
  const local = module.context = makeLocalContext(store, namespace, path)

  module.forEachMutation((mutation, key) => {
    const namespacedType = namespace + key
    registerMutation(store, namespacedType, mutation, local)
  })
  // ...
}

function registerMutation (store, type, handler, local) {
  const entry = store._mutations[type] || (store._mutations[type] = [])
  entry.push(function wrappedMutationHandler (payload) {
    handler.call(store, local.state, payload)
  })
}
```

`store` 提供了`commit` 方法让我们提交一个 `mutation`：

```js
commit (_type, _payload, _options) {
  // check object-style commit
  const {
    type,
    payload,
    options
  } = unifyObjectStyle(_type, _payload, _options)

  const mutation = { type, payload }
  const entry = this._mutations[type]
  if (!entry) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[vuex] unknown mutation type: ${type}`)
    }
    return
  }
  this._withCommit(() => {
    entry.forEach(function commitIterator (handler) {
      handler(payload)
    })
  })
  this._subscribers.forEach(sub => sub(mutation, this.state))

  if (
    process.env.NODE_ENV !== 'production' &&
    options && options.silent
  ) {
    console.warn(
      `[vuex] mutation type: ${type}. Silent option has been removed. ` +
      'Use the filter functionality in the vue-devtools'
    )
  }
}
```

这里传入的 `_type` 就是 `mutation` 的 `type`，我们可以从 `store._mutations` 找到对应的函数数组，遍历它们执行获取到每个 `handler` 然后执行，实际上就是执行了 `wrappedMutationHandler(playload)`，接着会执行我们定义的 `mutation` 函数，并传入当前模块的 `state`，所以我们的 `mutation` 函数也就是对当前模块的 `state` 做修改。

需要注意的是， `mutation` 必须是同步函数，但是我们在开发实际项目中，经常会遇到要先去发送一个请求，然后根据请求的结果去修改 `state`，那么单纯只通过 `mutation` 是无法完成需求，因此 Vuex 又给我们设计了一个 `action` 的概念。

## action

`action` 类似于 `mutation`，不同在于 `action` 提交的是 `mutation`，而不是直接操作 `state`，并且它可以包含任意异步操作。例如：

```js
mutations: {
  increment (state) {
    state.count++
  }
},
actions: {
  increment (context) {
    setTimeout(() => {
      context.commit('increment')
    }, 0)
  }
}
```

`actions` 的初始化也是在 `installModule` 的时候：

```js
function installModule (store, rootState, path, module, hot) {
  // ...
  const namespace = store._modules.getNamespace(path)

  // ...
  const local = module.context = makeLocalContext(store, namespace, path)

  module.forEachAction((action, key) => {
    const type = action.root ? key : namespace + key
    const handler = action.handler || action
    registerAction(store, type, handler, local)
}  )
  // ...
}

function registerAction (store, type, handler, local) {
  const entry = store._actions[type] || (store._actions[type] = [])
  entry.push(function wrappedActionHandler (payload, cb) {
    let res = handler.call(store, {
      dispatch: local.dispatch,
      commit: local.commit,
      getters: local.getters,
      state: local.state,
      rootGetters: store.getters,
      rootState: store.state
    }, payload, cb)
    if (!isPromise(res)) {
      res = Promise.resolve(res)
    }
    if (store._devtoolHook) {
      return res.catch(err => {
        store._devtoolHook.emit('vuex:error', err)
        throw err
      })
    } else {
      return res
    }
  })
}
```

`store` 提供了`dispatch` 方法让我们提交一个 `action`：

```js
dispatch (_type, _payload) {
  // check object-style dispatch
  const {
    type,
    payload
  } = unifyObjectStyle(_type, _payload)

  const action = { type, payload }
  const entry = this._actions[type]
  if (!entry) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[vuex] unknown action type: ${type}`)
    }
    return
  }

  this._actionSubscribers.forEach(sub => sub(action, this.state))

  return entry.length > 1
    ? Promise.all(entry.map(handler => handler(payload)))
    : entry[0](payload)
}
```

这里传入的 `_type` 就是 `action` 的 `type`，我们可以从 `store._actions` 找到对应的函数数组，遍历它们执行获取到每个 `handler` 然后执行，实际上就是执行了 `wrappedActionHandler(payload)`，接着会执行我们定义的 `action` 函数，并传入一个对象，包含了当前模块下的 `dispatch`、`commit`、`getters`、`state`，以及全局的 `rootState` 和 `rootGetters`，所以我们定义的 `action` 函数能拿到当前模块下的 `commit` 方法。

因此 `action` 比我们自己写一个函数执行异步操作然后提交 `muataion` 的好处是在于它可以在参数中获取到当前模块的一些方法和状态，Vuex 帮我们做好了这些。
