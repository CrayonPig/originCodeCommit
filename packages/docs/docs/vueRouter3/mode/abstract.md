# Abstract模式

## 实例化

跟其他模式一样，都是在`new VueRouter`的时候，通过判断传入的`mode`来判断最后初始化路由模式

```js
this.history = new AbstractHistory(this, options.base)
```

上述代码可以看出，初始化的时候，会创建一个`AbstractHistory`实例，将`this`和设定的基准路径`base`，我们找到`AbstractHistory`的定义

```js
export class AbstractHistory extends History {
  index: number
  stack: Array<Route>

  constructor (router: Router, base: ?string) {
    super(router, base)
    // 路由的历史记录
    this.stack = []
    // 当前路由的索引
    this.index = -1
  }
}
```

跟`HTML5History`一样，都是继承自`History`，并且在初始化的时候进行的调用，这里就不赘述`History`的实现了。

接下来创建了两个变量，用于记录历史记录和当前的路由索引

## 初始化

在`abstract`模式下，初始化的时候没有做额外操作，只是加个了路由变化的回调。

## 常见方法

分析完实例化和初始化后，我们分析下我们工作中一些常见的方法

### push

`push`在`VueRouter`类中的的实现跟其他模式是一致的，这里只分析不同的`this.history.push`的实现

```js
push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
  this.transitionTo(
    location,
    route => {
      // 舍去当前索引之后的历史记录，将新路由添加到栈顶
      this.stack = this.stack.slice(0, this.index + 1).concat(route)
      // 更新索引
      this.index++
      onComplete && onComplete(route)
    },
    onAbort
  )
}
```

可以看到，执行`push`操作的时候，就是舍去当前索引之后的历史记录，将新路由添加到栈顶

有的同学可能有疑问，为什么不直接使用`this.stack.push(route)`方法添加呢？

这是因为，还存在`go`方法，当前索引可能不是栈的最顶端，当我们执行`push`操作后，所有在当前历史记录后面的记录都应该被忽略。

如果我们直接使用`this.stack.push(route)`，那么会直接把新的路由添加到历史记录栈的尾部，而忽略了可能存在的需要删除的历史记录，这样就可能导致历史记录错乱。因此，这里使用`this.stack = this.stack.slice(0, this.index + 1).concat(route)`而非`this.stack.push(route)`。

### replace

同理，`replace`方法的不同点也是在于`this.history.replace`的实现

```js
replace (location: RawLocation, onComplete?: Function, onAbort?: Function) {
  this.transitionTo(
    location,
    route => {
      // 用新的记录替换当前记录，并舍去后续历史记录
      this.stack = this.stack.slice(0, this.index).concat(route)
      onComplete && onComplete(route)
    },
    onAbort
  )
}
```

`replace`方法就很清晰了，直接用新的记录替换当前记录，并舍去后续历史记录

### go

`push`在`VueRouter`类中的的实现跟其他模式是一致的，这里只分析不同的`this.history.go`的实现

```js
go (n: number) {
  const targetIndex = this.index + n
  // 目标索引超出范围，不予处理
  if (targetIndex < 0 || targetIndex >= this.stack.length) {
    return
  }
  // 获取指向路由
  const route = this.stack[targetIndex]
  // 跳转
  this.confirmTransition(
    route,
    () => {
      const prev = this.current
      this.index = targetIndex
      this.updateRoute(route)
      // 触发跳转成功回调
      this.router.afterHooks.forEach(hook => {
        hook && hook(route, prev)
      })
    },
    err => {
      if (isNavigationFailure(err, NavigationFailureType.duplicated)) {
        this.index = targetIndex
      }
    }
  )
}
```

`go`的方法相比于`push`、`replace`方法，找到对应路由后，没有使用`transitionTo`包裹，直接使用`confirmTransition`跳转，这是因为`go`是对历史记录进行操作，已经有对应的`route`对象，不需要重新匹配，只需要按照对应的`route`对象进行切换组件即可

## 总结

`abstract`模式被设计为在没有浏览器API支持的环境下使用（例如服务器端渲染、React Native等）。在这种模式下，路由的改变并不会像在浏览器环境中那样体现在URL的变化中。所以在该模式的源码中，没有这部分的操作。

`abstract`模式通过对路由历史记录栈和索引的管理，实现路由的切换

- `push`方法，直接删除索引后续的历史记录，将新的路由添加到历史记录栈的顶端
- `replace`方法，用新的记录替换当前记录，并舍去后续历史记录
- `go`方法，找到历史记录中的`route`对象后，执行组件切换

