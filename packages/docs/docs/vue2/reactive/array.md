# Array的变化侦测

很多人可能比较疑惑，为什么`Array`的侦测方式跟`Object`的不同，毕竟`Array`也是对象类型，我们举个例子说明下

```js
list.push('hello')
```

在这个例子中我们通过`Array`原型上的方法来改变数组的内容，并不会触发 `getter/setter`，所以我们需要针对`Array`的变化单独处理。

虽然需要单独处理，但基本思想还是不变的，都是在**获取数据的时候收集依赖，数据变化的时候通知依赖更新。**

## 收集依赖

那么我们应该如何收集`Array`的依赖呢？其实`Array`和`Object`一样，都是通过`getter`收集的。

有的同学就很疑惑了，刚不还说不一样，怎么转眼就都用`getter`了？

我们回想下，我们在日常开发中使用`Array`的时候，是不是如下的写法：

```js
data(){
  return {
    list:[1, 2, 3]
  }
}
```

`list`永远都处于`Object`的包裹中，当我们想获取到`list`的时候，就需要从`Object`的属性中获取，当我们使用`this.list`时，就会触发`Object`的`list`属性的`getter`。从而收集到`list`的依赖。

所以`Array`的依赖跟`Object`一样，都在 `defineReactive` 中收集

```js
function defineReactive (obj,key,val) {
  // 传入参数没有val，则手动获取
  if (arguments.length === 2) {
    val = obj[key]
  }

  // 如果存在val时对象或者数组创建observer
  let childOb = !shallow && observe(val)

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get(){
      console.log(`${key}属性被读取`);
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          // 为val收集依赖
          childOb.dep.depend()
          if (Array.isArray(value)) {
            // 如果是数组，则跟踪数组依赖
            dependArray(value)
          }
        }
      }
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

function dependArray (value: Array<any>) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i]
    // 已有observer时，直接收集数组的依赖，后续有讲
    e && e.__ob__ && e.__ob__.dep.depend()
    if (Array.isArray(e)) {
      // 多重数组递归调用
      dependArray(e)
    }
  }
}
```

当触发`Object.defineProperty`的`getter`时，我们判断当前`val`是否是数组，如果是，则调用`dependArray`以收集依赖项。

所以，**`Array`在`getter`中收集依赖。**

## 依赖列表存到哪？

既然`Array`在`getter`中收集依赖，而给数组数据添加`getter/setter`都是在`Observer`类中完成的，所以我们也应该在`Observer`类中收集依赖。源码在`src/core/observer/index.js`

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
      // 支持原型继承（hasProto），使用原型继承的方式（protoAugment）
      // 不支持原型继承（hasProto），使用拷贝属性的方式（copyAugment）
      const augment = hasProto
        ? protoAugment
        : copyAugment
      // 将 arrayMethods 的方法混入数组对象
      augment(value, arrayMethods, arrayKeys)
      // 对数组中的每一项调用 observe
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }

  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}
```

可以看到在`Observer`类中定义了`this.dep = new Dep(); `，将`dep`(依赖)保存在了`Observer`的实例中，再将实例挂载到了`this.__ob__`。

这样挂载完毕后，在`dependArray`中就可以通过`__ob__.dep.depend()`将数组的依赖保存在`Observer`的实例中。

::: tip 为什么数组的依赖要保存在`Observer`的实例中？
数组的依赖，既要保证在`getter`中能访问到，也要能在后续`Array`触发的时候（拦截器中）能访问到，`Observer`就成了最好的保存位置。
:::

## 触发依赖

依赖收集完毕后，我们来研究下如何触发依赖，之前说过`Array`原型上的方法来改变数组的内容，并不会触发 `setter`。所以也没办法通过`setter`去触发依赖。

但既然是通过`Array`原型上的方法来改变数组内容，那我们就加个拦截器去覆盖原型上的方法，以`push`为例：

```js
let arr = [1,2,3]
arr.push(4)
Array.prototype.newPush = function(val){
  console.log('arr被修改了')
  this.push(val)
}
arr.newPush(4)
```

在上面这个例子中，我们针对数组的原生`push`方法定义个一个新的`newPush`方法，这个`newPush`方法内部调用了原生`push`方法，这样就保证了新的`newPush`方法跟原生`push`方法具有相同的功能，而且我们还可以在新的`newPush`方法内部干一些别的事情，比如触发依赖。

其实在 Vue 内部，就是这么处理的，源码在`src/core/observer/array.js`

```js
const arrayProto = Array.prototype
// 创建一个继承自Array.prototype的对象，后续在此基础上修改。防止污染Array
export const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    // 对新增元素的变化侦测
    if (inserted) ob.observeArray(inserted)
    // 触发依赖
    ob.dep.notify()
    return result
  })
})
```

上述代码创建了一个数组方法拦截器，它拦截在数组实例与`Array.prototype`之间，在拦截器内重写了针对`push`、`pop`、`shift`、`unshift`、`splice`、`sort`和`reverse`七个数组原型中的方法拦截，当数组实例使用操作数组方法时，其实使用的是拦截器中重写的方法，而不再使用`Array.prototype`上的原生方法。如下图所示

![数组拦截器](@assets/vue2/arrayIntercept.png)

在拦截器中，通过`this.__ob__`获取到对应的`Observer`实例，并触发其中的依赖。`this.__ob__`就是之前讲的`Observer`实例。

::: tip Vue拦截数组时，为什么要使用Object.create(Array.prototype)？
使用Object.create继承Array.prototype的所有方法，可以在这个对象上进行修改的时候而不影响原始的Array.prototype
:::

综上所述，`Array`在`getter`中收集依赖，在拦截器中触发依赖。从而实现对`Array`的变化侦测。

## 不足

通过拦截器，我们实现了对`Array`的触发依赖，但这种方法仅限于对拦截的`push`、`pop`、`shift`、`unshift`、`splice`、`sort`和`reverse`七个方法有效。有一些数组操作是无法拦截的。例如：

```js
this.list[0] = 1;
```

通过下标操作数组，无法侦测到数组的变化

```js
this.list.length = 0;
```

使用`.length = 0`的方式清空数组，也不侦测到数组的变化

为了解决这个问题 Vue2 提供了两个 API `vm.$set` 与 `vm.$delete`，后续详细介绍它们。

## 总结

`Array`可以通过被`Object`包裹的方式，在`this.list`之类的操作中触发`getter`，从而收集依赖。

但`Array`通过原型上的方法调用时，无法触发`setter`，我们只能针对原型上的方法封装拦截器，当数组实例使用操作数组方法时，其实使用的是拦截器中重写的方法，从而触发依赖。

为了让`getter`和拦截器中的依赖都能访问到，Vue将依赖列表放置在`Observer`的实例中。
