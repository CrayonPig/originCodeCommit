# Vue.filter

`Vue.directive`、`Vue.filter`和`Vue.component`这三个API在Vue中是在一个函数中实现的功能，这里先拆开分析实现逻辑，最后在`Vue.component`时分析Vue的源码。

## 用法回顾

其用法如下：

```javascript
Vue.filter( id, [definition] )
```

- **参数**：

  - `{string} id`
  - `{Function} [definition]`

- **作用**：

  注册或获取全局过滤器。

  ``` javascript
  // 注册
  Vue.filter('my-filter', function (value) {
    // 返回处理后的值
  })

  // getter，返回已注册的过滤器
  var myFilter = Vue.filter('my-filter')
  ```

## 原理分析

从用法回顾中可以知道，该API是用来注册或获取全局过滤器的，接收两个参数：过滤器`id`和过滤器的定义。同全局指令一样，注册过滤器是将定义好的过滤器存放在某个位置，获取过滤器是根据过滤器`id`从存放过滤器的位置来读取过滤器。至于如何让过滤器生效的问题我们会在过滤器篇单独展开介绍。

下面我们就来看一下该API的内部实现原理，其代码如下：

```javascript
Vue.options = Object.create(null)
// Vue类上添加filters属性，用于后续存放指令
Vue.options['filters'] = Object.create(null)

Vue.filter = function (id, definition) {
  // 如果没有传入定义，则为getter，直接返回存放的相关过滤器
  if (!definition) {
    return this.options['filters'][id]
  // 如果传入了定义，将其存储在options中
  } else {
    this.options['filters'][id] = definition
    return definition
  }
}
```

代码逻辑较简单，就是简单的存储和读取，这里就不赘述了。
