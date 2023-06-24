# 初始化阶段(new Vue)

上一篇文章我们找到了 Vue 的入口文件为 `src/core/instance/index.js`, 本节我们一起探究我们在执行 `new Vue` 的时候究竟发生了么，为了便于理解，分析代码时会省略一些无关的代码，比如 `process.env.NODE_ENV !== 'production'` 的条件判断

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
    callHook(vm, 'created')

    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}
```

可以看到，`initMixin` 函数中只是在 `Vue` 原型上挂载了 `_init` 方法，接下来我们一起分析`_init`方法内究竟做了什么

## 合并属性

`_init`代码执行中，首先会对传入的`options` 进行操作

```js
if (options && options._isComponent) {
  initInternalComponent(vm, options)
} else {
  vm.$options = mergeOptions(
    resolveConstructorOptions(vm.constructor),
    options || {},
    vm
  )
}
```

首先判断 `options` 是否存在并且是否存在 `_isComponent` 属性，`_isComponent` 是Vue的私有属性，用于区分组件实例和根实例。所以在我们探究 `new Vue` 时，逻辑判断走的是else，这段代码相当于

```js
vm.$options = mergeOptions(
  resolveConstructorOptions(vm.constructor),
  options || {},
  vm
)
```

这里将`vm.constructor`，也就是`Vue.constructor`传入 `resolveConstructorOptions` 函数获取返回值，该代码同样位于 `src/core/instance/init.js`

```js
export function resolveConstructorOptions (Ctor: Class<Component>) {
  let options = Ctor.options
  if (Ctor.super) {
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      Ctor.superOptions = superOptions
      const modifiedOptions = resolveModifiedOptions(Ctor)
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}
```

`resolveConstructorOptions` 函数接受一个参数Ctor，表示构造函数。 并判断构造函数是否有super属性来确定该构造函数是否是一个Vue子类（继承自Vue），如果不是，则直接获取构造函数的原型上的options属性作为选项。很明显在`new Vue`时，`resolveConstructorOptions(vm.constructor)` 返回的就是 `Vue.options`。

那么 `Vue.options` 是什么呢，其实在 `src/core/index.js` 中的 `initGlobalAPI(Vue)` 我们就已经提前定义过这个值，`initGlobalAPI(Vue)`代码在
`src/core/global-api/index.js` 中

```js
export function initGlobalAPI (Vue: GlobalAPI) {
  // ...
  Vue.options = Object.create(null)

  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

  extend(Vue.options.components, builtInComponents)
  // ...
}
```

首先通过 `Vue.options = Object.create(null)` 创建一个空对象，然后遍历 `ASSET_TYPES`，`ASSET_TYPES` 的定义在 `src/shared/constants.js` 中：

```js
export const ASSET_TYPES = [
  'component',
  'directive',
  'filter'
]
```

所以上面遍历 ASSET_TYPES 后的代码相当于：

```js
Vue.options.components = {}
Vue.options.directives = {}
Vue.options.filters = {}
```

最后通过 `extend(Vue.options.components, builtInComponents)` 把一些内置组件扩展到 `Vue.options.components` 上，Vue 的内置组件目前 有`<keep-alive>`、`<transition>` 和`<transition-group>` 组件，这也就是为什么我们在其它组件中使用这些组件不需要注册的原因。
