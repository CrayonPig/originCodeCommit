# Hash模式

## 实例化

跟`history`模式一样，都是在`new VueRouter`的时候，通过判断传入的`mode`来判断最后初始化路由模式

```js
this.history = new HashHistory(this, options.base, this.fallback)
```

上述代码可以看出，初始化的时候，会创建一个`HashHistory`实例，将`this`、设定的基准路径`base`以及是否为降级成为的`hash`模式传入，我们找到`HashHistory`的定义

```js
// src/history/hash.js
export class HashHistory extends History {
  constructor (router: Router, base: ?string, fallback: boolean) {
    super(router, base)
    // 如果是降级来的，则重新生成降级的路径
    // 如 base 为 /user 当前路径为/user/admin 则重新生成路径为/user#/admin
    if (fallback && checkFallback(this.base)) {
      return
    }
    // 如果hash开头是/，则代表是hash模式的路由
    // 如果不是，则需要切换成hash模式的路由
    ensureSlash()
  }
}
```

跟`HTML5History`一样，都是继承自`History`，并且在初始化的时候进行的调用，这里就不赘述`History`的实现了。

紧接着，进行判断，是否为降级来的`hash`模式，如果是降级来的，当前路由可能不包含`#`，将当前路由进行调整

如果是降级来的，当前路由也包含`#`或者不是降级来的，检查当前路径是否符合`hash`模式的标准，不符合的进行调整

这里值得一提的是，如果不符合`hash`模式的标准时，会调用`replaceHash`方法去切换

```js
function replaceHash (path) {
  // 如果环境支持history，则使用replaceState跳转
  if (supportsPushState) {
    replaceState(getUrl(path))
  } else {
    // 不支持直接走replace方法
    window.location.replace(getUrl(path))
  }
}
```

这里会判断当前环境是否支持`window.history`，如果支持，则用到`replaceState`， 否则使用`window.location.replace`，这两种方式跳转的区别如下：

- `location.replace` 用于在浏览器中替换当前页面的 URL，立即加载新的 URL，但不会在浏览器历史中生成新的记录，因此用户不能通过后退按钮返回上一个页面。
- `history.replaceState` 用于修改当前浏览器历史记录的状态，不会触发页面的刷新或加载，允许无刷新更新页面状态，同时允许用户通过后退按钮返回上一个状态。

## 初始化

初始化时，`hash`模式跟`history`模式前面调用的方法都一样，都是继承`History`的方法，唯一不同的是`setupListeners`方法的实现

```js
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

  const handleRoutingEvent = () => {
    // 获取当前地址信息
    const current = this.current
    // 如果当前路径不符合hash模式，则直接进行替换并取消后续操作
    if (!ensureSlash()) {
      return
    }

    // 进行路由转换
    this.transitionTo(getHash(), route => {
      // 如果支持滚动行为，则处理滚动
      if (supportsScroll) {
        handleScroll(this.router, route, current, true)
      }
      // 不支持history，则使用location.replace跳转
      if (!supportsPushState) {
        replaceHash(route.fullPath)
      }
    })
  }
  // 支持history，使用history相关方法跳转，用popstate监听
  // 不支持history，使用location.replace跳转，用hashchange监听
  const eventType = supportsPushState ? 'popstate' : 'hashchange'
  window.addEventListener(
    eventType,
    handleRoutingEvent
  )
  this.listeners.push(() => {
    window.removeEventListener(eventType, handleRoutingEvent)
  })
}
```

1. 首先，这个方法检查是否已经设置了监听器，如果已经设置，则避免重复设置，直接返回，以防止重复注册事件监听器。

2. 获取当前 Vue Router 实例 `router` 和期望的滚动行为 `expectScroll`，这是在 Vue Router 的配置选项中定义的，用于控制路由切换时的滚动行为。

3. 确定是否支持滚动行为，并将结果存储在 `supportsScroll` 变量中。`supportsPushState` 是之前用来检查浏览器是否支持 `pushState` 的变量（在上一个问题中提到的），`expectScroll` 则检查是否设置了滚动行为。

4. 如果支持滚动行为，调用 `setupScroll()` 方法，并将其返回的滚动处理函数添加到 `this.listeners` 数组中。`setupScroll()` 方法的目的是设置滚动行为的监听器，以在路由切换时执行滚动。

5. 创建 `handleRoutingEvent` 函数，用于处理路由变化事件。当路由发生变化时，它将被调用。

6. `ensureSlash()` 方法检查当前路径是否符合 hash 模式，如果不符合，则进行替换并取消后续操作。`ensureSlash()` 的目的是确保当前页面的 URL 使用 hash 模式。

7. 执行路由转换，调用 `this.transitionTo()` 方法来实际处理路由的切换。在路由转换后，如果支持滚动行为，将调用 `handleScroll()` 方法来处理页面滚动。

8. 如果不支持 `pushState`，则使用 `location.replace` 方法进行跳转，而不是 `pushState` 方法。这里使用 `replaceHash()` 方法来完成对 URL 的替换。

9. 最后，根据是否支持 `pushState`，确定使用 `popstate` 事件或 `hashchange` 事件，并向 `window` 对象添加相应的事件监听器。然后，将处理路由事件的函数 `handleRoutingEvent` 添加到 `this.listeners` 数组中，以便后续可以移除这个监听器。这里通过 `window.removeEventListener` 来确保在不再需要监听器时将其移除。

## 常见方法

分析完实例化和初始化后，我们分析下我们工作中一些常见的方法

### push

`push`在`VueRouter`类中的的实现跟`history`模式是一致的，这里只分析不同的`this.history.push`的实现

```js
push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
  const { current: fromRoute } = this
  this.transitionTo(
    location,
    route => {
      // 添加新路由地址到浏览器历史中
      pushHash(route.fullPath)
      // 处理滚动相关
      handleScroll(this.router, route, fromRoute, false)
      // 执行成功回调
      onComplete && onComplete(route)
    },
    onAbort
  )
}
```

这里跟`history`模式不一样的地方在于`pushHash`的调用，对不支持`history`环境做了一层兼容

```js
function pushHash (path) {
  // 如果环境支持history，则使用pushState跳转
  if (supportsPushState) {
    pushState(getUrl(path))
  } else {
    // 直接修改hash
    window.location.hash = path
  }
}
```

### replace

同理，`replace`的方法不同点也是在于`this.history.replace`的实现

```js
replace (location: RawLocation, onComplete?: Function, onAbort?: Function) {
  const { current: fromRoute } = this
  this.transitionTo(
    location,
    route => {
      // 新的路由地址直接替换当前的浏览器历史记录
      replaceHash(route.fullPath)
      // 处理滚动相关
      handleScroll(this.router, route, fromRoute, false)
      // 执行成功回调
      onComplete && onComplete(route)
    },
    onAbort
  )
}
```

也是同样的`replaceHash`方法，上面分析过，不再赘述

### go

与`history`模式相同，不赘述

### back

与`history`模式相同，不赘述

## 总结

`hash`模式的整体实现跟`history`模式类似，不同的是，为了更好的用户体验，`hash`模式针对环境的不同，采用了不同的方式

- 支持`history`的环境中，与`history`模式一致
- 不支持`history`的环境中，通过`location.hash`和`location.replace`等方法改变页面的`url`。同时监听`hashchange`方法，当使用浏览器前进后退按钮发生变更时，切换为对应的组件，从而实现整个页面路由的切换

