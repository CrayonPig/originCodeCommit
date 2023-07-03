# 销毁阶段

接下来就到了Vue生命周期的最后一个阶段，销毁阶段。

从生命周期中我们可以看出，当调用`$destroy`方法时，Vue实例就进入了销毁阶段。此阶段Vue会清理和释放组件相关的资源。

需要注意的是，Vue 会自动管理组件实例的销毁过程，你不需要手动调用销毁方法。只要组件被从 DOM 中移除或者父组件被销毁，Vue 就会自动触发销毁阶段的生命周期钩子函数。这使得你可以专注于编写清理和释放资源的代码，而无需担心手动管理销毁过程。

![lifecycle-destroy](@assets/vue2/lifecycle-destroy.png)

## $destroy

`$destroy`方法位于`src/core/instance/lifecycle.js`中

```js
Vue.prototype.$destroy = function () {
  const vm: Component = this
  // 防止重复调用
  if (vm._isBeingDestroyed) {
    return
  }

  callHook(vm, 'beforeDestroy')

  // 表示组件正在销毁
  vm._isBeingDestroyed = true

  // 从父级中删除当前组件
  const parent = vm.$parent
  // 如果父组件没有被销毁，并且当前组件不是一个抽象组件
  if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
    remove(parent.$children, vm)
  }
  // 销毁watcher监听
  // _watcher 是组件的主 Watcher，负责监听组件中的响应式数据变化。
  if (vm._watcher) {
    vm._watcher.teardown()
  }
  // _watchers 是组件所有的 Watcher 数组，包括主 Watcher 在内，存储了与组件的计算属性、侦听属性等相关联的其他 Watcher 实例。
  let i = vm._watchers.length
  while (i--) {
    vm._watchers[i].teardown()
  }

  // __ob__标识了一个对象的响应式特性，并管理依赖追踪和引用计数等功能，可通过vmCount--来释放对应的Observer对象
  if (vm._data.__ob__) {
    vm._data.__ob__.vmCount--
  }
  // 标记组件已被销毁
  vm._isDestroyed = true
  // 将当前虚拟节点_vnode 设置为null，触发当前渲染树的销毁
  vm.__patch__(vm._vnode, null)
  // 触发destroyed生命周期钩子
  callHook(vm, 'destroyed')
  // 关闭所有监听事件
  vm.$off()
  // 删除 __vue__ 引用
  // __vue__ 用来获取组件实例
  if (vm.$el) {
    vm.$el.__vue__ = null
  }
  // 解除循环引用
  if (vm.$vnode) {
    vm.$vnode.parent = null
  }
}
```

1. 检查是否正在销毁：
   - 首先，检查组件实例的 `_isBeingDestroyed` 属性，如果已经设置为 `true`，表示组件正在被销毁，直接返回，避免重复调用。
2. 调用 `beforeDestroy` 生命周期钩子：
   - 调用 `callHook(vm, 'beforeDestroy')`，触发组件实例的 `beforeDestroy` 生命周期钩子函数。
3. 设置 `_isBeingDestroyed` 属性为 `true`：
   - 将组件实例的 `_isBeingDestroyed` 属性设置为 `true`，表示组件正在被销毁。
4. 从父级中移除当前组件：
   - 获取父级组件实例，并检查父级组件是否正在被销毁，并且当前组件不是一个抽象组件。
   - 如果满足条件，从父级的 `$children` 数组中移除当前组件。
5. 销毁组件的 Watcher 监听：
   - 如果组件实例有一个 `_watcher`，调用其 `teardown` 方法，将其销毁。
   - 遍历组件实例的 `_watchers` 数组，逐个调用其 `teardown` 方法，销毁所有的 Watcher。
   - `teardown`方法的作用是从所有依赖向的Dep列表中将自己删除
6. 移除数据对象的引用：
   - 如果组件实例的 `_data` 存在 `__ob__` 属性，即存在 Observer 对象，将其 `vmCount` 属性减一。
   - 这是为了处理数据对象的引用计数，以确保在没有其他组件实例使用该数据对象时，将其释放。
7. 标记组件已销毁：
   - 将组件实例的 `_isDestroyed` 属性设置为 `true`，表示组件已经被销毁。
8. 调用 `__patch__` 方法：
   - 调用组件实例的 `__patch__` 方法，将当前组件实例的虚拟节点 `_vnode` 设置为 `null`，以触发对当前渲染树的销毁操作。
9. 调用 `destroyed` 生命周期钩子：
   - 调用 `callHook(vm, 'destroyed')`，触发组件实例的 `destroyed` 生命周期钩子函数。
10. 关闭所有监听事件：
    - 调用组件实例的 `$off` 方法，关闭所有的事件监听。
11. 删除 `__vue__` 引用：
    - 如果组件实例有 `$el` 属性，将其 `$el.__vue__` 引用设置为 `null`，解除引用关系。
12. 解除循环引用：
    - 如果组件实例有 `$vnode` 属性，将其 `$vnode.parent` 设置为 `null`，解除循环引用。

需要注意的是，销毁阶段的钩子函数在组件销毁的过程中是按照父组件到子组件的顺序依次调用的。这意味着，先销毁父组件的钩子函数会在子组件的钩子函数之前被调用。

## 总结

本小节介绍了Vue生命周期最后一个阶段，销毁阶段

我们知道当调用`$destroy`方法时会进入销毁阶段，在销毁阶段，Vue 会执行一系列操作来清理和释放组件相关的资源。包括触发生命周期钩子函数、移除父级组件引用、销毁 Watcher、解除引用关系和执行清理工作等操作。
