# 初始化阶段(initProvide)

`initProvide` 函数用于初始化组件的 provide。它获取组件实例的 `provide` 选项，并将其注册为 `_provided` 私有属性，以供子组件进行注入使用

```js
export function initProvide (vm: Component) {
  const provide = vm.$options.provide
  if (provide) {
    // 将provide注册为私有属性，如果是function则绑定当前组件为this
    vm._provided = typeof provide === 'function'
      ? provide.call(vm)
      : provide
  }
}
```

首先获取组件实例的 `provide` 选项。如果存在 `provide`，则将其注册为组件实例的 `_provided` 私有属性。

如果 `provide` 是一个函数，即提供一个动态的值，函数会在组件实例上下文中调用，绑定当前组件为 `this`，并将返回值赋给 `_provided`。

如果 `provide` 是一个静态值（对象、数组等），则直接赋给 `_provided`。
