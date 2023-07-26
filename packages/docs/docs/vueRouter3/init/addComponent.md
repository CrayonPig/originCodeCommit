# 使用组件

当插件注册完毕，实例初始化完毕，也把实例挂载到`Vue`实例上后，如何让路由生效呢？这就来到最后一步，使用组件

```html
<div id="app">
  <router-view />
</div>
```

在根组件中使用`<router-view />`，用于切换路由

本小节不讲`<router-view />`的具体实现，具体实现我们后续专门讲解。这里只探讨，当我们使用了这个组件，完成整个初始化的调用后会发生什么事情。

当进入根组件时，会触发`Vue Router`在`install`函数调用的`Vue.mixin`方法，并根据根组件生命周期触发对应的方法

```js
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
```

当根组件触发`beforeCreate`钩子函数时，`Vue Router`做了如下事情

1. 判断`this.$options.router`是否存在，如果存在就是根组件，这里判断依据是`new Vue`时有初始化参数`router`
2. 如果是根组件
   1. 保存根组件实例
   2. 将`VueRouter`实例挂载到当前实例上
   3. 调用`VueRouter`实例的`init`方法完成初始化
   4. 将当前路由的状态作为组件实例的响应式属性，这样在路由切换时，组件会自动更新
3. 如果不是根组件，则从父组件中获取，父组件在初始化的时候会从它的父组件获取，直到根组件为止
4. 调用`registerInstance`方法将当前组件实例注册到父组件中

当根组件触发`destroyed`钩子函数时，`Vue Router`做了如下事情

1. 用`registerInstance`方法将当前组件从父组件中注销

好了，那情况很明显了，我们只需要弄明白`init`和`registerInstance`两个方法就可以完成初始化的流程了。

## init

我们首先梳理`init`方法是在哪里定义的

```js
// 设置vue router实例
this._router = this.$options.router
// 调用初始化方法
this._router.init(this)
```

很明显，`init`方法就是`Vue Router`实例上的方法，那源码就很容易找到，在`src/router.js`

```js
init (app: any /* Vue component instance */) {

  // 将当前实例app存到实例列表中
  this.apps.push(app)

  // 增加 vue 的 destroyed 钩子函数
  app.$once('hook:destroyed', () => {
    // 查找实例列表中是否存在此实例
    const index = this.apps.indexOf(app)
    // 如果当前实例被记录到了 this.$router.apps 中, 就将其移除
    if (index > -1) this.apps.splice(index, 1)
    // 如果 this.app === app 表明在删除最后一个 vue 实例
    if (this.app === app) this.app = this.apps[0] || null
    // 如果 this.app 为 null，则表示所有 vue 实例都已经被销毁。所以需要销毁 history
    if (!this.app) this.history.teardown()
  })

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
```

`init`方法的逻辑不复杂，主要做了以下几件事

1. 将当前实例存到实例列表中
2. 增加 `vue` 的 `destroyed` 钩子函数，当实例被销毁时，从实例列表中删除此实例，如果删除完后实例列表中为空，代表根组件也被销毁了，则销毁`history`
3. 定义`this.app`只记录一次，使之永远是根组件的实例
4. 如果是浏览器的 `history` 或 `hash` 模式，则初始化滚动相关方法，这个我们后续单独讲
5. 最后监听路由变化，当路由变化时，将新的路由对象同步到所有 Vue 实例中，从而触发 Vue 的重新渲染，展示新的页面内容

## registerInstance

搞清楚`init`逻辑后，我们来看`registerInstance`方法

```js
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
```

这么看可能有点乱，我们把代码转换下

```js
const registerInstance = (vm, callVal) => {
  let i = vm.$options._parentVnode
  // 父组件的 VNode 是否存在
  if (isDef(i)) {
    const data = i.data 
    // 父组件 VNode 的 data 属性是否存在
    if(isDef(data)) {
      const registerRouteInstance = data.registerRouteInstance
      // data 属性中是否定义了 registerRouteInstance 方法
      if(isDef(registerRouteInstance)) {
        registerRouteInstance(vm, callVal)
      }
    }
  }
}
```

这样就很明显了，`registerInstance` 最终就是调用的`vm.$options._parentVnode.data.registerRouteInstance`。那这个方法是哪来的呢？这个方法是在`router-view`组件中被定义的，我们后续讲，这里只需要知道，这是完成了对`router-view`的挂载操作

所以知道为什么说，当我们使用了`router-view`组件，才能完成整个初始化的调用了吧。
