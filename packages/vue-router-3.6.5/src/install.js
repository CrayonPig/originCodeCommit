import View from './components/view'
import Link from './components/link'

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
