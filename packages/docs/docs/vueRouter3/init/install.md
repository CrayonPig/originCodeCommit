# 注册插件

上一小节，我们分析了`VueRouter`的初始化过程，直到初始化第一步就是注册插件。注册插件的调用代码很简单

```js
Vue.use(VueRouter);
```

我们之前分析Vue2 源码的时候，说过插件注册的方式是通过`Vue.use`调用插件内的`install`方法。也就是说，上述代码实际上就是调用了`VueRouter.install`方法，我们只要找到该方法，就可以找到它是在注册的时候做了哪些事情。

还记得上一节，我们找到源码最终入口的时候的代码么

```js
import { install } from './install'

export default class VueRouter {
  // ...
}

VueRouter.install = install
```

在这里，`install`方法被挂在到了`VueRouter`上，很明显，这就是我们想找的方法，找到`install`的定义

```js
export let _Vue

export function install (Vue) {
  // 防止重复注册
  if (install.installed && _Vue === Vue) return
  install.installed = true
  // 缓存Vue实例
  _Vue = Vue

  // 判断传入参数v是否定义过
  const isDef = v => v !== undefined

  /**
   * 将子组件实例注册到父组件实例
   * @param {*} vm  Vue 组件实例，即要注册的子组件实例
   * @param {*} callVal 可选参数，用于在注册时传递额外的数据
   */
  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode
    if (
      // 父组件的 VNode 是否存在
      isDef(i) && 
      // 父组件 VNode 的 data 属性是否存在
      isDef(i = i.data) && 
      // data 属性中是否定义了 registerRouteInstance 方法
      isDef(i = i.registerRouteInstance)
    ) {
      // 调用registerRouteInstance注册
      i(vm, callVal)
    }
  }

  // 将路由相关的逻辑混入到每个 Vue 组件实例中
  // 在 beforeCreate 钩子执行时，会初始化路由
  // 在 destroyed 钩子执行时，会卸载路由
  Vue.mixin({
    beforeCreate () {
      // 判断组件是否存在 router 对象，该对象只在根组件上有
      if (isDef(this.$options.router)) {
        // 设置根组件
        this._routerRoot = this
        // 设置vue router实例
        this._router = this.$options.router
        // 调用初始化方法
        this._router.init(this)
        // 将当前路由的状态作为组件实例的响应式属性，这样在路由切换时，组件会自动更新
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        // 非根组件则直接从父组件中获取
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      // 当前组件实例注册到父组件中
      registerInstance(this, this)
    },
    destroyed () {
      // 将当前组件从父组件中注销
      registerInstance(this)
    }
  })

  // 设置代理，当访问 this.$router 的时候，代理到 this._routerRoot._router
  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })

  // 设置代理，当访问 this.$route 的时候，代理到 this._routerRoot._route
  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })

  // 全局注册组件 router-link 和 router-view
  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)
  
  // router 的钩子函数都使用与 vue.created 一样的mixin 合并策略。
  const strats = Vue.config.optionMergeStrategies
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
```

代码不多，我们一起分析下上述代码做了哪些事情

1. 防止重复注册组件实例
2. 将路由相关的逻辑混入到每个 Vue 组件实例的`beforeCreate`和`destroyed`钩子函数中
3. 设置`$router`和`$route`的代理
4. 全局注册组件`router-link`和`router-view`
5. 设置路由的钩子函数与 `vue.created` 一样的 `mixin` 合并策略

这里需要注意的是，虽然我们在`new Vue`之前执行的`Vue.use`，但实际执行`Vue.mixin`的时机是在`new Vue`之后的

这里我们只需要记住组件注册的时候发生了什么事情就行，具体逻辑我们在后续分析，等不及的同学可以先看上述注释
