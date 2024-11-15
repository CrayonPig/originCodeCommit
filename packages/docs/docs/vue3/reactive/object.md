# Object的变化侦测

经过上一小节，相信大家对于`Proxy`有一定的了解，本节将介绍`Proxy`如何实现`Object`的变化侦测。

## 监听get和set

我们使用`Proxy`定义一个简单的方法

```js
const obj = {
  a: 1
}

const handlers = {
  get(target, key) {
    console.log(`getting ${key}`)
    return target[key]
  },
  set(target, key, value) {
    console.log(`setting ${key} to ${value}`)
    return Reflect.set(target, key, value);
  }
}

const state = new Proxy(obj, handlers);

state.a; // getting a
state.a = 2; // setting a to 2
```

执行上述代码，你会发现`Proxy`会打印出`getting`和`setting`，说明`Proxy`已经实现了最简单的对`Object`的`get`和`set`的变化侦测。

有些同学可能会有疑问，为什么`set`方法需要返回`Reflect.set(target, key, value);`，而不是直接返回`target[key] = value`？

因为`Proxy`的`set`方法需要返回一个布尔值，代表`set`方法是否成功执行，如果直接返回`target[key] = value`，那么`Proxy`就无法知道`set`方法是否成功执行了。

当然我们有很多方法去判断是否成功执行，但本着`Proxy`和`Reflect`对应的原则，这里我们使用ES6提供的对应的方法`Reflect.set(target, key, value)`。

同样的，我们也可以把`get`中的实现改为`Reflect.get(target, key)`。

## 依赖收集和派发更新

我们之前说过，**变化侦测，是指监测数据的变化情况，并在发生变化时更新视图。** 要实现这个流程，我们除了监听数据之外，还需要收集对应的依赖和当依赖发生变更时，派发更新。

由此，我们可以将上述代码，改成如下

```js
const obj = {
  a: 1
}

// 依赖收集
function track(target, key) {
  console.log('依赖收集', key);
}
// 派发更新
function trigger(target, key) {
  console.log('触发更新', key);
}

const handlers = {
  get(target, key) {
    console.log(`getting ${key}`)
    // 依赖收集
    track(target, key);
    return Reflect.get(target, key);
  },
  set(target, key, value) {
    console.log(`setting ${key} to ${value}`)
    // 派发更新
    trigger(target, key);
    return Reflect.set(target, key, value);
  }
}

const state = new Proxy(obj, handlers);

state.a;
state.a = 2;
```

执行上述代码，可以得到如下打印内容

```js
// 依赖收集
// getting a
// setting a to 2
// 触发更新
// getting a
```

那到目前为止，我们已经利用`Proxy`实现了一个简单的响应式系统，能够监听数据的变化，收集依赖和派发对应的更新。我们接下来继续完善这个响应式系统的细节。

