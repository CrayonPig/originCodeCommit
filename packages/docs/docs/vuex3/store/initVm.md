# 初始化 store._vm

接下来，执行初始化`store._vm`的相关逻辑

```js
resetStoreVM(this, state)

// 重置 Vuex store 中的 Vue 实例 _vm
function resetStoreVM (store, state, hot) {
  // 保存旧的 Vue 实例
  const oldVm = store._vm

  // 绑定 store 的公共 getters
  store.getters = {}
  // 重置局部 getters 缓存
  store._makeLocalGettersCache = Object.create(null)
  const wrappedGetters = store._wrappedGetters
  const computed = {}

  // 遍历 store 中的 wrapped getters
  forEachValue(wrappedGetters, (fn, key) => {
    // 使用 computed 属性来利用其懒加载机制
    // 直接内联函数使用会导致保留旧的 Vue 实例。
    // 使用 partial 返回只在闭包环境中保留参数的函数。
    computed[key] = partial(fn, store)

    // 通过 Object.defineProperty 定义 store 的 getters，以获取 _vm[key] 的值
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key],
      enumerable: true // 用于局部 getters
    })
  })

  // 创建一个新的 Vue 实例来存储状态树
  // 禁用警告，以防用户添加了一些全局混入（mixins）
  const silent = Vue.config.silent
  Vue.config.silent = true
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
  Vue.config.silent = silent

  // 如果 store 启用了严格模式，为新的 Vue 实例启用严格模式
  if (store.strict) {
    enableStrictMode(store)
  }

  // 如果存在旧的 Vue 实例，且需要进行热重载（hot reloading）
  if (oldVm) {
    if (hot) {
      // 触发所有已订阅的观察者的更改
      // 以强制重新评估 getter 以进行热重载
      store._withCommit(() => {
        oldVm._data.$$state = null
      })
    }
    // 在下一个事件循环中销毁旧的 Vue 实例
    Vue.nextTick(() => oldVm.$destroy())
  }
}
```

1. 首先保存了旧的 Vue 实例 `oldVm`，然后重置了 Vuex store 的 getters，并清除了局部 getters 的缓存。
2. 定义了一个名为 `computed` 的空对象，它将用来存储 Vuex 的 getters，每个 getter 都会被转换为 Vue 的计算属性。
3. 遍历了 store 中的 `wrappedGetters`（包装过的 getters），将每个 getter 函数封装为一个计算属性函数，并存储在 `computed` 对象中。
4. 接着，使用 `Object.defineProperty` 方法定义了 `store.getters` 的 getter 和 setter，`getter` 方法返回 `store._vm[key]` 的值，其中 `key` 就是 getter 的名称。`enumerable` 属性设置为 `true`，表示该属性是可枚举的，主要用于支持局部的 getters。
5. 然后，创建了一个新的 Vue 实例 `store._vm`，用来存储 Vuex 的 state 状态树和计算属性 `computed`。
6. 如果 Vuex store 启用了严格模式，那么也要为新的 `_vm` 实例启用严格模式。
7. 如果存在旧的 Vue 实例并启用了热重载功能，那么会触发所有的观察者的更改，强制重新计算所有的 getter，然后在下一个事件循环中销毁旧的 Vue 实例。

综上所述，`_vm` 实例用于存储 `Vuex` 的 `state` 状态树和计算属性，在 `Vuex` 内部，`getter` 的实现就依赖于 `Vue` 实例的计算属性。
