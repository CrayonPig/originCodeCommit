# 初始化阶段(initLifecycle)

本小结介绍生命周期初始化阶段的第二个步骤，也是第一个初始化函数 `initLifecycle`。顾名思义，初始化生命周期函数。代码位于 `src/core/instance/lifecycle.js`。

```js
export function initLifecycle (vm: Component) {
  const options = vm.$options

  // locate first non-abstract parent
  let parent = options.parent
  // 如果存在父组件实例并且当前组件实例不是抽象组件（abstract为false）
  if (parent && !options.abstract) {
    // 当父组件实例是抽象组件且父组件实例的父组件存在时，执行循环体。保证最后找到的父组件不是抽象组件
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent
    }
    // 将当前组件加入到父组件中的列表中
    parent.$children.push(vm)
  }

  // 父组件实例
  vm.$parent = parent
  // 根组件实例
  vm.$root = parent ? parent.$root : vm

  // 子组件实例数组
  vm.$children = []
  // ref 引用对象
  vm.$refs = {}

  vm._watcher = null; // 渲染 watcher 实例
  vm._inactive = null; // 是否处于非激活状态
  vm._directInactive = false; // 是否直接处于非激活状态
  vm._isMounted = false; // 是否已挂载
  vm._isDestroyed = false; // 是否已销毁
  vm._isBeingDestroyed = false; // 是否正在销毁
}
```

::: tip

以 `$` 开头的属性是提供给用户使用的外部属性，以 `_` 开头的是提供给内部使用的内部属性。

:::

我们可以看到 `initLifecycle` 的代码并不复杂，只是在 Vue 实例上设置一些属性并提供默认值。

有意思的是挂载`$parent` 属性和 `$root` 属性，我们下面逐个分析

## $parent

```js
// locate first non-abstract parent
let parent = options.parent
// 如果存在父组件实例并且当前组件实例不是抽象组件（abstract为false）
if (parent && !options.abstract) {
  // 当父组件实例是抽象组件且父组件实例的父组件存在时，执行循环体。保证最后找到的父组件不是抽象组件
  while (parent.$options.abstract && parent.$parent) {
    parent = parent.$parent
  }
  // 将当前组件加入到父组件中的列表中
  parent.$children.push(vm)
}

// 父组件实例
vm.$parent = parent
```

::: tip 什么是抽象组件？
在 Vue 中，抽象组件是一种特殊的组件，它们不会被渲染成真实的 DOM 元素，而是作为功能性的包装组件存在，用于提供一些可复用的逻辑或行为。
:::

首先如果存在父组件实例并且当前组件实例不是抽象组件时，执行`while`，直到找到父组件不是抽象组件或者没有父组件为止。然后将其赋值给`vm.$parent`。这样确保在子组件中，可以通过`$parent`找到父组件。

将当前组件加入到父组件的列表中，后续在父组件中，就可以通过`$children`找到子组件。

## $root

挂载`$root`的方法很简单，只有一行代码

```js
// 根组件实例
vm.$root = parent ? parent.$root : vm
```

如果当前组件没有父组件，那么它自己就是根组件，它的`$root`属性还是它自己。而它的子组件的`$root`用的是`parent.$root`，相当于还是它自己，其孙组件的`$root`属性沿用其子组件的`$root`，一次类推。

我们可以发现，这其实就是一个自顶向下将根组件的`$root`依次传递给每一个子组件的过程。

## 总结

`initLifecycle` 函数功能并不复杂，只是对 Vue 实例进行一些属性的初始化。其中，最主要的是挂载 `$parent` 和 `$root` 属性，使得组件树中的每一个组件都可以通过 `$parent` 和 `$root` 访问到其相关的父组件和根组件。通过这些初始化，为 Vue 的生命周期的后续流程铺设了基础。




