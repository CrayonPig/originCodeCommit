# 工作原理

上一小节中，我们介绍了过滤器通过模板编译后，编译的成`_f`函数。

我们用之前的例子说明：

```html
{{ message | capitalize }}
```

假设我们现在有这么一个过滤器，经过模板编译后会被编译成如下内容

```js
_f("capitalize")(message)
```

`_f`是`resolveFilter`的别名，本节我们一起分析`resolveFilter`的实现。

## resolveFilter函数

`_f` 是在`installRenderHelpers`函数中定义的

```js
// src/core/instance/render-helpers/index.js

export function installRenderHelpers (target: any) {
  // 解析过滤器
  target._f = resolveFilter
}
```

我们可以看到，在这个函数中，将`resolveFilter`赋值给`_f`，这也印证了我们上文中说的`_f`是`resolveFilter`的别名。

再去找到`resolveFilter`的定义

```js
// src/core/instance/render-helpers/resolve-filter.js

export const identity = (_: any) => _


export function resolveFilter (id: string): Function {
  return resolveAsset(this.$options, 'filters', id, true) || identity
}
```

很明显，`resolveFilter`函数中，起作用的是`resolveAsset`，我们再找其定义

```js
// src/core/util/options.js

export function resolveAsset (
  options: Object,
  type: string,
  id: string,
  warnMissing?: boolean
): any {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return
  }
  // 获取到this.$options.filters
  const assets = options[type]
  // 先从本地注册中查找
  if (hasOwn(assets, id)) return assets[id]
  const camelizedId = camelize(id)
  if (hasOwn(assets, camelizedId)) return assets[camelizedId]
  const PascalCaseId = capitalize(camelizedId)
  if (hasOwn(assets, PascalCaseId)) return assets[PascalCaseId]
  // 再从原型链中查找
  const res = assets[id] || assets[camelizedId] || assets[PascalCaseId]
  return res
}
```

我们之前在讲`Vue.filter`的时候说过，`filter`最终被存到了`this.options['filters']`中，所以这里读取的时候，也是这样的逻辑

1. 先获取`this.options['filters']`所有的定义赋值为`assets`
2. 使用`id`在`assets`中查找，找到返回
3. 将`id`转化为驼峰式在`assets`中查找，找到返回
4. 将`id`转化为首字母大写在`assets`中查找，找到返回
5. 如果以上还不存在，则在原型链上查找以上三种形式

其实很明显，`resolveFilter`函数其实就是在根据过滤器id获取到用户定义的对应的过滤器函数并返回，拿到用户定义的过滤器函数之后，就可以调用该函数并传入参数使其生效了。

![filterPrinciple1](@assets/vue2/filterPrinciple1.jpg)

## 串联过滤器原理

上述分析了单个过滤器的工作原理，其实串联过滤器的原理也是一样的，还是先根据过滤器id获取到对应的过滤器函数，然后传入参数调用即可，唯一有所区别的是：对于多个串联过滤器，在调用过滤器函数传递参数时，后一个过滤器的输入参数是前一个过滤器的输出结果。举个例子：

假如有如下过滤器：

```javascript
{{ message | filterA | filterB }}

filters: {
    filterA: function (value) {
        // ...
    },
    filterB: function (value) {
        // ...
    },
}
```

那么它被编译成渲染函数字符串后，会变成这个样子：

![filterPrinciple2](@assets/vue2/filterPrinciple2.jpg)

可以看到，过滤器`filterA`的执行结果作为参数传给了过滤器`filterB`。

## 过滤器接收参数

我们上节介绍渲染成`_f`函数的时候，会判断是否存在`(`。介绍用法的时候也说过过滤器作为一个函数可以接收参数传递。

假如有如下过滤器：

```javascript
{{ message | filterA | filterB(arg) }}

filters: {
  filterA: function (value) {
    // ...
  },
  filterB: function (value,arg) {
    return value + arg
  },
}
```

那么它被编译成渲染函数字符串后，会变成这个样子：

![filterPrinciple3](@assets/vue2/filterPrinciple3.jpg)

可以看到，当过滤器接收其余参数时，它的参数都是从第二个参数开始往后传入的。因为第一个参数永远是之前操作链的结果。

## 总结

通过本小节，我们知道所谓`_f`函数其实就是`resolveFilter`函数的别名，在`resolveFilter`函数内部是根据过滤器`id`从当前实例的`$options`中的`filters`属性中获取到对应的过滤器函数，在之后执行渲染函数的时候就会执行获取到的过滤器函数。
