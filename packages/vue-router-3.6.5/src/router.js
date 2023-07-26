/* @flow */

import { install } from './install'
import { START } from './util/route'
import { assert, warn } from './util/warn'
import { inBrowser } from './util/dom'
import { cleanPath } from './util/path'
import { createMatcher } from './create-matcher'
import { normalizeLocation } from './util/location'
import { supportsPushState } from './util/push-state'
import { handleScroll } from './util/scroll'
import { isNavigationFailure, NavigationFailureType } from './util/errors'

import { HashHistory } from './history/hash'
import { HTML5History } from './history/html5'
import { AbstractHistory } from './history/abstract'

import type { Matcher } from './create-matcher'

export default class VueRouter {
  static install: () => void
  static version: string
  static isNavigationFailure: Function
  static NavigationFailureType: any
  static START_LOCATION: Route

  app: any
  apps: Array<any>
  ready: boolean
  readyCbs: Array<Function>
  options: RouterOptions
  mode: string
  history: HashHistory | HTML5History | AbstractHistory
  matcher: Matcher
  fallback: boolean
  beforeHooks: Array<?NavigationGuard>
  resolveHooks: Array<?NavigationGuard>
  afterHooks: Array<?AfterNavigationHook>

  constructor (options: RouterOptions = {}) {
    if (process.env.NODE_ENV !== 'production') {
      warn(this instanceof VueRouter, `Router must be called with the new operator.`)
    }
    // 用于记录第一个 vue 实例。也就是所有的 vue 实例的祖先
    this.app = null
    // 用于记录所有的 vue 实例
    this.apps = []
    // new VueRouter( options ) 的 options 参数
    this.options = options
    // 用于记录路由跳转前的钩子函数。这里面的钩子函数能拦截和改变路由跳转
    this.beforeHooks = []
    // 以用 router.beforeResolve 注册一个全局守卫。这和 router.beforeEach 类似，因为它在每次导航时都会触发，
    // 但是确保在导航被确认之前，同时在所有组件内守卫和异步路由组件被解析之后，解析守卫就被正确调用。
    this.resolveHooks = []
    // 用于记录路由跳转后的钩子函数。不能拦截路由跳转
    this.afterHooks = []
    /*
      createMatcher() 会通过这个函数将 route config 数据转化为 record.
      matcher 对象：{
        match,     //函数
        addRoute,  //函数 
        getRoutes, //函数
        addRoutes, //函数
      }
    */
    this.matcher = createMatcher(options.routes || [], this)
    /**
     * 以下代码就是处理 options.mode：
     * 1、根据当前运行环境，以及浏览器的型号版本来决定最终的 mode 值。
     *    如果不支持 html5 history, 就会降级为 hash 模式。
     *    如果不是浏览器环境，则会改为 abstract 模式。
     *
     * 2、根据 mode 创建对应的浏览历史history对象。
     *    this.$router.history = history;
     */
    // 默认使用hash模式
    let mode = options.mode || 'hash'
    // fallback 表示降级。
    // 如果当前环境不支持 html5 的 history 模式。那么就会退成为 hash 模式。
    this.fallback =
      mode === 'history' && !supportsPushState && options.fallback !== false
    if (this.fallback) {
      mode = 'hash'
    }
    // 非浏览器使用abstract模式
    if (!inBrowser) {
      mode = 'abstract'
    }
    this.mode = mode
    // options.base 为 location.pathname 基准地址
    switch (mode) {
      case 'history':
        this.history = new HTML5History(this, options.base)
        break
      case 'hash':
        this.history = new HashHistory(this, options.base, this.fallback)
        break
      case 'abstract':
        this.history = new AbstractHistory(this, options.base)
        break
      default:
        if (process.env.NODE_ENV !== 'production') {
          assert(false, `invalid mode: ${mode}`)
        }
    }
  }

  /**
  * 根据 raw 来匹配 route config，从而生成一个新的 route 对象
  * @param {RawLocation} raw 字符串形式的路径
  * @param {Route} current 当前的 route 实例
  * @param {Location} redirectedFrom 用于重定向的 redirectedFrom. 形式为: {  path:xxx, name:xxx, query: {}, params: {} }
  * @returns 
  */
  match (raw: RawLocation, current?: Route, redirectedFrom?: Location): Route {
    return this.matcher.match(raw, current, redirectedFrom)
  }

  /*
   * 获取当前的 route 对象。 相当于在 vue 页面的 this.$route
   */
  get currentRoute (): ?Route {
    return this.history && this.history.current
  }

  /*
    init()； 
    (1) 可以理解为每次 vue 实例创建时，对于 vue-router 的初始化。
    (2) 以及当第一个 vue 实例创建之后, 开始导航初始化工作。

    这个方法是在当 vue 实例被创建时，被 VueRouter.install() 中混入的 beforeCreate() 方法中执行的。第一个参数 app，表示当前正在创建的 vue 实例。
  */
  init (app: any /* Vue component instance */) {
    // 如果不是生产环境，判断 install.installed 是否已经有标记。表明 Vue.use(VueRouter) 是否执行过。
    process.env.NODE_ENV !== 'production' &&
      assert(
        install.installed,
        `not installed. Make sure to call \`Vue.use(VueRouter)\` ` +
          `before creating root instance.`
      )
    // 将当前实例app存到实例列表中
    this.apps.push(app)

    // set up app destroyed handler
    // https://github.com/vuejs/vue-router/issues/2639
    // 增加 vue 的 destroyed 钩子函数
    app.$once('hook:destroyed', () => {
      // clean out app from this.apps array once destroyed
      // 查找实例列表中是否存在此实例
      const index = this.apps.indexOf(app)
      // 如果当前实例被记录到了 this.$router.apps 中, 就将其移除
      if (index > -1) this.apps.splice(index, 1)
      // ensure we still have a main app or null if no apps
      // we do not release the router so it can be reused
      // 如果 this.app === app 表明在删除最后一个 vue 实例
      if (this.app === app) this.app = this.apps[0] || null
      // 如果 this.app 为 null，则表示所有 vue 实例都已经被销毁。所以需要销毁 history
      if (!this.app) this.history.teardown()
    })

    // main app previously initialized
    // return as we don't need to set up new history listener
    // 如果 this.app 有值，则直接返回。则 this.app 代表记录根 vue 实例
    if (this.app) {
      return
    }
    // 如果 this.app 不存在，则指向 app 实例
    this.app = app
    // 获取 this.$router mode 对应的 history 对象
    const history = this.history
    // 如果是浏览器的 history 或 hash 模式
    if (history instanceof HTML5History || history instanceof HashHistory) {
      // 操作初始化滚动 
      // routeOrError 表示要跳转的 route
      const handleInitialScroll = routeOrError => {
        // 表示即将要跳出的 route
        const from = history.current
        // 期望滚动的函数
        const expectScroll = this.options.scrollBehavior
        // 如果mode=history，且当前浏览器支持 h5 history， 则表示支持期望滚动函数
        const supportsScroll = supportsPushState && expectScroll
        // routeOrError 存在 fullPath 属性， 且 supportsScroll 函数存在
        if (supportsScroll && 'fullPath' in routeOrError) {
          handleScroll(this, routeOrError, from, false)
        }
      }
      // 如果跳转成功，则传递的参数为 route
      // 如果跳转失败，则传递的参数为 error
      const setupListeners = routeOrError => {
        history.setupListeners()
        handleInitialScroll(routeOrError)
      }
      /**
       * 此次的跳转是针对浏览器地址栏上的 url 进行跳转。
       * 地址栏可能是根路径: http://localhost:8080/；也可能是某个网页的路径 http://localhost:8080/user/info;
       */
      history.transitionTo(
        // 获取浏览器地址栏上的 url。
        // history.getCurrentLocation()： 返回的是访问地址字符串
        history.getCurrentLocation(),
        // 路径跳转成功的回调
        setupListeners,
        // 路径跳转失败的回调
        setupListeners
      )
    }

    // 在路由变化时，将新的路由对象同步到所有 Vue 实例中，从而触发 Vue 的重新渲染，展示新的页面内容
    history.listen(route => {
      this.apps.forEach(app => {
        app._route = route
      })
    })
  }
  // 注册全局前置守卫
  beforeEach (fn: Function): Function {
    return registerHook(this.beforeHooks, fn)
  }
  // 注册全局解析钩子
  beforeResolve (fn: Function): Function {
    return registerHook(this.resolveHooks, fn)
  }
  // 注册全局后置钩子
  afterEach (fn: Function): Function {
    return registerHook(this.afterHooks, fn)
  }
  // 注册路由初始化完成时的回调通知 
  onReady (cb: Function, errorCb?: Function) {
    this.history.onReady(cb, errorCb)
  }
  
  // 注册路由报错时的回调通知 
  onError (errorCb: Function) {
    this.history.onError(errorCb)
  }
  // 跳转到新的页面
  push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    // $flow-disable-line
    if (!onComplete && !onAbort && typeof Promise !== 'undefined') {
      return new Promise((resolve, reject) => {
        this.history.push(location, resolve, reject)
      })
    } else {
      this.history.push(location, onComplete, onAbort)
    }
  }
  // 重定向到新的页面。replace 会替换掉当前页面所在的浏览器历史记录
  replace (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    // $flow-disable-line
    if (!onComplete && !onAbort && typeof Promise !== 'undefined') {
      return new Promise((resolve, reject) => {
        this.history.replace(location, resolve, reject)
      })
    } else {
      this.history.replace(location, onComplete, onAbort)
    }
  }
  // 具体规则参考 html5 history 的 go() 函数。
  go (n: number) {
    this.history.go(n)
  }
  // 回退到上一页。
  back () {
    this.go(-1)
  }
  // 历史记录前进一页
  forward () {
    this.go(1)
  }
  // 获取匹配到的组件数组
  getMatchedComponents (to?: RawLocation | Route): Array<any> {
    const route: any = to
      ? to.matched
        ? to
        // 根据 to 的路径参数，创建一个新的 route 对象
        : this.resolve(to).route
      : this.currentRoute
    /**
     * 上述代码等同于
     *  let route;
     *  if(to){
     *   router = to.matched ? to : this.resolve(to).route
     *  } else {
     *   router = this.currentRoute
     *  }
     */
    // 如果 route 不存在，则返回空数组
    if (!route) {
      return []
    }
    // 如果 route 存在，则返回 route 对应的 record 数组中的每一个 component。
    return [].concat.apply(
      [],
      route.matched.map(m => {
        /**
         * 我们配置 compnents 有几种形式：
         * 形式1:  component: User
         * 形式2:  component: import("xxxxxx")
         * 形式3:  components: { default: import("xxxx") }
         * 形式4:  components: { default: import("xxxx"), a: xxx, b:xxx }
         * 所以通过 map() 来拷贝每个 route config 中的 components 属性对象。
         */
        return Object.keys(m.components).map(key => {
          return m.components[key]
        })
      })
    )
  }
  // 解析给定的路由路径并返回相应的路由对象
  resolve (
    to: RawLocation,
    current?: Route,
    append?: boolean
  ): {
    location: Location,
    route: Route,
    href: string,
    // for backwards compat
    normalizedTo: Location,
    resolved: Route
  } {
    // 如果 current 这个 route 不存在，则获取当前的路由 route 对象
    current = current || this.history.current
    // 将 to 对象转成标准的 { path:xxx, name:xxx, query:xxx, params:xxx } 的形式。
    const location = normalizeLocation(to, current, append, this)
    // 根据路径匹配相关配置，然后创建一个新的 route 对象
    const route = this.match(location, current)
    // 获取全路径（这个路径是替换完了动态参数的路径。）
    const fullPath = route.redirectedFrom || route.fullPath
    // 获取路由的基准路径
    const base = this.history.base
    // 完整的 url
    const href = createHref(base, fullPath, this.mode)
    return {
      location,
      route,
      href,
      // for backwards compat
      normalizedTo: location,
      resolved: route
    }
  }
  // 返回用户所有的路由配置信息
  getRoutes () {
    return this.matcher.getRoutes()
  }

  /**
  * 动态增加路由
  * @param {string | RouteConfig} parentOrRoute parentOrRoute，可以是父路由的 name 值； 也可以是要新添加的路由数据对象
  * @param {RouteConfig} route 要新添加的路由数据对象
  */
  addRoute (parentOrRoute: string | RouteConfig, route?: RouteConfig) {
    // 将 route config 数据转换成为 record 对象，然后被添加到 parent record 中
    this.matcher.addRoute(parentOrRoute, route)
    // 如果当前路由状态不是初始状态
    if (this.history.current !== START) {
      // 切换到当前路由
      this.history.transitionTo(this.history.getCurrentLocation())
    }
  }
  // 批量增加路由
  addRoutes (routes: Array<RouteConfig>) {
    if (process.env.NODE_ENV !== 'production') {
      warn(false, 'router.addRoutes() is deprecated and has been removed in Vue Router 4. Use router.addRoute() instead.')
    }
    this.matcher.addRoutes(routes)
    if (this.history.current !== START) {
      this.history.transitionTo(this.history.getCurrentLocation())
    }
  }
}
// 将钩子函数添加到对应的消息队列，返回一个销毁方法
function registerHook (list: Array<any>, fn: Function): Function {
  list.push(fn)
  return () => {
    const i = list.indexOf(fn)
    if (i > -1) list.splice(i, 1)
  }
}


/**
 * 创建一个 href 跳转路径
 * @param {string} base  base 基础路径
 * @param {string} fullPath 完整路径
 * @param {string} mode 路由模式
 * @returns 完整的路由地址
 */
function createHref (base: string, fullPath: string, mode) {
  // 如果是hash模式，那么 fullPath 是指 hash 地址。
  // 如果是history模式，那么 fullPath 就是 location.pathname 部分。
  var path = mode === 'hash' ? '#' + fullPath : fullPath
  // 拼接完整路径
  return base ? cleanPath(base + '/' + path) : path
}

// We cannot remove this as it would be a breaking change
VueRouter.install = install
VueRouter.version = '__VERSION__'
VueRouter.isNavigationFailure = isNavigationFailure
VueRouter.NavigationFailureType = NavigationFailureType
VueRouter.START_LOCATION = START

// -- 我们使用 spa 应用， Vue 是没有挂到 window 上的。
// 如果在浏览器中，且将 Vue 挂在到了 window 上。
if (inBrowser && window.Vue) {
  // 走 vueRouter 的 install 流程
  window.Vue.use(VueRouter)
}
