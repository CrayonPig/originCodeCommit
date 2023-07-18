# 数据相关的方法

与数据相关的实例方法有3个，分别是`vm.$set`、`vm.$delete`和`vm.$watch`。它们是在`stateMixin`函数中挂载到Vue原型上的，代码如下：

```js
// src/core/instance/state.js

export function stateMixin (Vue: Class<Component>) {
  Vue.prototype.$set = set
  Vue.prototype.$delete = del

  Vue.prototype.$watch = function (
    expOrFn: string | Function,
    cb: any,
    options?: Object
  ): Function {
    
  }
}
```

当执行`stateMixin`函数后，会向Vue原型上挂载上述3个实例方法。

下面我们挨个介绍每个方法的内部实现原理。

## $watch

### 用法回顾

在介绍方法的内部原理之前，我们先根据官方文档示例回顾一下它的用法。

```javascript
vm.$watch(expOrFn, callback, [options]);
```

- **参数**：

- `{string | Function} expOrFn`
- `{Function | Object} callback`
- `{Object} [options]`
  - `{boolean} deep`
  - `{boolean} immediate`

- **返回值**：`{Function} unwatch`

- **用法**：

观察 `Vue` 实例变化的一个表达式或计算属性函数。回调函数得到的参数为新值和旧值。表达式只接受监督的键路径。对于更复杂的表达式，用一个函数取代。

注意：在变异 (不是替换) 对象或数组时，旧值将与新值相同，因为它们的引用指向同一个对象/数组。`Vue` 不会保留变异之前值的副本。

- **示例**：

```javascript
// 键路径
vm.$watch("a.b.c", function(newVal, oldVal) {
  // 做点什么
});

// 函数
vm.$watch(
  function() {
    // 表达式 `this.a + this.b` 每次得出一个不同的结果时
    // 处理函数都会被调用。
    // 这就像监听一个未被定义的计算属性
    return this.a + this.b;
  },
  function(newVal, oldVal) {
    // 做点什么
  }
);
```

`vm.$watch` 返回一个取消观察函数，用来停止触发回调：

```javascript
var unwatch = vm.$watch("a", cb);
// 之后取消观察
unwatch();
```

- **选项：deep**

为了发现对象内部值的变化，可以在选项参数中指定 `deep: true` 。注意监听数组的变动不需要这么做。

```javascript
vm.$watch("someObject", callback, {
  deep: true
});
vm.someObject.nestedValue = 123;
// callback is fired
```

- **选项：immediate**

在选项参数中指定 `immediate: true` 将立即以表达式的当前值触发回调：

```javascript
vm.$watch("a", callback, {
  immediate: true
});
// 立即以 `a` 的当前值触发回调
```

注意在带有 `immediate` 选项时，你不能在第一次回调时取消侦听给定的 property。

```javascript
// 这会导致报错
var unwatch = vm.$watch(
  "value",
  function() {
    doSomething();
    unwatch();
  },
  { immediate: true }
);
```

如果你仍然希望在回调内部调用一个取消侦听的函数，你应该先检查其函数的可用性：

```javascript
var unwatch = vm.$watch(
  "value",
  function() {
    doSomething();
    if (unwatch) {
      unwatch();
    }
  },
  { immediate: true }
);
```

### 内部实现

其实对于`Watcher`，我们在变化侦测部分已经讲过了，具体的不再赘述，这里就研究一些跟`$watch`其他的实现。

```js
Vue.prototype.$watch = function (
  expOrFn: string | Function,
  cb: any,
  options?: Object
): Function {
  const vm: Component = this
  // 如果cb是个对象，说明格式是
  // {
  //   handler: function (val, oldVal) { /* ... */ },
  //   deep: true
  // }
  if (isPlainObject(cb)) {
    return createWatcher(vm, expOrFn, cb, options)
  }
  options = options || {}
  // 区分用户创建的watcher实例和Vue内部创建的watcher实例
  options.user = true
  const watcher = new Watcher(vm, expOrFn, cb, options)
  // immediate 立即触发
  if (options.immediate) {
    cb.call(vm, watcher.value)
  }
  return function unwatchFn () {
    watcher.teardown()
  }
}
```

从上述代码中我们可以看到，首先先判断，参数`cb`是否是一个对象，如果是，则调用`createWatcher`函数创建`watcher`实例。这是因为，如果第二个参数是对象的话，那必定是一下的格式

```javascript
{
  handler: function (val, oldVal) { /* ... */ },
  deep: true
}
```

针对这种格式，我们需要将其转换为统一的格式，我们看看`createWatcher`是如何处理的

```js
function createWatcher (
  vm: Component,
  expOrFn: string | Function,
  handler: any,
  options?: Object
) {
  // 如果是个对象，则把handler提出来
  if (isPlainObject(handler)) {
    options = handler
    handler = handler.handler
  }
  // 回调使用的是this上挂载的方法
  if (typeof handler === 'string') {
    handler = vm[handler]
  }
  return vm.$watch(expOrFn, handler, options)
}
```

代码比较简单，如果是个对象，则把`handler`提取出来，如果`handler`是一个字符串，说明绑定的是实例`this`上的方法，将其取出并赋值。最后用处理好的格式再重新调用`$watch`

处理完毕后，就可以调用`new Watcher`触发依赖收集，这里不赘述，有疑问的可以看变化侦测或源码注释

```js
// immediate 立即触发
if (options.immediate) {
  cb.call(vm, watcher.value)
}
return function unwatchFn () {
  watcher.teardown()
}
```

接下来就是处理表示立即触发的`immediate`字段，主动触发回调完成这个功能

最后`return`取消监听的方法，现在应该可以理解为什么`immediate: true`的第一次回调中无法触发销毁了吧，因为立即触发回调时，销毁函数还没挂载上。

我们来看取消监听的方法是如何实现的，他是调用了`watcher.teardown()`

```js
// src/core/observer/watcher.js
teardown() {
  if (this.active) {
    // 从 Vue 实例的 Watcher 数组中移除自身
    // 如果 Vue 实例正在销毁，这是一个相对昂贵的操作，因此我们跳过它。
    if (!this.vm._isBeingDestroyed) {
      remove(this.vm._watchers, this);
    }
    let i = this.deps.length;
    while (i--) {
      this.deps[i].removeSub(this); // 从依赖项的订阅者列表中移除自身
    }
    this.active = false; // Watcher 不再活跃
  }
}
```

在之前介绍变化侦测时，我们说过，谁读取了数据，就表示谁依赖了这个数据，那么谁就会存在于这个数据的依赖列表中，当这个数据变化时，就会通知谁。也就是说，如果谁不想依赖这个数据了，那么只需从这个数据的依赖列表中把谁删掉即可。

所以上述代码，主要实现是`this.deps[i].removeSub(this)`从依赖项的订阅者列表中移除自身，就不会触发数据的变化回调了。

最后是`deep: true`深度观察选项的实现。

要实现这个功能也很简单，我们知道，想让数据变化时通知我们，我们只需要成为该数据的依赖就行。也就是我们需要读取下数据，就可以成为该数据的依赖，就可以在数据变化时收到通知。简单来讲，我们只需要在`Watcher`初始化的时候，把所有的数据都递归读取下，那这个`watcher`实例就会被加到所有的数据的依赖中，后续当该数据的任意值发生变化时，我们都能收到通知。

理论形成，我们看看源码是怎么做的

```js
export default class Watcher {
    constructor (/* ... */) {
        // ...
        this.value = this.get()
    }
    get () {
      if (this.deep) {
        traverse(value); // 深度遍历值，触发属性的 getter 以收集依赖
      }
      return value
    }
}
```

源码中在`get`时判断`deep`是否存在，如果存在，则触发`traverse`方法

```js
// src/core/observer/traverse.js
export function traverse (val: any) {
  _traverse(val, seenObjects)
  seenObjects.clear()
}

function _traverse (val: any, seen: SimpleSet) {
  let i, keys
  const isA = Array.isArray(val)
  // 不是Array或object，再或者已经被冻结，那么直接返回
  if ((!isA && !isObject(val)) || Object.isFrozen(val) || val instanceof VNode) {
    return
  }
  // 使用集合，防止重复收集依赖
  if (val.__ob__) {
    const depId = val.__ob__.dep.id
    if (seen.has(depId)) {
      return
    }
    seen.add(depId)
  }

  // 循环数组，将数组中每一项递归调用_traverse
  if (isA) {
    i = val.length
    while (i--) _traverse(val[i], seen)
  // 获取对象所有key，然后读取，再递归内部值
  } else {
    keys = Object.keys(val)
    i = keys.length
    while (i--) _traverse(val[keys[i]], seen)
  }
}
```

可以看出，就是个递归遍历的过程，把被观察数据的内部值都递归遍历读取一遍。

## $set

`vm.$set` 是全局 `Vue.set` 的**别名**，其用法相同。

### 用法回顾

在介绍方法的内部原理之前，我们先根据官方文档示例回顾一下它的用法。

```javascript
vm.$set(target, propertyName / index, value);
```

- **参数**：

  - `{Object | Array} target`
  - `{string | number} propertyName/index`
  - `{any} value`

- **返回值**：设置的值。

- **用法**：

  向响应式对象中添加一个属性，并确保这个新属性同样是响应式的，且触发视图更新。它必须用于向响应式对象上添加新属性，因为 `Vue` 无法探测普通的新增属性 (比如 `this.myObject.newProperty = 'hi'`)

- **注意**：对象不能是 `Vue` 实例，或者 `Vue` 实例的根数据对象。

### 内部实现

我们在之前讲变化侦测时，说过当时的方案针对于两种场景无法追踪到

1. 对于`Object`无法追踪新增属性和删除属性
2. 对于`Array`无法追踪通过修改下标去修改数据

为了解决这个问题 Vue2 提供了两个 API `vm.$set` 与 `vm.$delete`，我们先看`$set`的实现

```js
// src/core/observer/index.js
export function set (target: Array<any> | Object, key: any, val: any): any {
  // 如果是数组，并且key是有效的数组索引
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    // 使用较大的数值作为新的长度
    target.length = Math.max(target.length, key)
    // 使用splice触发Array拦截器，完成响应
    target.splice(key, 1, val)
    return val
  }
  // 不是数组就是对象
  // 如果key存在，则更新对象中该key的值为val
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }
  // __ob__ 代表是否为响应式对象
  const ob = (target: any).__ob__
  // 不能为Vue实例或者 Vue 实例的根数据对象
  if (target._isVue || (ob && ob.vmCount)) {
    return val
  }
  // 不是一个响应式对象，只需要简单的增加一个属性
  if (!ob) {
    target[key] = val
    return val
  }
  // 如果是响应式对象，调用defineReactive
  // defineReactive方会将新属性添加完之后并将其转化成响应式
  defineReactive(ob.value, key, val)
  // 通知依赖更新
  ob.dep.notify()
  return val
}
```

代码逻辑较为简单，主要做了大量的兼容逻辑判断，具体可以看注释梳理逻辑，以下是流程图

![$set内部逻辑](@assets/vue2/instanceMehtosSet.jpg)

## $delete

`vm.$delete` 是全局 `Vue.delete`的**别名**，其用法相同。

### 用法回顾

在介绍方法的内部原理之前，我们先根据官方文档示例回顾一下它的用法。

```javascript
vm.$delete(target, propertyName / index);
```

- **参数**：

  - `{Object | Array} target`
  - `{string | number} propertyName/index`

  > 仅在 2.2.0+ 版本中支持 Array + index 用法。

- **用法**：

  删除对象的属性。如果对象是响应式的，确保删除能触发更新视图。这个方法主要用于避开 `Vue` 不能检测到属性被删除的限制，但是你应该很少会使用它。

  > 在 2.2.0+ 中同样支持在数组上工作。

* **注意**： 目标对象不能是一个 `Vue` 实例或 `Vue` 实例的根数据对象。

### 内部实现

`$delete`方法是用来解决 Vue 不能检测到属性被删除的限制，源码如下

```js
// src/core/observer/index.js
export function del (target: Array<any> | Object, key: any) {
  // 如果是数组，并且是有效索引长度
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    // 调用splice触发Array拦截器，完成响应
    target.splice(key, 1)
    return
  }

  // __ob__ 代表是否为响应式对象
  const ob = (target: any).__ob__
  // 不能为Vue实例或者 Vue 实例的根数据对象
  if (target._isVue || (ob && ob.vmCount)) {
    return
  }
  // 不存在这个属性，无需处理
  if (!hasOwn(target, key)) {
    return
  }
  // 删除此属性
  delete target[key]
  // 不是响应式对象，直接完成
  if (!ob) {
    return
  }
  // 是响应式对象，通知依赖更新
  ob.dep.notify()
}
```

从上述逻辑中可以发现，`$delete`和`$set`方法比较类似，都是先做了大量的兼容逻辑判断，具体可以看注释梳理逻辑