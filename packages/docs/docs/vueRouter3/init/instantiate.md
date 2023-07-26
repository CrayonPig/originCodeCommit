# 实例化

插件注册完成后，我们来到了第二步，实例化`VueRouter`，调用方式如下：

```js
const router = new VueRouter({
  mode: 'history',
  routes: [
    // ...
  ]
})
```

从上述代码中，我们可以看出，实例化时，主要就是调用了`new VueRouter`方法，我们之前讲入口的时候，已经知道了`VueRouter`的定义在`src/router.js`当中，这里我们先看`constructor`

```js
export default class VueRouter {
  constructor (options: RouterOptions = {}) {
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
}
```

上述代码不复杂，主要做了以下几件事情

1. 定义了一些内部变量，将初始化参数`options`赋值给`this.options`
2. 使用初始化参数`routes`调用`createMatcher`函数，创建路由匹配器，用于后续的路由查找和匹配
3. 根据初始化参数`mode`，判断路由模式
   1. 默认为`hash`模式
   2. 如果`mode`为`history`，并且当前环境支持`history.pushState`，则使用`history`模式，否则降级使用`hash`模式
   3. 如果不是浏览器环境，使用`abstract`模式
4. 根据匹配的路由模式创建对应的路由实例
