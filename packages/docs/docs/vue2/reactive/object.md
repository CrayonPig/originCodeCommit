# Object的变化侦测

相信很多同学都知道，Vue2的变化侦测实际上是使用了ES5的`Object.defineProperty`，这也是Vue2为什么不支持IE8及以下浏览器的原因。本节我们就探究Vue2源码中是如何利用`Object.defineProperty`实现变化侦测的。

## Object.defineProperty

`Object.defineProperty` 静态方法会直接在一个对象上定义一个新属性，或修改其现有属性，并返回此对象。

用法如下：

```js
/**
 * 在对象上定义新的属性或修改现有属性的特性。
 * @param {object} obj - 要定义属性的对象。
 * @param {string | symbol} prop - 要定义或修改的属性的名称。
 * @param {PropertyDescriptor} descriptor - 定义或修改属性的特性描述符。
 * @returns {object} - 被定义或修改属性的对象。
 */
Object.defineProperty(obj, prop, descriptor)
```

其中 `descriptor` 包含很多可选属性，具体可查看[文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)， 这里列举常用的几个：

- `configurable`（布尔值）：表示该属性是否可被删除或修改特性，默认为`false`。
- `enumerable`（布尔值）：表示该属性是否可通过`for...in`循环或`Object.keys`方法遍历，默认为`false`。
- `value`：表示该属性的值，默认为`undefined`。
- `writable`（布尔值）：表示该属性是否可被赋值运算符修改，默认为`false`。
- `get`：获取该属性的访问器函数。
- `set`：设置该属性的访问器函数。

我们可以写个简单的例子

```js
const obj = {}

let val = 'Default content'

Object.defineProperty(obj, 'str', {
  enumerable: true,
  configurable: true,
  get() {
    console.log('str 被读取');
    return val;
  },
  set(newVal) {
    console.log('str 被设置');
    val = newVal;
  }
})

console.log(obj.str);
obj.str = 'Hello world'
console.log(obj.str);
```

上述代码运行如下

```js
str 被读取
Default content
str 被设置
str 被读取
Hello world
```

在这个例子中，我们将obj中的str属性设置为可枚举、可配置的，并设置了getter和setter函数。每当从obj的str函数读取数据时，get函数被触发。每当obj的str属性被写入值时，set函数被触发。这也就意味着obj的str可以被侦测了。

## 侦测Object所有属性

当我们可以侦测一个属性的时候，也就意味着我们可以侦测到所有的属性。我们看下Vue源码是如何实现这个功能的，源码在`src/core/observer/index.js`

```js
export class Observer {
  value: any; // 保存观察的对象
  dep: Dep; // 依赖实例，用于跟踪依赖项
  vmCount: number; // 作为根$数据拥有此对象的虚拟机数量

  constructor (value: any) {
    this.value = value; 
    this.dep = new Dep(); 
    this.vmCount = 0; // 初始化虚拟机数量为0
    // 在对象上定义不可枚举的 __ob__ 属性，并将其值设置为当前 Observer 实例
    // 表示此对象已经为响应式
    def(value, '__ob__', this); 
    if (Array.isArray(value)) {
      // 数组的逻辑，后续分析
    } else {
      this.walk(value);
    }
  }

  // 遍历对象的所有属性，将每个属性转换为响应式
  walk (obj: Object) {
    const keys = Object.keys(obj); // 获取对象的所有属性名
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i]); // 将对象的每个属性转换为响应式
    }
  }
}

function defineReactive (obj,key,val) {
  // 传入参数没有val，则手动获取
  if (arguments.length === 2) {
    val = obj[key]
  }
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get(){
      console.log(`${key}属性被读取`);
      return val;
    },
    set(newVal){
      // 如果新值和旧值相同，或者都是 NaN，则不进行任何操作
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      console.log(`${key}属性被设置`);
      val = newVal;
    }
  })
}
```

在上述代码中，我们定义了`Observer`类，它可以将对象转为可侦测的对象。

首先在对象上定义不可枚举的 `__ob__` 属性，表示此对象已经为响应式。并将其值设置为当前 `Observer` 实例。

然后判断对象是否为数组，如果不是，则执行`walk`函数，遍历对象的所有属性，将每个属性转换为响应式。

`Observer`类定义好后，我们就可以将一个对象的所有属性都转化为可侦测的响应式属性。

## 依赖收集

如果只是单独把 `Object.defineProperty` 进行封装并不会给我们带来帮助，我们还需要将观测中的依赖收集起来，在需要用到的时候触发变更通知。

在Vue2中，在模板中使用数据，当数据发生变更时，模板会被触发重新渲染。

实际上这个流程就是先收集相关属性的依赖，再等属性发生变更的时候把之前收集到的依赖挨个触发一遍。

总结来说，就是**在getter中收集依赖，在setter中触发依赖。**

那么我们怎么管理收集的依赖呢，最好的方案是每个属性都有各自的依赖管理器，各自独立维护防止冲突。在Vue2中使用了依赖管理器`Dep`类，源码在`src/core/observer/dep.js`。

```js
export default class Dep {
  static target: ?Watcher; // 当前正在计算的依赖项
  id: number; // 依赖项的唯一标识
  subs: Array<Watcher>; // 订阅该依赖项的 Watcher 实例数组

  constructor() {
    this.id = uid++; // 分配唯一的依赖项标识
    this.subs = []; // 初始化订阅数组
  }

  // 添加 Watcher 实例到订阅数组中
  addSub(sub: Watcher) {
    this.subs.push(sub); 
  }

  // 从订阅数组中移除指定的 Watcher 实例
  removeSub(sub: Watcher) {
    remove(this.subs, sub); 
  }

  depend() {
    if (Dep.target) {
      // 将当前依赖项添加到当前正在计算的 Watcher 实例的依赖项列表中
      Dep.target.addDep(this); 
    }
  }

  notify() {
    // 复制订阅数组
    const subs = this.subs.slice(); 
    // 循环遍历订阅数组，调用每个 Watcher 实例的 update 方法
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update();
    }
  }
}
```

这段代码较为简单，定义了一个`Dep`类，并实现了添加、删除、触发等操作依赖的方法。

通过`Dep`类对依赖的管理，我们就可以实现**在getter中收集依赖，在setter中触发依赖。**`defineReactive`更新如下

```js
function defineReactive (obj,key,val) {
  // 传入参数没有val，则手动获取
  if (arguments.length === 2) {
    val = obj[key]
  }

  // 初始化依赖管理器
  const dep = new Dep()

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get(){
      console.log(`${key}属性被读取`);
      // getter中收集依赖
      dep.depend()
      return val;
    },
    set(newVal){
      // 如果新值和旧值相同，或者都是 NaN，则不进行任何操作
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      console.log(`${key}属性被设置`);
      val = newVal;
      // setter中触发依赖
      dep.notify()
    }
  })
}
```

在上述代码中，我们在`getter`中调用了`dep.depend()`方法收集依赖，在`setter`中调用`dep.notify()`方法通知所有依赖更新。

## 谁使用依赖

经过上述操作，我们定义好了依赖，也收集好了依赖，那我们收集到的依赖，谁去使用呢？换句话说，当属性发生变化的时候，依赖应该去通知谁呢？

我们要通知用到数据的地方，而使用这个数据的地方有很多，而且类型还不一样，既有可能是模板，也有可能是用户写的一个 `watch`。

这时我们需要抽象出一个能集中处理这些情况的`Watcher`类，然后我们在依赖收集阶段只收集这个封装好的`Watcher`类的实例进来，通知也只通知它一个。接着它再负责通知其他地方。

Vue2中的`Watcher`类源码位于`src/core/observer/watcher.js`，简化代码如下

```js
export default class Watcher {
  constructor (vm,expOrFn,cb) {
    this.vm = vm;
    this.cb = cb;
    this.getter = parsePath(expOrFn)
    this.value = this.get()
  }
  get () {
    Dep.target = this;
    const vm = this.vm
    let value = this.getter.call(vm, vm)
    Dep.target = undefined;
    return value
  }
  update () {
    const oldValue = this.value
    this.value = this.get()
    this.cb.call(this.vm, this.value, oldValue)
  }
}

/**
 * Parse simple path.
 * 把一个形如'data.a.b.c'的字符串路径所表示的值，从真实的data对象中取出来
 * 例如：
 * data = {a:{b:{c:2}}}
 * parsePath('a.b.c')(data)  // 2
 */
const bailRE = /[^\w.$]/
export function parsePath (path) {
  if (bailRE.test(path)) {
    return
  }
  const segments = path.split('.')
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]]
    }
    return obj
  }
}
```

1. 当实例化`Watcher`类时，会先执行其构造函数
2. 在构造函数中调用了`this.get()`实例方法
3. 在`get()`方法中，首先通过`Dep.target = this`把实例自身赋给了全局的一个唯一对象`Dep.target`上，然后通过`let value = this.getter.call(vm, vm)`获取一下被依赖的数据，获取被依赖数据的目的是触发该数据上面的`getter`，上文我们说过，在`getter`里会调用`dep.depend()`收集依赖，而在`dep.depend()`中取到挂载`Dep.target`上的值并将其存入依赖数组中，在`get()`方法最后将`Dep.target`释放掉
4. 而当数据变化时，会触发数据的`setter`，在`setter`中调用了`dep.notify()`方法，在`dep.notify()`方法中，遍历所有依赖(即watcher实例)，执行依赖的`update()`方法，也就是Watcher类中的`update()`实例方法，在`update()`方法中调用数据变化的更新回调函数，从而更新视图。

通过上述代码，就彻底完成了对`Object`数据的侦测，依赖收集，依赖的更新等所有操作。

## 不足

通过 `Object.defineProperty` 来将对象的 `key` 转换成 `getter/setter` 的形式来追踪变化，但 `getter/setter` 只能追踪一个数据是否被修改，无法追踪新增属性和删除属性，所以导致当我们对object数据添加或删除值时，无法通知依赖，无法驱动视图进行响应式更新。

但这也是没有办法的事，因为在 ES6 之前，JavaScript 没有提供元编程的能力，无法侦测到个新属性被添加到了对象中，也无法侦测到一个属性从对象中删除了。为了解决这个问题 Vue2 提供了两个 API `vm.$set` 与 `vm.$delete`，后续详细介绍它们。

## 总结

变化侦测就是侦测数据的变化。当数据发生变化时，要能侦测到并发出通知。

`Object` 可以通过 `Object.defineProperty` 将属性转换成 `getter/setter` 的形式来追踪变化读取数据时会触发 `getter`，修改数据时会触发 `setter`。

我们需要在 `getter` 中收集有哪些依赖使用了数据。当 `setter` 被触发时，去通知 `getter` 中收集的依赖数据发生了变化。

收集依赖需要为依赖找一个存储依赖的地方，为此我们创建了 `Dep`，它用来收集依赖、删除依赖和向依赖发送消息等。

所谓的依赖，其实就是 `watcher`。只有 `watcher` 触发的 `getter`才会收集依赖，哪个 `watcher`触发了 `getter`，就把哪个 `watcher` 收集到 `Dep` 中。当数据发生变化时，会循环依赖列表，把所有的 `watcher` 都通知一遍。
