# 生命周期相关的方法

与生命周期相关的实例方法有4个，分别是`vm.$mount`、`vm.$forceUpdate`、`vm.$nextTick`和`vm.$destory`。

`$forceUpdate`和`$destroy`方法是在`lifecycleMixin`函数中挂载到Vue原型上的

```js
// src/core/instance/lifecycle.js

export function lifecycleMixin (Vue) {
  Vue.prototype.$forceUpdate = function () {}
  Vue.prototype.$destroy = function (fn) {}
}
```

`$nextTick`方法是在`renderMixin`函数中挂载到Vue原型上的

```js
// src/core/instance/render.js

export function renderMixin (Vue) {
  Vue.prototype.$nextTick = function (fn) {}
}
```

`$mount`方法是在跨平台的代码中挂载到Vue原型上的

## $mount

### 用法回顾

在介绍方法的内部原理之前，我们先根据官方文档示例回顾一下它的用法。

```javascript
vm.$mount( [elementOrSelector] )
```

- **参数**：

  - `{Element | string} [elementOrSelector]`
  - `{boolean} [hydrating]`

- **返回值**：`vm` - 实例自身

- **作用**：

  如果 `Vue` 实例在实例化时没有收到 el 选项，则它处于“未挂载”状态，没有关联的 DOM 元素。可以使用 `vm.$mount()` 手动地挂载一个未挂载的实例。

  如果没有提供 `elementOrSelector` 参数，模板将被渲染为文档之外的的元素，并且你必须使用原生 `DOM API `把它插入文档中。

  这个方法返回实例自身，因而可以链式调用其它实例方法。

### 内部原理

关于该方法的内部原理在介绍**生命周期篇的模板编译阶段**中已经详细分析过，此处不再重复。

## $forceUpdate

### 用法回顾

在介绍方法的内部原理之前，我们先根据官方文档示例回顾一下它的用法。

```javascript
vm.$forceUpdate()
```

- **作用**：

  迫使 `Vue` 实例重新渲染。注意它仅仅影响实例本身和插入插槽内容的子组件，而不是所有子组件。

### 内部原理

重新渲染的实现原理并不难，Vue的自动渲染通过变化侦测来侦测数据，也就是当数据发生变化的时候，Vue实例会重新渲染。

在之前介绍数据变化的侦测的的时候，我们说过，执行实例`watcher`的`update`方法，就可以让实例重新渲染，所以`$forceUpdate`源码如下

```js
// src/core/instance/lifecycle.js

Vue.prototype.$forceUpdate = function () {
  const vm: Component = this
  if (vm._watcher) {
    vm._watcher.update()
  }
}
```

当前实例的`_watcher`属性就是该实例的`watcher`，所以要想让实例重新渲染，我们只需手动的去执行一下实例`watcher`的`update`方法即可。

## $destory

### 用法回顾

在介绍方法的内部原理之前，我们先根据官方文档示例回顾一下它的用法。

```javascript
vm.$destroy()
```

- **用法**：

  完全销毁一个实例。清理它与其它实例的连接，解绑它的全部指令及事件监听器。

  触发 `beforeDestroy` 和 `destroyed` 的钩子。

### 内部原理

关于该方法的内部原理在介绍**生命周期篇的销毁阶段**中已经详细分析过，此处不再重复。

## $nextTick

`vm.$nextTick` 是全局 `Vue.nextTick` 的**别名**，其用法相同。

### 用法回顾

在介绍方法的内部原理之前，我们先根据官方文档示例回顾一下它的用法。

```javascript
vm.$nextTick( [callback] )
```

- **参数**：

  - `{Function} [callback]`

- **用法**：

  将回调延迟到下次 DOM 更新循环之后执行。在修改数据之后立即使用它，然后等待 DOM 更新。它跟全局方法 `Vue.nextTick` 一样，不同的是回调的 `this` 自动绑定到调用它的实例上。

  > 2.1.0 起新增：如果没有提供回调且在支持 Promise 的环境中，则返回一个 Promise。请注意 Vue 不自带 Promise 的 polyfill，所以如果你的目标浏览器不是原生支持 Promise (IE：你们都看我干嘛)，你得自行 polyfill。

从上面的官方文档对`$nextTick`方法的介绍中我们似乎还是不能理解该方法的作用，那么我们举个例子看一下，如下：

```vue
<template>
  <div id="example">{{message}}</div>
</template>
<script>
  var vm = new Vue({
    el: '##example',
    data: {
      message: '123'
    }
  })
  vm.message = 'new message' // 更改数据
  console.log(vm.$el.innerHTML) // '123'
  Vue.nextTick(function () {
    console.log(vm.$el.innerHTML) // 'new message'
  })
</script>
```

在上面例子中，当我们更新了`message`的数据后，立即获取`vm.$el.innerHTML`，发现此时获取到的还是更新之前的数据：123。但是当我们使用`nextTick`来获取`vm.$el.innerHTML`时，此时就可以获取到更新后的数据了。这是为什么呢？

这里就涉及到`Vue`中对`DOM`的更新策略了，`Vue` 在更新 `DOM` 时是**异步**执行的。只要侦听到数据变化，`Vue` 将开启一个事件队列，并缓冲在同一事件循环中发生的所有数据变更。如果同一个 `watcher` 被多次触发，只会被推入到事件队列中一次。这种在缓冲时去除重复数据对于避免不必要的计算和 `DOM` 操作是非常重要的。然后，在下一个的事件循环`tick`中，`Vue` 刷新事件队列并执行实际 (已去重的) 工作。

在上面这个例子中，当我们通过 `vm.message = 'new message'`更新数据时，此时该组件不会立即重新渲染。当刷新事件队列时，组件会在下一个事件循环`tick`中重新渲染。所以当我们更新完数据后，此时又想基于更新后的 `DOM` 状态来做点什么，此时我们就需要使用`Vue.nextTick(callback)`，把基于更新后的`DOM` 状态所需要的操作放入回调函数`callback`中，这样回调函数将在 `DOM` 更新完成后被调用。

OK，现在大家应该对`nextTick`是什么、为什么要有`nextTick`以及怎么使用`nextTick`有个大概的了解了。那么问题又来了，`Vue`为什么要这么设计？为什么要异步更新`DOM`？这就涉及到另外一个知识：`JS`的运行机制。

### JS的运行机制

我们都知道，`JavaScript` 是单线程且非阻塞的脚本语言，也就是说，`JavaScript` 在执行的时候，永远只有一个主线程来处理所有的任务。非阻塞是指当前代码需要处理异步任务时，主线程会挂起(`pending`)这个任务，当异步任务处理完成后，主线程再根据一定的规则去执行相应的回调。

这整个执行流程，我们称之为事件循环机制，事件循环大概可以分为以下几步：

1. `主线程`执行同步任务：`主线程`按照代码顺序执行同步任务
2. `主线程`遇到异步任务：`主线程`遇到异步任务时，`主线程`调用浏览器或宿主环境提供的异步API处理。`主线程`继续顺序执行，当异步API将异步任务完成时，会将相应的回调函数添加到任务队列（`task queue`）中。任务队列中的任务(`task`)分为两种
  1. `微任务(micro task）`有`MutationObsever`、`Promise`、`Object.observer`、`process.nextTick`
  2. `宏任务(macro task)`有 `setTimeout`、`setInterval`、`MessageChannel`、`postMessage`、`setImmediate`、`I/O`、`UI交互事件`、`requestAnimationFrame`
3. 处理微任务：完成所有同步任务后，`主线程`执行任务队列中所有的微任务，直到全部微任务执行完毕，
4. DOM渲染: `主线程`检查是否需要进行`DOM渲染`，并执行渲染
5. 处理一个宏任务： `主线程`从任务队列中取出一个宏任务执行，宏任务中如果有涉及`DOM`的操作，会在宏任务执行期间被合并，最终在该宏任务执行完毕前完成，从而避免多次触发渲染操作。
6. 处理微任务和宏任务时，会遇到新的同步任务和异步任务，又会触发新的事件循环，也就是重复以上步骤，直到任务队列中所有的任务都执行完毕

如果对这个流程不太理解，可以通过这个[网站](http://latentflip.com/loupe/?code=JC5vbignYnV0dG9uJywgJ2NsaWNrJywgZnVuY3Rpb24gb25DbGljaygpIHsKICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gdGltZXIoKSB7CiAgICAgICAgY29uc29sZS5sb2coJ1lvdSBjbGlja2VkIHRoZSBidXR0b24xIScpOyAgCiAgICAgICAgdmFyIGEgPSAxCiAgICAgICAgY29uc29sZS5sb2coYSkKICAgIH0sIDIwMDApOwp9KTsKCmNvbnNvbGUubG9nKCJIaSEiKTsKCnNldFRpbWVvdXQoZnVuY3Rpb24gdGltZW91dCgpIHsKICAgIGNvbnNvbGUubG9nKCJDbGljayB0aGUgYnV0dG9uISIpOwp9LCA1MDAwKTsKCmNvbnNvbGUubG9nKCJXZWxjb21lIHRvIGxvdXBlLiIpOw%3D%3D!!!PGJ1dHRvbj5DbGljayBtZSE8L2J1dHRvbj4%3D) 来体验下

### 内部原理

通过了解上述事件循环机制后，我们知道`DOM渲染`会在两个情况下执行：

1. 处理完微任务后
2. 在当前宏任务执行完成前

所以，如果当我们需要在下次 `DOM渲染`完成后触发回调，只能在上述两种情况中完成。

Vue 中实现`nextTick`，做了两件事

1. 能力检测
2. 根据能力检测以不同方式执行回调队列

#### 能力检测

由于宏任务耗费的时间是大于微任务的，所以在浏览器支持的情况下，优先使用微任务。如果浏览器不支持微任务，使用宏任务；但是，各种宏任务之间也有效率的不同，需要根据浏览器的支持情况，使用不同的宏任务。

```js
// src/core/util/next-tick.js

let microTimerFunc
let macroTimerFunc
let useMacroTask = false

/* 对于宏任务(macro task) */
// 检测是否支持原生 setImmediate(高版本 IE 和 Edge 支持)
if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  macroTimerFunc = () => {
    setImmediate(flushCallbacks)
  }
// 检测是否支持原生MessageChannel
} else if (typeof MessageChannel !== 'undefined' && (
  isNative(MessageChannel) ||
  MessageChannel.toString() === '[object MessageChannelConstructor]'
)) {
  const channel = new MessageChannel()
  const port = channel.port2
  channel.port1.onmessage = flushCallbacks
  macroTimerFunc = () => {
    port.postMessage(1)
  }
// 都不支持就使用setTimeout
} else {
  macroTimerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

/* 对于微任务(micro task) */
// 检测浏览器是否原生支持 Promise
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  microTimerFunc = () => {
    p.then(flushCallbacks)
    // 处理IOS中UIWebViews的Promise异常
    if (isIOS) setTimeout(noop)
  }
// 如果不支持promise，则使用宏任务处理方案
} else {
  // fallback to macro
  microTimerFunc = macroTimerFunc
}
```

在上述代码中，

- 对于宏任务：优先判断`setImmediate`、`MessageChannel`都不支持则降级为`setTimeout`
- 对于微任务：优先使用`Promise`，如果不支持，则使用宏任务处理方案

#### 执行回调队列

处理好针对宏任务和微任务的方案后，接下来就要根据不同方案执行回调队列

```js
// src/core/util/next-tick.js

const callbacks = []
let pending = false

// 执行队列中的每一个回调
function flushCallbacks () {
  // 重置异步锁
  pending = false
  // 防止出现nextTick中包含nextTick时出现问题，在执行回调函数队列前，提前复制备份并清空回调函数队列
  const copies = callbacks.slice(0)
  callbacks.length = 0
  // 执行回调函数队列
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}

export function nextTick (cb?: Function, ctx?: Object) {
  let _resolve
  // 将回调函数推入回调队列
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  // 如果异步锁未锁上，锁上异步锁，调用异步函数，准备等同步函数执行完后，就开始执行回调函数队列
  if (!pending) {
    pending = true
    if (useMacroTask) {
      macroTimerFunc()
    } else {
      microTimerFunc()
    }
  }
  
  // 如果没有提供回调，并且支持Promise，返回一个Promise
  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
```

我们之前说，`$nextTick`方法是将回调添加到任务队列中延迟执行，由于`$nextTick`方法可以在Vue中反复调用，为了性能考虑，Vue中只在第一次调用`$nextTick`时向任务队列添加一个任务，多次调用只会将`$nextTick`回调添加到回调列表中执行。

综上所述，`$nextTick`总体执行流程如下：

1. 处理浏览器兼容问题，生成微任务和宏任务对应方案
2. 代码调用`$nextTick`方法，将回调函数推入回调队列
3. 如果第一次执行，异步锁未锁上，则锁上异步锁，调用异步函数，等待执行任务队列
4. 在这期间再次调用`$nextTick`方法时，先将回掉函数推入回调队列，等待执行任务队列
5. 任务队列执行，触发设置的`flushCallbacks`回调函数，重置异步锁，循环触发之前缓存的回调队列

在这期间需要注意的有几点：

1. 不要重复添加异步方法到任务队列中，Vue采用了异步锁的方式加限制
2. 代码中可能出现`nextTick`中包含`nextTick`的情况，需要对回调队列做处理。Vue在触发回调时，将当前`callbacks`做备份，防止污染
3. 优先使用微任务处理，但要针对场景来动态切换。Vue提供了`withMacroTask`方法将当前执行的微任务切换为宏任务，保证更新DOM的执行时间会晚于回调函数的执行时间，防止多次渲染。比如用户点击事件

