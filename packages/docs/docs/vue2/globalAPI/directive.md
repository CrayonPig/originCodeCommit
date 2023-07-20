# Vue.directive

`Vue.directive`、`Vue.filter`和`Vue.component`这三个API在Vue中是在一个函数中实现的功能，这里先拆开分析实现逻辑，最后在`Vue.component`时分析Vue的源码。

## 用法回顾

其用法如下：

```javascript
Vue.directive( id, [definition] )
```

- **参数**：

  - `{string} id`
  - `{Function | Object} [definition]`

- **作用**：

  注册或获取全局指令。

  ```javascript
  // 注册
  Vue.directive('my-directive', {
    bind: function () {},
    inserted: function () {},
    update: function () {},
    componentUpdated: function () {},
    unbind: function () {}
  })

  // 注册 (指令函数)
  Vue.directive('my-directive', function () {
    // 这里将会被 `bind` 和 `update` 调用
  })

  // getter，返回已注册的指令
  var myDirective = Vue.directive('my-directive')
  ```

## 原理分析

从用法回顾中可以知道，该API是用来注册或获取全局指令的，接收两个参数：指令id和指令的定义。这里需要注意一点的是：注册指令是将定义好的指令存放在某个位置，获取指令是根据指令id从存放指令的位置来读取指令。至于如何让指令生效的问题我们会在指令篇单独展开介绍。

其实现代码如下：

```js
Vue.options = Object.create(null)
// Vue类上添加directives属性，用于后续存放指令
Vue.options['directives'] = Object.create(null)

Vue.directive = function (id, definition) {
  // 如果没有定义指令，则为getter，直接返回存放的相关指令
  if (!definition) {
    return this.options['directives'][id]
  // 如果传入指令的定义，则判断为定义指令
  } else {
    // 如果指令的定义是个函数
    if (typeof definition === 'function') {
      // 默认监听bind和update事件
      definition = { bind: definition, update: definition }
    }
    // 存储指令对象，
    // 如果definition 不是函数，则将其视为用户自定义的指令对象
    this.options['directives'][id] = definition
    return definition
  }
}
```

代码逻辑较简单，就是简单的存储和定义二次封装，这里就不赘述了。