# 导航守卫

官方称之为导航守卫，主要用来在路由发生变更时，触发的一系列钩子函数，我更愿意称之为路由守卫。

导航守卫的实现源码在我们之前介绍路由模式的时候提到过一个函数`confirmTransition`中。有忘记的同学可以返回看看。这里从整体角度介绍导航守卫的实现。

```js
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
```

首先构造一个队列 `queue`，它实际上是一个数组；然后再定义一个迭代器函数 `iterator`；最后再执行 `runQueue` 方法来执行这个队列。我们先来看一下 `runQueue` 的定义，在 `src/util/async.js` 中：

```js
export function runQueue(queue: Array<?NavigationGuard>, fn: Function, cb: Function) {
  // 定义一个递归函数 step，它接收一个 index 参数来指示当前执行的守卫索引
  const step = index => {
    // 如果 index 超出队列长度，说明所有守卫已执行完毕，调用回调函数 cb
    if (index >= queue.length) {
      cb();
    } else {
      // 如果 queue[index] 存在（即守卫存在）
      if (queue[index]) {
        // 调用传入的 fn 函数，并传递当前守卫（queue[index]）和一个回调函数
        // 这个回调函数作为参数传递给守卫函数，表示守卫函数执行完毕后的下一步操作
        fn(queue[index], () => {
          // 递归调用 step，继续执行下一个守卫
          step(index + 1);
        });
      } else {
        // 如果 queue[index] 不存在，直接执行下一个守卫
        step(index + 1);
      }
    }
  };

  // 从队列的第一个守卫开始执行
  step(0);
}
```

可以看到，`runQueue`函数的作用是按照队列中的顺序执行导航守卫函数，并在每个守卫执行完毕后继续执行下一个守卫，直到所有守卫都执行完毕后调用传入的回调函数。这样可以确保在导航过程中按照一定的顺序执行各种守卫逻辑。

`runQueue` 函数接收三个参数，第一个参数是队列，第二个参数是执行守卫的函数，第三个参数是执行完毕后的回调函数。

然后再看我们刚提到的`iterator`的函数，也就是`runQueue`第二个参数，执行守卫的函数

```js
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
```

- 函数首先检查当前的导航是否已经被取消。如果是，函数直接返回一个导航中止错误。
- 函数尝试执行导航守卫函数。如果导航守卫函数执行成功，函数会检查next函数的返回值。
  - 如果返回值为`false`，函数会中止导航并还原当前的URL，并返回一个导航中止错误。
  - 如果返回值为一个错误对象，函数会处理错误并还原当前的URL，并返回这个错误对象。
  - 如果返回值为一个字符串或一个包含`path`或`name`属性的对象，函数会重定向，并返回一个导航重定向错误。
  - 如果返回值为其他任何值，函数会确认导航，并继续执行下一个导航守卫。
- 如果在执行导航守卫函数的过程中发生错误，函数会捕获这个错误，并返回这个错误

最后，我们一起看`queue`导航队列是如何定义的

```js
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
```

上述导航队列包括以下类型的钩子函数：

- 组件内离开守卫 (`beforeRouteLeave`)
- 全局前置守卫 (`beforeEach`)
- 重用的组件里更新守卫 (`beforeRouteUpdate`)
- 配置的路由进入守卫 (`beforeEnter`)
- 异步组件的解析钩子函数

我们按照顺序，挨个分析这些钩子函数

## 组件内离开守卫

这一步是通过执行 `extractLeaveGuards(deactivated)`，先来看一下 `extractLeaveGuards` 的定义：

```js
function extractLeaveGuards (deactivated: Array<RouteRecord>): Array<?Function> {
  return extractGuards(deactivated, 'beforeRouteLeave', bindGuard, true)
}
```

它内部调用了 `extractGuards` 的通用方法，可以从 `RouteRecord` 数组中提取各个阶段的守卫：

```js
/**
 * 从路由记录数组中提取指定类型的路由守卫，并将它们绑定到实例上。
 * @param {Array<RouteRecord>} records - 路由记录数组
 * @param {string} name - 守卫的类型名称
 * @param {Function} bind - 绑定函数，用于将守卫绑定到实例上
 * @param {boolean} [reverse] - 是否逆序处理守卫
 * @returns {Array<?Function>} - 绑定后的路由守卫数组
 */
function extractGuards (
  records: Array<RouteRecord>,
  name: string,
  bind: Function,
  reverse?: boolean
): Array<?Function> {
  // 使用 flatMapComponents 函数提取组件中的守卫，并将它们绑定到实例上
  const guards = flatMapComponents(records, (def, instance, match, key) => {
    // 从组件定义中提取指定类型的守卫
    const guard = extractGuard(def, name)
    if (guard) {
      return Array.isArray(guard)
        // 如果守卫是数组，将每个守卫都绑定到实例上
        ? guard.map(guard => bind(guard, instance, match, key))
        // 如果守卫是单个函数，将它绑定到实例上
        : bind(guard, instance, match, key)
    }
  })
  // 根据 reverse 参数决定是否逆序处理守卫数组
  return flatten(reverse ? guards.reverse() : guards)
}
```

这里先使用了 `flatMapComponents` 方法去从 `records` 中获取所有的导航，它的定义在 `src/util/resolve-components.js` 中：

```js
/**
 * 将一个匹配的路由记录数组循环执行映射函数，输出扁平化的映射函数结果数组。
 * @param {Array<RouteRecord>} matched - 匹配的路由记录数组
 * @param {Function} fn - 映射函数，接收多个参数并返回一个函数
 * @returns {Array<?Function>} - 扁平化的函数数组
 */
export function flatMapComponents (
  matched: Array<RouteRecord>,
  fn: Function
): Array<?Function> {
  // 使用 flatten 函数将映射后的组件数组扁平化
  return flatten(matched.map(m => {
    return Object.keys(m.components).map(key => fn(
      m.components[key],
      m.instances[key],
      m, key
    ))
  }))
}

/**
 * 将一个嵌套的数组扁平化为一个一维数组。
 * @param {Array<any>} arr - 嵌套的数组
 * @returns {Array<any>} - 扁平化后的一维数组
 */
export function flatten (arr: Array<any>): Array<any> {
  return Array.prototype.concat.apply([], arr)
}
```

`flatMapComponents` 的作用就是返回一个数组，数组的元素是从 `matched` 里获取到所有组件的 `key`，然后返回 `fn` 函数执行的结果，`flatten` 作用是将一个嵌套的数组扁平化为一个一维数组。

对于 `extractGuards` 中 `flatMapComponents`所定义的映射函数`fn`，先通过 `extractGuard(def, name)` 获取到组件中对应 `name` 的导航守卫`guard`

```js
/**
 * 从组件定义中提取指定键的导航守卫。
 * @param {Object|Function} def - 组件定义对象或构造函数
 * @param {string} key - 要提取的守卫的键
 * @returns {NavigationGuard|Array<NavigationGuard>} - 提取的导航守卫
 */
function extractGuard (
  def: Object | Function,
  key: string
): NavigationGuard | Array<NavigationGuard> {
  // 如果 def 不是函数，将其转换为 Vue 组件构造函数
  if (typeof def !== 'function') {
    // 现在进行扩展，以便全局 mixins 能够生效
    def = _Vue.extend(def)
  }
  // 从组件选项中获取指定键的导航守卫
  return def.options[key]
}
```

获取到 `guard` 后，还会调用 `bind` 方法把组件的实例 `instance` 作为函数执行的上下文绑定到 `guard` 上，在这里`bind` 方法的对应的是 `bindGuard`

```js
/**
 * 将导航守卫绑定到特定实例上。
 * @param {NavigationGuard} guard - 要绑定的导航守卫
 * @param {_Vue} instance - 要绑定到的实例
 * @returns {?NavigationGuard} - 绑定后的导航守卫，如果没有传入实例则返回 null
 */
function bindGuard (guard: NavigationGuard, instance: ?_Vue): ?NavigationGuard {
  if (instance) {
    // 返回一个新的函数，该函数在调用时将 guard 应用在实例上
    return function boundRouteGuard () {
      return guard.apply(instance, arguments)
    }
  }
}
```

涉及到的方法分析完毕后，我们不难发现对于 `extractLeaveGuards(deactivated)` 而言，获取到的就是所有失活组件中定义的 `beforeRouteLeave` 钩子函数。

## 全局前置守卫

全局前置守卫直接调用的是`this.router.beforeHooks`，这实际上对应的是在`new Router`初始化中的`beforeEach`方法

```js
// src/router.js
// 注册全局前置守卫
beforeEach (fn: Function): Function {
  return registerHook(this.beforeHooks, fn)
}

// 将钩子函数添加到对应的消息队列，返回一个销毁方法
function registerHook (list: Array<any>, fn: Function): Function {
  list.push(fn)
  return () => {
    const i = list.indexOf(fn)
    if (i > -1) list.splice(i, 1)
  }
}
```

当用户使用 `router.beforeEach` 注册了一个全局守卫，就会往 `router.beforeHooks` 添加一个钩子函数，这样 `this.router.beforeHooks` 获取的就是用户注册的全局前置守卫`beforeEach`。

## 重用的组件里更新守卫

这一步调用的是`extractUpdateHooks(updated)`，我们先来看他的定义

```js
function extractUpdateHooks (updated: Array<RouteRecord>): Array<?Function> {
  return extractGuards(updated, 'beforeRouteUpdate', bindGuard)
}
```

很明显，跟 `extractLeaveGuards(deactivated)` 类似，`extractUpdateHooks(updated)` 获取到的就是所有重用的组件中定义的 `beforeRouteUpdate` 钩子函数。

## 路由进入守卫

执行 `activated.map(m => m.beforeEnter)`，获取的是在激活的路由配置中定义的 `beforeEnter` 函数

## 异步组件的解析钩子函数

我们在`VueRouter`中常见的异步组件加载的方式有如下几种：

```js
// 1. require 进行加载 
const component = (resolve) => require(['@/components/dynamicComponent'], resolve)
// 2. ES6 懒加载 
const component =  () => import('@/components/dynamicComponent', 'dynamic')
// 3. webpack require.ensure 懒加载 
const component =  (r) => require.ensure( [], () => r(require('@/components/dynamicComponent')), 'dynamic' ) 
```

可以看出，常用的异步组件的加载都是函数的形式，那么在`VueRouter`相关源码中，是这样的么？我们一起看下`resolveAsyncComponents`的实现

```js
// src/util/resolve-components.js

export function resolveAsyncComponents (matched: Array<RouteRecord>): Function {
  return (to, from, next) => {
    let hasAsync = false
    let pending = 0
    let error = null

    // matched 可能包含多个RouteRecord
    // 每个RouteRecord可能有多个component的定义
    // flatMapComponents的价值就是要处理所有
    flatMapComponents(matched, (def, _, match, key) => {
      // if it's a function and doesn't have cid attached,
      // assume it's an async component resolve function.
      // we are not using Vue's default async resolving mechanism because
      // we want to halt the navigation until the incoming component has been
      // resolved.
      if (typeof def === 'function' && def.cid === undefined) {
        hasAsync = true
        pending++

        // 加载成功回调，once防止重复执行
        const resolve = once(resolvedDef => {
          // 如果是 ES 模块，模块的 default 属性才是组件的定义
          if (isESModule(resolvedDef)) {
            resolvedDef = resolvedDef.default
          }
          // 规范化处理异步组件解析后的定义
          def.resolved = typeof resolvedDef === 'function'
            ? resolvedDef
            // 不是函数，说明是已经解析好的组件选项对象
            : _Vue.extend(resolvedDef)
          match.components[key] = resolvedDef
          pending--
          if (pending <= 0) {
            next()
          }
        })

        // 加载失败回调，once防止重复执行
        const reject = once(reason => {
          const msg = `Failed to resolve async component ${key}: ${reason}`
          process.env.NODE_ENV !== 'production' && warn(false, msg)
          if (!error) {
            error = isError(reason)
              ? reason
              : new Error(msg)
            next(error)
          }
        })

        let res
        try {
          // 调用加载函数
          res = def(resolve, reject)
        } catch (e) {
          reject(e)
        }
        if (res) {
          if (typeof res.then === 'function') {
            res.then(resolve, reject)
          } else {
            // new syntax in Vue 2.3
            // Vue2.3 之后 允许异步组件使用一个 component 字段来定义异步组件的加载方式
            const comp = res.component
            if (comp && typeof comp.then === 'function') {
              comp.then(resolve, reject)
            }
          }
        }
      }
    })

    if (!hasAsync) next()
  }
}
```

从上述代码可以看出`resolveAsyncComponents` 返回的是一个导航守卫函数，有标准的 `to`、`from`、`next` 参数。

它的内部实现很简单，利用了 `flatMapComponents` 方法从 `matched` 中获取到每个组件的定义，判断如果是异步组件，则执行异步组件加载逻辑，加载成功后会执行 `match.components[key] = resolvedDef` 把解析好的异步组件放到对应的 `components` 上，并且执行 `next` 函数。

在 `resolveAsyncComponents(activated)` 解析完所有激活的异步组件后，`queue`导航队列就执行完毕了，此时执行`runQueue`的第三个回调参数

```js
() => {
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
}
```

在这个回调函数中，共执行了三个路由守卫，我们逐步分析

1. 在被激活的组件里调用 `beforeRouteEnter`
2. 调用全局的 `beforeResolve` 守卫
3. 调用全局的 `afterEach` 钩子

## 在被激活的组件里调用 `beforeRouteEnter`

```js
const enterGuards = extractEnterGuards(activated)
```

在回调函数中第一句代码中，调用了`extractEnterGuards`函数

```js
// src/history/base.js
function extractEnterGuards (
  activated: Array<RouteRecord>
): Array<?Function> {
  // 从路由记录数组中提取 beforeRouteEnter 路由守卫，并将它们绑定到实例上。
  return extractGuards(
    activated,
    'beforeRouteEnter',
    (guard, _, match, key) => {
      return bindEnterGuard(guard, match, key)
    }
  )
}
```

`extractEnterGuards`调用了`extractGuards`函数，指定提取为`beforeRouteEnter`的路由守卫

## 调用全局的 `beforeResolve` 守卫

```js
const queue = enterGuards.concat(this.router.resolveHooks)
```

第二句代码中，将提取的`beforeRouteEnter`的路由守卫集合与`this.router.resolveHooks`合并，`this.router.resolveHooks`是谁呢？我们之前分析过

```js
// src/router.js

// 注册全局解析钩子
beforeResolve (fn: Function): Function {
  return registerHook(this.resolveHooks, fn)
}
```

由此可见，这里是获取了全局的 `beforeResolve` 守卫

## 调用全局的 `afterEach` 钩子

经过上述两步收集新的队列后，接下来还是使用`runQueue`执行

```js
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
```

执行完毕后，开始执行传入的`onComplete`函数，这里是`transitionTo`调用`this.confirmTransition`传入的

```js
// src/history/base.js
transitionTo (
  location: RawLocation,
  onComplete?: Function,
  onAbort?: Function
) {
  // ...
  this.confirmTransition(
    route,
    () => {
      this.updateRoute(route)
      onComplete && onComplete(route)
      this.ensureURL()
      this.router.afterHooks.forEach(hook => {
        hook && hook(route, prev)
      })

      // 执行ready回调
      if (!this.ready) {
        this.ready = true
        this.readyCbs.forEach(cb => {
          cb(route)
        })
      }
    },
    err => {
      if (onAbort) {
        onAbort(err)
      }
      if (err && !this.ready) {
        // Initial redirection should not mark the history as ready yet
        // because it's triggered by the redirection instead
        // https://github.com/vuejs/vue-router/issues/3225
        // https://github.com/vuejs/vue-router/issues/3331
        if (!isNavigationFailure(err, NavigationFailureType.redirected) || prev !== START) {
          this.ready = true
          this.readyErrorCbs.forEach(cb => {
            cb(err)
          })
        }
      }
    }
  )
}
```

`transitionTo`方法在之前讲述路由模式的时候已经介绍过，这里不再赘述其功能，这里需要注意的是，调用`confirmTransition`传入的回调函数中有一段代码

```js
this.router.afterHooks.forEach(hook => {
  hook && hook(route, prev)
})
```

很明显，这里是在执行钩子函数，`this.router.afterHooks`是谁呢？我们之前分析过

```js
// 注册全局后置钩子
afterEach (fn: Function): Function {
  return registerHook(this.afterHooks, fn)
}
```

由此可见，这里是获取了全局的 `afterEach` 守卫

## 总结

以上就是完整的路由守卫实现的过程，完整执行顺序如下：

1. 导航被触发。
2. 在失活的组件里调用 `beforeRouteLeave` 守卫。
3. 调用全局的 `beforeEach` 守卫。
4. 在重用的组件里调用 `beforeRouteUpdate` 守卫 (2.2+)。
5. 在路由配置里调用 `beforeEnter。`
6. 解析异步路由组件。
7. 在被激活的组件里调用 `beforeRouteEnter。`
8. 调用全局的 `beforeResolve` 守卫 (2.5+)。
9. 导航被确认。
10. 调用全局的 `afterEach` 钩子。
11. 触发 `DOM` 更新。
12. 调用 `beforeRouteEnter` 守卫中传给 `next` 的回调函数，创建好的组件实例会作为回调函数的参数传入。

