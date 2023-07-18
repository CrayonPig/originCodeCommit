# 事件相关的方法

与事件相关的实例方法有4个，分别是`vm.$on`、`vm.$emit`、`vm.$off`和`vm.$once`。它们是在`eventsMixin`函数中挂载到`Vue`原型上的，代码如下：

```javascript
// src/core/instance/events.js
export function eventsMixin (Vue) {
  Vue.prototype.$on = function (event, fn) {}
  Vue.prototype.$once = function (event, fn) {}
  Vue.prototype.$off = function (event, fn) {}
  Vue.prototype.$emit = function (event) {}
}
```

当执行`eventsMixin`函数后，会向`Vue`原型上挂载上述4个实例方法。

## 发布订阅模式

在分析这四个实例方法之前，我们先介绍一个设计模式——`消息订阅模式`

发布订阅模式（Publish-Subscribe Pattern）是一种常见的设计模式，用于实现对象间的解耦和消息传递。在该模式中，消息的发送者（发布者）并不直接知道消息的接收者（订阅者），而是通过一个中介机制（通常称为消息队列或主题）来进行消息的发布和订阅。这种模式允许多个订阅者同时监听某个主题，并在消息发布时独立地接收消息。

发布订阅模式通常包含以下几个角色：

1. 发布者（Publisher）：负责发布消息的对象，将消息发送到消息队列或主题。
2. 订阅者（Subscriber）：注册对特定消息的兴趣，以接收发布者发送的消息。
3. 消息队列或主题（Message Queue/Topic）：作为中介，接收发布者发送的消息并将其分发给所有订阅者。
4. 消息（Message）：发布者发送的数据或事件，用于在订阅者之间进行通信。

![发布订阅模式](@assets/vue2/eventsouce.png)

在Vue中，发布订阅模式通常用于组件间的通信，特别是当组件之间的关系比较复杂或嵌套层级较深时。Vue提供了一个名为`EventBus`的实例，你可以使用它来实现发布订阅模式。

首先通过`new Vue()`定义一个事件中心，通过`$on`订阅事件，将事件存储在事件中心里面，然后通过`$emit`触发事件中心里面存储的订阅事件。当需要取消订阅事件时，可以使用`$off`。如果只想订阅一次事件，可以使用`$once`。

## $on

### 用法回顾

在介绍方法的内部原理之前，我们先根据官方文档示例回顾一下它的用法。

```javascript
vm.$on( event, callback )
```

- **参数**：

  - `{string | Array<string>} event` (数组只在 2.2.0+ 中支持)
  - `{Function} callback`

- **作用**：

  监听当前实例上的自定义事件。事件可以由`vm.$emit`触发。回调函数会接收所有传入事件触发函数的额外参数。

- **示例**：

  ```javascript
  vm.$on('test', function (msg) {
    console.log(msg)
  })
  vm.$emit('test', 'hi')
  // => "hi"
  ```

### 内部原理

之前说过，`$on`是用来订阅事件，将事件存储在事件中心中，源码如下

```js
// src/core/instance/events.js
Vue.prototype.$on = function (event: string | Array<string>, fn: Function): Component {
  const vm: Component = this
  // 如果是数组，说明需要一次注册多个事件
  if (Array.isArray(event)) {
    for (let i = 0, l = event.length; i < l; i++) {
      // 每个事件单独注册
      this.$on(event[i], fn)
    }
  } else {
    // 如果是字符串，把事件注册到当前实例的_events中
    (vm._events[event] || (vm._events[event] = [])).push(fn)
    // optimize hook:event cost by using a boolean flag marked at registration
    // instead of a hash lookup
    if (hookRE.test(event)) {
      vm._hasHookEvent = true
    }
  }
  return vm
}
```

上述代码较为简单，需要说的是`vm._events`，当前实例上的`_events`属性，我们在之前介绍生命周期时，在`initEvents`提到过，在`vm`上新增`_events`属性，并初始化为空对象，用于储存`vm.$on`注册的事件

```js
// src/core/instance/events.js
export function initEvents (vm: Component) {
  vm._events = Object.create(null)
  // ...
}
```

::: tip 在Vue中使用发布订阅模式时，为什么需要自己new Vue?
在Vue中，事件中心是存储在当前实例的`_events`属性中的，不同实例的`_events`属性不通用
:::

## $emit

### 用法回顾

在介绍方法的内部原理之前，我们先根据官方文档示例回顾一下它的用法。

```javascript
vm.$emit( eventName, […args] )
```

- **参数**：
  - `{string} eventName`
  - `[...args]`
- **作用**：
  触发当前实例上的事件。附加参数都会传给监听器回调。

### 内部原理

`$emit`是用于触发事件中心里面存储的订阅事件，源码如下

```js
// src/core/instance/events.js

Vue.prototype.$emit = function (event: string): Component {
  const vm: Component = this
  // 在事件中心中找到对应的注册事件
  let cbs = vm._events[event]
  if (cbs) {
    // 注册事件可能会有多个
    cbs = cbs.length > 1 ? toArray(cbs) : cbs
    // 获取传入的额外参数
    const args = toArray(arguments, 1)
    // 循环触发注册的事件
    for (let i = 0, l = cbs.length; i < l; i++) {
      try {
        cbs[i].apply(vm, args)
      } catch (e) {
        handleError(e, vm, `event handler for "${event}"`)
      }
    }
  }
  return vm
}
```

代码较为简单，看注释吧

## $off

### 用法回顾

在介绍方法的内部原理之前，我们先根据官方文档示例回顾一下它的用法。

```javascript
vm.$off( [event, callback] )
```

- **参数**：

  - `{string | Array<string>} event` (只在 2.2.2+ 支持数组)
  - `{Function} [callback]`

- **作用**：

  移除自定义事件监听器。

  - 如果没有提供参数，则移除所有的事件监听器；
  - 如果只提供了事件，则移除该事件所有的监听器；
  - 如果同时提供了事件与回调，则只移除这个回调的监听器。

### 内部原理

通过用法回顾我们知道，该方法用来移除事件中心里面某个事件的回调函数，根据所传入参数的不同，作出不同的处理。源码如下：

```js
// src/core/instance/events.js

Vue.prototype.$off = function (event?: string | Array<string>, fn?: Function): Component {
  const vm: Component = this
  // 没有传参，则清空所有事件
  if (!arguments.length) {
    vm._events = Object.create(null)
    return vm
  }
  // events 是个数组，则挨个删除
  if (Array.isArray(event)) {
    for (let i = 0, l = event.length; i < l; i++) {
      this.$off(event[i], fn)
    }
    return vm
  }
  const cbs = vm._events[event]
  // event没被注册过事件，无需处理
  if (!cbs) {
    return vm
  }
  // 没传需要取消的事件回调，则清空该event所属所有事件
  if (!fn) {
    vm._events[event] = null
    return vm
  }
  // 只取消特定的事件回调，则遍历该event下所有事件进行对比
  if (fn) {
    // specific handler
    let cb
    let i = cbs.length
    while (i--) {
      cb = cbs[i]
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1)
        break
      }
    }
  }
  return vm
}
```

代码不复杂，只是针对多种情况做了处理，具体看注释

## $once

### 用法回顾

在介绍方法的内部原理之前，我们先根据官方文档示例回顾一下它的用法。

```javascript
vm.$once( event, callback )
```

- **参数**：

  - `{string} event`
  - `{Function} callback`

- **作用**：

  监听一个自定义事件，但是只触发一次。一旦触发之后，监听器就会被移除。

### 内部原理

前面我们说过，`$once`只能触发一次事件，也就是说当触发完成后，我们需要立即删除该事件。源码如下

```js
// src/core/instance/events.js

Vue.prototype.$once = function (event: string, fn: Function): Component {
  const vm: Component = this
  // 自定义事件回调，先取消当前事件注册，再触发传入的事件回调
  function on () {
    vm.$off(event, on)
    fn.apply(vm, arguments)
  }
  on.fn = fn
  vm.$on(event, on)
  return vm
}
```

从上述代码中可以看出，当使用`$once`注册的事件时，`$once`会将用户传入的事件回调先封装一层，当事件触发时，调用的就是这里被封装后的事件回调，在封装后的事件回调中，先调用了`$off`取消当前事件的注册，再触发传入的事件回调，保证后续再触发时不会触发第二次。
