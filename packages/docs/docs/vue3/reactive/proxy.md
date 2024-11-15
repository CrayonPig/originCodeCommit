# Proxy和Reflect

在JavaScript的ES6中引入了的两个新的API`Proxy` 和 `Reflect`。

`Proxy` 和 `Reflect` 对象允许你拦截并自定义基本语言操作（例如属性查找、赋值、枚举和函数调用等）。借助这两个对象，你可以在 JavaScript 进行元级别的编程。

## Proxy

`Proxy`用于定义基本操作的自定义行为（如属性查找，赋值，枚举，函数调用等）。

```js
new Proxy(target, handler)
```

我们可以使用 `Proxy()` 构造器来创建一个新的 `Proxy` 对象。构造器接收两个主要参数：

- target 被代理的对象
- handler 被代理对象上的自定义行为

更多方法可参考[Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy)

## Reflect

`Reflect`是一个内置的对象，它提供拦截 JavaScript 操作的方法。这些方法与proxy handlers的方法相同。`Reflect`不是一个函数对象，因此它是不可构造的。

`Proxy`的行为可以通过`Reflect`来控制。**每个`Proxy`的handler方法都有一个对应的`Reflect`方法**，这使得行为更具可预测性。例如，如果你没有在`Proxy`的handler中设置某个trap（陷阱），就会直接使用对应的`Reflect`的行为。

这样做的好处是，不论你有没有设置陷阱，被代理对象的行为都会按照相同的方式进行，这就解决了默认操作可能会因为自定义的陷阱而改变的问题。

```javascript
let obj = { foo: 'bar' };

let handler = {
  get(target, prop, receiver) {
    console.log(`GET ${prop}`);
    return Reflect.get(target, prop, receiver);
  }
};

let proxy = new Proxy(obj, handler);

console.log(proxy.foo); // 输出 "GET foo" 和 "bar"
```

如上示例中，当试图获取`proxy.foo`的值时，`handler.get`会被调用，然后它又调用了`Reflect.get`，这样就保证了原始的获取属性值的操作不会被改变。

更多方法可参考[Reflect](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect)

## 为什么要用Proxy重构

我们知道，Vue2的变化侦测实际上是使用了ES5的`Object.defineProperty`，已经可以实现对应的功能了，为什么Vue3还要用Proxy重构呢？

我们先回顾下`Object.defineProperty`的定义：

> Object.defineProperty() 方法会直接在一个**对象**上定义一个**新属性**，或者修改一个**对象**的**现有属性**，并返回此对象

可以从定义中看出，`Object.defineProperty`是直接在对象上的属性进行操作的，对应的`getter/setter` 只能追踪一个数据是否被修改，无法追踪新增属性和删除属性，所以导致当我们对object数据添加或删除值时，无法得到通知。

虽然`Object.defineProperty`的上述问题在`Vue2`中通过`vm.$set`、`vm.$delete`等其他方式解决了，但这种方式需要遍历对象的每个属性，性能上有一些劣势。

`Object.defineProperty` 和 `Proxy`对比

1. 更好的性能： `Object.defineProperty` 对对象进行响应式处理，这种方式需要遍历对象的每个属性。而 `Proxy` 可以直接监听整个对象，甚至数组，而且拦截能力更强。因此性能上 `Proxy` 会更有优势。
2. 更丰富的功能：`Proxy` 可以拦截更多的操作，比如新增属性、删除属性、检测属性是否存在等，这些是 `Object.defineProperty` 做不到的。这为 Vue3 提供了更丰富的功能可能性。
3. 代码量更少，便于维护：由于 `Proxy` 的 API 更加灵活，`Vue3` 的源码中关于响应式的部分代码量减少了，从而使得整体代码更加清晰，便于维护。
4. 更好的兼容性：在 `Vue2` 中，数组是通过重写数组的一些方法（如 push、pop 等）实现响应式的，这种方式有一定的局限性。而 `Proxy` 可以直接拦截数组的变化，因此兼容性更好。

虽然`Proxy`有很多优势，但它也有一些自己的缺点：

1. 兼容性问题：`Proxy` 是 ES6 中的新特性，不被 IE11 及更低版本的 IE 浏览器所支持。如果需要支持 IE 或者其他不支持 `Proxy` 的环境，需要采取其他方案或者放弃使用。
2. `Proxy` 无法代理已经存在的属性：`Proxy` 只能代理对象层面的操作，对于已经存在的属性，如果没有触发 set 操作，`Proxy` 是无法监听到的。
3. `Proxy` 无法对对象的原型（prototype）进行代理：`Proxy` 只能代理对象本身的操作，对于对象的原型，`Proxy` 是无法进行代理的。
4. `Proxy` 的一些陷阱函数需要返回特定的值，否则会报错，比如 set 陷阱函数中，如果目标对象不可配置或者目标属性是一个只读的属性，那么此时如果 set 陷阱函数返回 false，会报错。
5. `Proxy` 无法被 revoke 后再次使用：一旦 `Proxy` 实例被 revoke，再对其进行操作会抛出一个错误。

综上所述，我们可以发现，`Proxy` 相比 `Object.defineProperty` 具有更强的拦截能力，能拦截的对象范围更广，性能更好，是 `Vue3` 响应式数据处理的首选。
