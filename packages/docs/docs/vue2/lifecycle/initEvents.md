# 初始化阶段(initEvents)

`initEvents`顾名思义，初始化事件。在实例化初始化阶段，被初始化的事件是指父组件在模板中使用`v-on`监听子组件内触发的事件。
也就是将父组件在模板中使用的 `v-on` 注册的事件添加到子组件的事件系统中。如下示例：

```js
<child @select="selectHandler"></child>
```

::: tip 为什么不使用注册模板中的浏览器事件？
简单来说，如果`v-on`写在标签上，那么这个事件会注册到子组件事件系统中。如果是写在平台标签上，例如`div`，那么事件会被注册到浏览器中。

详细来讲，看其他章节
:::

`initEvents`函数，位于`src/core/instance/events.js`，代码如下：

```js
export function initEvents (vm: Component) {
  vm._events = Object.create(null)
  vm._hasHookEvent = false
  // 初始化父组件附加的事件
  const listeners = vm.$options._parentListeners
  if (listeners) {
    updateComponentListeners(vm, listeners)
  }
}
```

可以看出，代码只有短短几行，非常简单。首先在`vm`上新增`_events`属性，并初始化为空对象，用于储存`vm.$on`注册的事件。

```js
vm._events = Object.create(null)
```

在模板编译阶段实例化子组件时，将标签上注册的事件解析成`object`并通过参数传递给子组件。所以`vm.$options._parentListeners` 的数据是父组件向子组件注册的事件的集合。

如果 `vm.$options._parentListeners` 不为空时，则调用`updateComponentListeners` 方法，将父组件向子组件注册地事件注册到子组件实例中。

## updateComponentListeners

`updateComponentListeners`的逻辑也很简单，只是调用了`updateListeners`函数，并把`listeners`以及`add`和`remove`这两个函数传入。

```js
let target: any

function add (event, fn, once) {
  if (once) {
    target.$once(event, fn)
  } else {
    target.$on(event, fn)
  }
}

function remove (event, fn) {
  target.$off(event, fn)
}

export function updateComponentListeners (
  vm: Component,
  listeners: Object,
  oldListeners: ?Object
) {
  target = vm
  updateListeners(listeners, oldListeners || {}, add, remove, vm)
  target = undefined
}
```
我们继续跟进，看看`updateListeners`函数干了些什么，

## updateListeners

`updateListeners` 函数用于比较新旧事件监听器的变化，并根据变化情况添加、更新或移除事件监听器。这个函数在 Vue 的事件系统中起到了重要的作用，确保事件的正确绑定和更新。源码位于的`src/vdom/helpers/update-listeners.js`中，如下：

```js
// 更新组件的事件监听器
export function updateListeners (
  on: Object,
  oldOn: Object,
  add: Function,
  remove: Function,
  vm: Component
) {
  let name, def, cur, old, event
  for (name in on) {
    def = cur = on[name]
    old = oldOn[name]
    event = normalizeEvent(name)

    if (isUndef(old)) {
      // 如果 old 未定义，表示之前没有对应的事件监听器，那么需要将 cur 转换为一个函数调用器，并将其添加到事件监听中。
      if (isUndef(cur.fns)) {
        cur = on[name] = createFnInvoker(cur)
      }
      add(event.name, cur, event.once, event.capture, event.passive, event.params)
    } else if (cur !== old) {
      // 旧的事件处理函数 与当前事件处理函数 不相等，即更新事件监听器的处理函数。
      old.fns = cur
      on[name] = old
    }
  }
  for (name in oldOn) {
    if (isUndef(on[name])) {
      // 如果不存在，表示之前的事件监听器已被移除，那么需要将旧的事件监听器从事件中移除。
      event = normalizeEvent(name)
      remove(event.name, oldOn[name], event.capture)
    }
  }
}

```

首先通过遍历 `on` 对象中的每个属性名，获取当前事件名 `name`，以及对应的事件处理函数 `cur` 和旧的事件处理函数 `old`。`normalizeEvent` 函数用于标准化事件名，将事件名转换为统一格式。

```js
let name, def, cur, old, event
  for (name in on) {
    def = cur = on[name]
    old = oldOn[name]
    event = normalizeEvent(name)
```

检查旧的事件处理函数 `old` 是否未定义。如果 `old` 未定义，表示之前没有对应的事件监听器，那么需要将 `cur` 转换为一个函数调用器（`createFnInvoker` 函数用于创建一个函数调用器），并将其添加到事件监听中。

```js
if (isUndef(old)) {
  // 如果 old 未定义，表示之前没有对应的事件监听器，那么需要将 cur 转换为一个函数调用器，并将其添加到事件监听中。
  if (isUndef(cur.fns)) {
    cur = on[name] = createFnInvoker(cur)
  }
  add(event.name, cur, event.once, event.capture, event.passive, event.params)
}
```

如果旧的事件处理函数 `old` 已经定义，并且当前事件处理函数 `cur` 与旧的事件处理函数不相等，则将旧的事件处理函数的 `fns` 属性更新为当前事件处理函数 `cur`，并将其赋值给 `on[name]`，即更新了事件监听器的处理函数。

```js
if (cur !== old) {
  // 旧的事件处理函数 与当前事件处理函数 不相等，即更新事件监听器的处理函数。
  old.fns = cur
  on[name] = old
}
```

最后，遍历 `oldOn` 对象中的每个属性名，检查是否在 `on` 对象中不存在对应的事件监听器。如果不存在，表示之前的事件监听器已被移除，那么需要将旧的事件监听器从事件中移除。

```js
for (name in oldOn) {
  if (isUndef(on[name])) {
    // 如果不存在，表示之前的事件监听器已被移除，那么需要将旧的事件监听器从事件中移除。
    event = normalizeEvent(name)
    remove(event.name, oldOn[name], event.capture)
  }
}
```


## normalizeEvent

`updateListeners` 函数中用了好几次 `normalizeEvent`，我们前面提到过，这个函数是将传入的事件名进行标准化处理，去除可能存在的前缀字符，并根据前缀字符确定事件的类型（一次性、捕获、被动），最终返回一个包含标准化信息的事件对象。这样，在组件的事件处理过程中，就可以根据事件对象的属性来执行相应的逻辑。

那么它是怎么做到的呢。我们一起来看看，源码仍然位于`src/vdom/helpers/update-listeners.js`。

```js
const normalizeEvent = cached((name: string): {
  name: string,
  once: boolean,
  capture: boolean,
  passive: boolean,
  handler?: Function,
  params?: Array<any>
} => {
  const passive = name.charAt(0) === '&'
  name = passive ? name.slice(1) : name
  const once = name.charAt(0) === '~' // Prefixed last, checked first
  name = once ? name.slice(1) : name
  const capture = name.charAt(0) === '!'
  name = capture ? name.slice(1) : name
  return {
    name,
    once,
    capture,
    passive
  }
})
```

Vue 的模板中支持事件修饰符，例如`passive`、`once`、`capture`等，如果我们在模板注册的时候使用了事件修饰符，那么在模板编译阶段解析标签上的属性石，会将这些修饰符加在事件名前面。例如 `@handle.once` 会解析为 `~handle`。

我们通过这样的方式来分辨当前事件是否使用了事件修饰符。而`normalizeEvent`的作用就是将事件修饰符解析出来。

上述代码中，解析`name`，如果`name`中有对应的修饰符，则会截取出来。最终返回值保存了事件名及事件修饰符，这些修饰符为`true`，则说明使用了事件修饰符。

## 总结

本小节介绍了`initEvents`函数。该函数是用来初始化实例的事件系统的。本小节涉及到的很多知识点需要有一些模板编译的知识，建议大家学完模板编译后，再次将这部分的知识梳理下。

初始化事件函数`initEvents`实际上初始化的是父组件在模板中使用v-on或@注册的监听子组件内触发的事件。

首先在`vm`上新增`_events`属性，并初始化为空对象，用于储存`vm.$on`注册的事件。接着通过调用`updateComponentListeners`函数，将父组件向子组件注册的事件注册到子组件实例中的`_events`对象里。
