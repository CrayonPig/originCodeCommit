# 初始化阶段(new Vue)

通过前期准备我们找到了 Vue 的入口文件为 `src/core/instance/index.js`, 本节我们一起探究我们在执行 `new Vue` 的时候究竟发生了么，为了便于理解，分析代码时会省略一些无关的代码，比如 `process.env.NODE_ENV !== 'production'` 的条件判断

## new Vue 干了什么

```js
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}
```

可以看到，Vue的入口非常简单，执行代码只有一句

```js
this._init(options)
```

调用原型上的 `_init` 方法并且把初始化参数 `options` 传入。那就很奇怪了，上述代码中也没有 `_init` 的定义啊，这个方法是从哪里来的呢？实际上，在Vue 类的定义方法下，还有几行代码

```js
initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)
```

这几个方法会通过 `prototype` 向Vue 挂载大量的方法， `_init` 方法就是 `initMixin` 挂载上的，代码位于 `src/core/instance/init.js`，简化代码如下：

```js
export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this

    vm._isVue = true

    if (options && options._isComponent) {
      initInternalComponent(vm, options)
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }

    vm._self = vm
    // 初始化生命周期 为组件实例添加$parent、$root、$children、$refs等属性，并设置一些初始值，以便在组件的生命周期中进行正确的跟踪和管理。
    initLifecycle(vm)
    // 初始化组件实例的事件系统
    initEvents(vm)
    // 初始化组件实例的渲染相关属性和方法
    initRender(vm)
    // 调用beforeCreate生命周期
    callHook(vm, 'beforeCreate')
    // 在data/props之前，注入inject
    initInjections(vm) // resolve injections before data/props
    // 初始化 props、methods、data、computed、watch
    initState(vm)
    // 数据初始化完成后，调用provide传递数据
    initProvide(vm) // resolve provide after data/props
    // 调用created生命周期
    callHook(vm, 'created')

    if (vm.$options.el) {
      // 手动挂载（mount）一个 Vue 实例到 DOM 元素上。
      vm.$mount(vm.$options.el)
    }
  }
}
```

可以看到，`initMixin` 函数中只是在 `Vue` 原型上挂载了 `_init` 方法，我们稍后详细分析 `_init`的时候做了什么事情。

## 总结

由上述代码可知，`new Vue` 实质就是执行了Vue 原型上的`_init`方法。`_init`方法是由 `initMixin` 函数挂载的，`_init`方法执行了以下流程：

- `mergeOptions` 合并属性
- `initLifecycle` 初始化生命周期 为组件实例添加$parent、$root、$children、$refs等属性，并设置一些初始值，以便在组件的生命周期中进行正确的跟踪和管理。
- `initEvents` 初始化组件实例的事件系统
- `initRender` 初始化组件实例的渲染相关属性和方法
- `callHook(vm, 'beforeCreate')` 调用beforeCreate生命周期
- `initInjections` 在data/props之前，注入inject
- `initState` 初始化 props、methods、data、computed、watch
- `initProvide` 数据初始化完成后，调用provide传递数据
- `callHook(vm, 'created')` 调用created生命周期
- `vm.$mount(vm.$options.el)` 手动挂载（mount）一个 Vue 实例到 DOM 元素上。

接下来我们挨个分析，每一个步骤都做了什么操作
