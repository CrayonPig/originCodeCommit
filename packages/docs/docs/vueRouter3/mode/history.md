# History模式

## 实例化

我们之前分析过，在`new VueRouter`的时候，通过判断传入的`mode`来判断最后初始化路由模式

```js
this.history = new HTML5History(this, options.base)
```

上述代码可以看出，初始化的时候，会创建一个`HTML5History`实例，将`this`和设定的基准路径`base`传入，我们找到`HTML5History`的定义

```js
// src/history/html5.js
export class HTML5History extends History {
  _startLocation: string
  // base 为基准地址
  constructor (router: Router, base: ?string) {
    super(router, base)
    // 拼接完整的初始地址
    this._startLocation = getLocation(this.base)
  }
}
```

可以看到，`HTML5History`继承自`History`，并且初始化的时候，先调用了`super`，传入了`router`和`base`，我们找到`History`的定义

```js
// src/history/base.js
export class History {
  // base 为基准地址
  constructor (router: Router, base: ?string) {
    this.router = router
    // 格式化base
    this.base = normalizeBase(base)
    // start with a route object that stands for "nowhere"
    // 创建当前路由为初始路由
    this.current = START
    // 即将导航到的目标路由信息
    this.pending = null
    // 是否已经准备就绪
    this.ready = false
    // 准备就绪的回调函数
    this.readyCbs = []
    // 准备失败时的回调函数
    this.readyErrorCbs = []
    // 出错时的回调函数
    this.errorCbs = []
    // 监听路由变化的回调函数
    this.listeners = []
  }
}
```

`History`中，先调用`normalizeBase`格式化了`base`，然后创建当前路由为初始路由`START`，并且定义了一些变量。

```js
// 格式化base
function normalizeBase (base: ?string): string {
  if (!base) {
    if (inBrowser) {
      //  <base> 规定页面上所有链接的默认 URL 和默认目标
      const baseEl = document.querySelector('base')
      base = (baseEl && baseEl.getAttribute('href')) || '/'
      // strip full URL origin
      // 去除URL origin
      base = base.replace(/^https?:\/\/[^\/]+/, '')
    } else {
      base = '/'
    }
  }
  // 确保base 开头是/
  if (base.charAt(0) !== '/') {
    base = '/' + base
  }
  // 删除尾部/
  return base.replace(/\/$/, '')
}
```

`normalizeBase`首先会判断`base`是否为空，如果为空，则根据浏览器环境来获取`base`，然后去除`base`的`origin`，只保留路径，最后将`base`开头加上`/`，删除尾部的`/`。

也就是说，当我传入的`base`是`/login/`时，最后处理完毕是`/login`。如果没传入，浏览器标签`<base>`有设置的情况下取后缀路径，否则就是默认`/`

```js
this.current = START

export const START = createRoute(null, {
  path: '/'
})
```

创建当前路由为初始路由`START`，实际上是调用`createRoute`方法，创建了一个`path`为`/`空的路由对象

`History`初始化完毕后，我们再回到`HTML5History`的定义，接下来，调用了`getLocation`方法，将`this.base`传入，注意，此时的`this.base`是已经被格式化后的基准路径

```js
// 拼接完整的初始地址
this._startLocation = getLocation(this.base)
```

到现在为止，`HTML5History`的实例化已经完毕，接下来我们看`Vue Router`执行`init`初始化的时候，`history`做了什么操作

## 初始化

这里的初始化，不是指`Vue Router`的初始化，而是之前我们分析的 `VueRouter` 中混入的 `beforeCreate`当中调用的`init`方法

```js
// src/router.js
init (app: any /* Vue component instance */) {
  // .......
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

这里分别调用了三个相关的方法`transitionTo`、`listen`、`setupListeners`，下面分别来看一下。

### transitionTo

`transitionTo`方法位于`History`的定义中，用于跳转路由，该方法接收三个参数，第一个参数是路由对象，第二个参数是成功和失败的回

```js
// src/history/base.js
/**
 * 
 * @param {*} route 
 * @param {*} onComplete 完成回调
 * @param {*} onAbort 中止回调
 * @returns 
 */
confirmTransition (route: Route, onComplete: Function, onAbort?: Function) {
  const current = this.current
  // 将目标路由设置为正在处理的路由
  this.pending = route
  // 处理导航过程中的错误
  const abort = err => {
    // changed after adding errors with
    // https://github.com/vuejs/vue-router/pull/3047 before that change,
    // redirect and aborted navigation would produce an err == null
    if (!isNavigationFailure(err) && isError(err)) {
      if (this.errorCbs.length) {
        // 如果有错误回调函数，则执行错误回调
        this.errorCbs.forEach(cb => {
          cb(err)
        })
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn(false, 'uncaught error during route navigation:')
        }
        console.error(err)
      }
    }
    onAbort && onAbort(err)
  }
  const lastRouteIndex = route.matched.length - 1
  const lastCurrentIndex = current.matched.length - 1
  // 检查当前路由是否与目标路由相同
  if (
    isSameRoute(route, current) &&
    // 处理由于动态添加路由导致的差异
    lastRouteIndex === lastCurrentIndex &&
    route.matched[lastRouteIndex] === current.matched[lastCurrentIndex]
  ) {
    // 相同路由导航，仅更新 URL 和哈希，然后中止导航并返回导航重复错误
    this.ensureURL()
    if (route.hash) {
      // 如果有hash，可能是锚点，跳转到对应位置
      handleScroll(this.router, current, route, false)
    }
    return abort(createNavigationDuplicatedError(current, route))
  }

  // 解析路由队列，确定要激活、更新和停用的组件
  const { updated, deactivated, activated } = resolveQueue(
    this.current.matched,
    route.matched
  )

  // 构建导航钩子队列
  const queue: Array<?NavigationGuard> = [].concat(
    // 组件内离开守卫
    extractLeaveGuards(deactivated),
    // 全局前置守卫
    this.router.beforeHooks,
    // 组件内更新守卫
    extractUpdateHooks(updated),
    // 配置的路由进入守卫
    activated.map(m => m.beforeEnter),
    // 异步组件的解析钩子函数
    resolveAsyncComponents(activated)
  )

  // 定义迭代执行导航钩子的函数
  const iterator = (hook: NavigationGuard, next) => {
    // 如果导航已取消，直接返回导航中止错误
    if (this.pending !== route) {
      return abort(createNavigationCancelledError(current, route))
    }
    try {
      // 执行导航守卫函数，并传入回调函数 next
      hook(route, current, (to: any) => {
        if (to === false) {
          // next(false) -> 中止导航并还原当前 URL
          this.ensureURL(true)
          abort(createNavigationAbortedError(current, route))
        } else if (isError(to)) {
          // next(err) -> 处理错误并还原当前 URL
          this.ensureURL(true)
          abort(to)
        } else if (
          typeof to === 'string' ||
          (typeof to === 'object' &&
            (typeof to.path === 'string' || typeof to.name === 'string'))
        ) {
          // next('/') 或 next({ path: '/' }) -> 重定向
          abort(createNavigationRedirectedError(current, route))
          if (typeof to === 'object' && to.replace) {
            // 如果重定向的是 replace 类型，则使用 replace 方法
            this.replace(to)
          } else {
            // 否则，使用 push 方法进行导航
            this.push(to)
          }
        } else {
          // 确认导航，继续执行下一个导航守卫
          next(to)
        }
      })
    } catch (e) {
      // 捕获导航守卫执行过程中的错误
      abort(e)
    }
  }

  // 执行导航钩子队列
  runQueue(queue, iterator, () => {
    // 等待异步组件解析完成后，提取组件内进入守卫
    const enterGuards = extractEnterGuards(activated)
    const queue = enterGuards.concat(this.router.resolveHooks)
    runQueue(queue, iterator, () => {
      // 如果导航已取消，返回导航中止错误
      if (this.pending !== route) {
        return abort(createNavigationCancelledError(current, route))
      }
      // 导航过程结束，清空 pending 标记，并执行导航完成回调
      this.pending = null
      onComplete(route)
      // 在 Vue 的下一个更新周期执行路由进入后的处理
      if (this.router.app) {
        this.router.app.$nextTick(() => {
          handleRouteEntered(route)
        })
      }
    })
  })
}
```

上述代码较长，我们梳理下整体逻辑

1. 将目标路由信息 `route` 设置为 `this.pending`，表示当前正在处理这个路由导航。
2. 判断当前路由 `current` 是否与目标路由 `route` 相同：
   - 如果两者相同，则说明是相同路由导航（例如，再次点击当前路由链接），则不执行导航操作，直接调用 `this.ensureURL()` 来确保 URL 的正确性，并返回一个导航重复错误 `createNavigationDuplicatedError`。
   - 如果两者不相同，继续进行下一步的导航操作。
3. 解析路由队列：
   使用 `resolveQueue` 方法来解析出需要激活的路由组件 (`activated`)、需要更新的路由组件 (`updated`) 以及需要停用的路由组件 (`deactivated`)。
4. 构建导航钩子队列：
   根据路由解析结果，构建一个由导航守卫函数组成的导航钩子队列 `queue`。这个队列包括以下类型的钩子函数：
   - 组件内离开守卫 (`deactivated` 组件)
   - 全局前置守卫 (`beforeHooks`)
   - 组件内更新守卫 (`updated` 组件)
   - 配置的路由进入守卫 (`beforeEnter`)
   - 异步组件的解析钩子函数 (`resolveAsyncComponents`)
5. 迭代执行导航钩子：
   使用 `runQueue` 方法来依次迭代执行导航钩子队列 `queue` 中的函数。这里的迭代过程会传入 `hook` 和 `next` 两个参数，`hook` 表示当前的导航守卫函数，`next` 是导航守卫函数执行完毕后的回调函数。在迭代过程中，如果发现 `this.pending` 已经变化，表示导航被取消，将会返回导航取消错误 `createNavigationCancelledError`。
6. 在迭代过程中，导航守卫函数 `hook` 中有多种可能的执行结果：
   - `next(false)`: 表示导航被中止，将会触发导航中止错误 `createNavigationAbortedError`。
   - `next('/')` 或 `next({ path: '/' })`: 表示进行重定向，将会触发导航重定向错误 `createNavigationRedirectedError`中止导航，然后执行 `this.push(to)` 或 `this.replace(to)` 来进行重定向操作。
   - `next(to)`: 表示继续导航，将执行 `next(to)` 来继续下一个导航守卫函数。
7. 在执行完所有导航守卫函数后，执行 `onComplete(route)`，表示导航过程已完成。
8. 如果 Vue Router 的实例 `this.router.app` 存在，表示是在 Vue 应用中使用 Vue Router，将在 Vue 的下一个更新周期调用 `handleRouteEntered(route)`，用于处理路由进入后的操作。

有些同学，可能对于判断当前路由 `current` 是否与目标路由 `route` 相同的逻辑不太明白，这里解释下

```js
const lastRouteIndex = route.matched.length - 1
const lastCurrentIndex = current.matched.length - 1
// 检查当前路由是否与目标路由相同
if (
  isSameRoute(route, current) &&
  // 处理由于动态添加路由导致的差异
  lastRouteIndex === lastCurrentIndex &&
  route.matched[lastRouteIndex] === current.matched[lastCurrentIndex]
) {
  // ...
}
```

1. `isSameRoute(route, current)`: 这是一个函数调用，用于检查两个路由是否相同。在 Vue Router 中，两个路由被认为是相同的，当且仅当它们具有相同的路径、参数和查询参数。如果两个路由相同，就表示导航到同一个路由，此时不需要进行实际的导航操作，只需更新 URL 和哈希部分即可。
2. `lastRouteIndex === lastCurrentIndex && route.matched[lastRouteIndex] === current.matched[lastCurrentIndex]`: 这部分代码主要是用于处理动态添加路由的情况。在 Vue Router 中，路由可以动态地添加到路由映射表中，这时可能会导致 `route.matched` 数组的长度与 `current.matched` 数组的长度不一致。

   - `lastRouteIndex`: 表示目标路由 `route` 的 `matched` 数组的最后一个索引。
   - `lastCurrentIndex`: 表示当前路由 `current` 的 `matched` 数组的最后一个索引。

   当两者的索引相同，并且 `route.matched[lastRouteIndex] === current.matched[lastCurrentIndex]` 时，表示目标路由 `route` 在动态添加路由之前和之后都能够找到匹配的路由配置，因此可以认为是同一个路由。在这种情况下，也不需要进行实际的导航操作，只需更新 URL 和哈希部分。

综合以上两个条件，当两个路由满足相同路由条件，并且目标路由在动态添加路由之前和之后都能找到匹配的路由配置时，就会进入这个条件分支，执行更新 URL 和哈希部分，并中止导航操作，返回导航重复错误。这样可以避免重复执行路由的激活和更新操作，提高导航的效率。

### listen

`listen` 方法位于`History`的定义中，用于注册一个回调函数，使之监听路由变化事件

```js
// src/history/base.js
listen (cb: Function) {
  this.cb = cb
}
```

代码如上，`listen` 方法会将传入的回调函数 `cb` 保存在 `this.cb` 属性中。在路由发生变化时，Vue Router 会调用这个回调函数，并将相关的路由信息传递给它，以便在回调函数中处理路由变化的逻辑。

### setupListeners

`setupListeners`方法位于`HTML5History`的定义中。这个方法用于设置路由变化的监听器，并在路由变化时触发相应的处理逻辑

```js
// src/history/html5.js
// 设置路由监听器，用于处理浏览器地址变化事件
setupListeners () {
  // 检查是否已设置监听器，避免重复设置
  if (this.listeners.length > 0) {
    return
  }
  // 当前 Vue Router 实例
  const router = this.router
  // 期望的滚动行为
  const expectScroll = router.options.scrollBehavior
  // 是否支持滚动行为
  const supportsScroll = supportsPushState && expectScroll

  // 添加滚动行为的监听器，如果支持滚动行为
  if (supportsScroll) {
    this.listeners.push(setupScroll())
  }

  // 定义处理路由变化事件的回调函数
  const handleRoutingEvent = () => {
    const current = this.current

    // Avoiding first `popstate` event dispatched in some browsers but first
    // history route not updated since async guard at the same time.
    // 获取当前地址信息
    const location = getLocation(this.base)

    // 避免处理浏览器首次 `popstate` 事件时，路由状态尚未更新
    if (this.current === START && location === this._startLocation) {
      return
    }

    // 进行路由转换
    this.transitionTo(location, route => {
      // 如果支持滚动行为，则处理滚动
      if (supportsScroll) {
        handleScroll(router, route, current, true)
      }
    })
  }
  
  // 添加 `popstate` 事件监听器，并将其添加到 listeners 数组中
  window.addEventListener('popstate', handleRoutingEvent)
  this.listeners.push(() => {
    window.removeEventListener('popstate', handleRoutingEvent)
  })
}
```

1. 检查是否已设置监听器：

   首先，检查当前的 `this.listeners` 数组是否已经有监听器。如果已经设置过监听器，则直接返回，避免重复设置。
2. 准备相关信息：

   获取当前 Vue Router 实例 `this.router`，并根据配置中的 `scrollBehavior` 期望值，判断是否支持滚动行为。如果浏览器支持推送状态（`supportsPushState` 为 `true`）并且 `scrollBehavior` 存在，则支持滚动行为。
3. 添加路由变化事件监听器：

   如果支持滚动行为，调用 `setupScroll()` 方法来设置滚动行为的监听器，并将其添加到 `this.listeners` 数组中。
4. 定义 `handleRoutingEvent` 方法：

   这个方法是处理路由变化事件的回调函数。在这个方法中，首先获取当前的路由状态 `this.current` 和当前地址 `location`，然后检查当前路由状态是否为初始化状态 `START`，同时比较当前地址和初始地址是否相同。如果相同，则表示浏览器发出的首个 `popstate` 事件，但路由状态尚未被更新，因此直接返回，不执行后续逻辑。

5. 添加 `popstate` 事件监听器：

   在这里，将 `handleRoutingEvent` 方法添加为 `popstate` 事件的回调函数，用于处理浏览器的前进、后退等操作。然后将这个监听器回调函数也添加到 `this.listeners` 数组中，以便在后续需要移除监听器时使用。

## 常见方法

分析完实例化和初始化后，我们分析下我们工作中一些常见的方法

### push

我们在开发中的调用的`router.push`方法，实际上就是`VueRouter`类中的`push`方法。这个方法用于执行路由的推入导航操作，即将用户导航到指定的目标路由

```js
// src/router.js
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
```

上述代码可以看出，`push`方法的实现主要依赖于`this.history.push`，该方法位于`HTML5History`的定义中

```js
push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
  const { current: fromRoute } = this
  this.transitionTo(location, route => {
    // 添加新路由地址到浏览器历史中
    pushState(cleanPath(this.base + route.fullPath))
    // 处理滚动相关
    handleScroll(this.router, route, fromRoute, false)
    // 执行成功回调
    onComplete && onComplete(route)
  }, onAbort)
}
```

在这个方法中，主要的操作是调用 `this.transitionTo()` 方法进行路由的过渡导航。`transitionTo` 方法会处理路由的匹配和组件渲染，并在导航完成后执行回调函数。这个方法将触发路由的变化，并处理浏览器地址的变化。

接着，`pushState()` 方法会使用 `HTML5 History API` 来将新的路由地址添加到浏览器历史记录中。这样用户就能通过浏览器的前进和后退按钮导航到不同的路由。

最后，在导航完成后，会执行 `handleScroll()` 方法来处理滚动行为，确保页面在切换路由后能够正确地滚动到指定位置。

其中`pushState`方法的定义在`src/util/push-state.js`中定义，有关`push`的部分代码如下

```js
// push 方式跳转新路径，会在 history 中记录。
export function pushState (url?: string) {
  // 保存当前页面滚动位置
  saveScrollPosition()
  // try...catch the pushState call to get around Safari
  // DOM Exception 18 where it limits to 100 pushState calls
  const history = window.history
  try {
    // 如果是跳转，使用 history 的 push 方法
    history.pushState({ key: setStateKey(genStateKey()) }, '', url)
  } catch (e) {
    // 如果抛出了异常，则表示栈已经到了最大值，不能push了。
    // 使用 location.assign 也可以用来跳转网址，且 assign 会添加记录到浏览历史，点击后退可以返回到之前页面。
    window.location.assign(url)
  }
}
```

很明显，`push`跳转的最终方法是调用了`window.history.pushState`方法进行跳转的

### replace

我们在开发中的调用的`router.replace`方法，调用的也是`VueRouter`类中的`replace`方法。这个方法用于执行的替换导航操作

```js
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
```

上述代码可以看出，`replace`方法的实现主要依赖于`this.history.replace`，该方法位于`HTML5History`的定义中

```js
replace (location: RawLocation, onComplete?: Function, onAbort?: Function) {
  const { current: fromRoute } = this
  this.transitionTo(location, route => {
    // 新的路由地址直接替换当前的浏览器历史记录
    replaceState(cleanPath(this.base + route.fullPath))
    // 处理滚动相关
    handleScroll(this.router, route, fromRoute, false)
    // 执行成功回调
    onComplete && onComplete(route)
  }, onAbort)
}
```

`replace`的实现跟`push`有些类似，唯一不同的是，改为调用的`replaceState`方法，我们继续看`replaceState`方法的定义

```js
// replace 方式跳转新路径，不会在 history 中记录
export function replaceState (url?: string) {
  pushState(url, true)
}
```

殊途同归，`replaceState`调用的最后还是`pushState`，有关`replace`的部分代码如下

```js
export function pushState (url?: string, replace?: boolean) {
  // 保存当前页面滚动位置
  saveScrollPosition()
  // try...catch the pushState call to get around Safari
  // DOM Exception 18 where it limits to 100 pushState calls
  const history = window.history
  try {
      // 保存之前 history 的 state
      const stateCopy = extend({}, history.state)
      stateCopy.key = getStateKey()
      history.replaceState(stateCopy, '', url)
  } catch (e) {
    window.location.replace(url)
  }
}
```

很明显，`push`跳转的最终方法是调用了`window.history.replaceState`方法，并且将当前历史的自定义数据传入后进行跳转的

### go

我们在开发中的调用的`router.go`方法，调用的也是`VueRouter`类中的`go`方法。这个方法用于在浏览器历史记录中移动

```js
go (n: number) {
  this.history.go(n)
}
```

上述代码可以看出，`back`方法的实现主要依赖于`this.history.go`，该方法位于`HTML5History`的定义中

```js
go (n: number) {
  window.history.go(n)
}
```

清晰明了，`go`方法就是依赖`window.history.go`实现的

### back

我们在开发中的调用的`router.back`方法，调用的也是`VueRouter`类中的`back`方法。这个方法用于执行浏览器回退操作

```js
back () {
  this.go(-1)
}
```

上述代码可以看出，`back`方法的实现主要依赖于`this.go`，该方法我们上面分析过，不赘述

## 总结

Vue Route 在`history`模式下，是利用浏览器原生提供的`API`，路由发生变更时，通过`history.pushState`和`history.replaceState`等方法来改变页面的`url`。

同时监听`popstate`方法，当使用浏览器前进后退按钮发生变更时，切换为对应的组件，从而实现整个页面路由的切换。
