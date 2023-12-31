# 简介

生命周期是指在软件开发中，特定组件、对象或系统的存在和操作所经历的不同阶段或状态。

在 Vue.js 中，每个组件实例都有一个与之相关联的生命周期。这些生命周期钩子函数允许开发者在组件的不同生命周期阶段执行自定义的代码，以实现相应的功能或逻辑。常见的生命周期阶段包括组件的创建、挂载、更新和销毁等。

通过理解和利用组件的生命周期，开发者可以更好地控制组件的行为、管理数据和资源，并且在需要的时候执行相应的操作。这有助于编写可维护、可扩展的代码，并提供更好的用户体验。

本章我们从源码的角度来分析，Vue2的每个生命周期做了哪些事情

## 生命周期总览

- `beforeCreate`：在实例被创建之前调用。此时，实例的数据观测和事件机制尚未初始化。
- `created`：在实例创建完成后调用。此时，实例已完成数据观测，可以访问数据、方法和计算属性，但尚未挂载到 DOM 上。
- `beforeMount`：在实例挂载之前调用。在此阶段，模板已编译完成，但尚未将编译结果挂载到 DOM 中。
- `mounted`：在实例挂载完成后调用。此时，实例已经挂载到 DOM 上，可以进行 DOM 相关的操作。
- `beforeUpdate`：在数据更新之前调用。在此阶段，虚拟 DOM 已更新，但尚未重新渲染。
- `updated`：在数据更新后调用。此时，组件已重新渲染，DOM 已更新。
- `beforeDestroy`：在实例销毁之前调用。在这个阶段，实例仍然完全可用。
- `destroyed`：在实例销毁后调用。此时，实例已经被销毁，所有的事件监听器和子实例也被移除。

## 生命周期流程

从Vue2官网我们可以找到生命周期的流程图

![Vue2生命周期](@assets/vue2/lifecycle.jpg)

从该流程图中，我们可以发现，生命周期大致可以分为四个阶段

- 初始化阶段：在Vue实例上设置初始属性、事件和响应式数据。
- 模板编译阶段：将模板转换为可执行的渲染函数。
- 挂载阶段：将Vue实例挂载到指定的DOM元素上，即将模板渲染到真实的DOM中。
- 销毁阶段：从父组件中移除Vue实例，并取消对依赖的追踪和事件监听器的绑定。
