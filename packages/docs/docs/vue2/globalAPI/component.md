# Vue.component

`Vue.directive`、`Vue.filter`和`Vue.component`这三个API在Vue中是在一个函数中实现的功能，这里先拆开分析实现逻辑，本小节最后总结时分析Vue的源码。

## 用法回顾

其用法如下：

```javascript
Vue.component( id, [definition] )
```

- **参数**：

  - `{string} id`
  - `{Function | Object} [definition]`

- **作用**：

  注册或获取全局组件。注册还会自动使用给定的`id`设置组件的名称

  ```javascript
  // 注册组件，传入一个扩展过的构造器
  Vue.component('my-component', Vue.extend({ /* ... */ }))

  // 注册组件，传入一个选项对象 (自动调用 Vue.extend)
  Vue.component('my-component', { /* ... */ })

  // 获取注册的组件 (始终返回构造器)
  var MyComponent = Vue.component('my-component')
  ```

## 原理分析

从用法回顾中可以知道，该API是用来注册或获取全局组件的，接收两个参数：组件`id`和组件的定义。 同全局指令一样，注册全局组件是将定义好的组件存放在某个位置，获取组件是根据组件`id`从存放组件的位置来读取组件。

下面我们就来看一下该API的内部实现原理，其代码如下：

```javascript
Vue.options = Object.create(null)
// Vue类上添加components属性，用于后续存放组件
Vue.options['components'] = Object.create(null)

Vue.filter = function (id, definition) {
  // 如果没有组件的定义，则为getter，直接返回存放的相关组件
  if (!definition) {
    return this.options['components'][id]
  } else {
    // 如果传入了一个对象，则使用Vue.extend创建为Vue的子类
    if (isPlainObject(definition)) {
      definition.name = definition.name || id
      definition = this.options._base.extend(definition)
    }
    // 存储组件
    this.options['components'][id] = definition
    return definition
  }
}
```

代码逻辑较简单，就是简单的存储和定义二次封装，这里值得一说的是，`component`较为特殊，如果传入的只是一个对象，则使用Vue.extend创建为Vue的子类，保证后续使用时可以使用Vue相关的方法。

## 回归源码

我们前面说过，`Vue.directive`、`Vue.filter`和`Vue.component`这三个API在Vue中是在同一个函数中实现的，相信大家看过这三个的实现逻辑后，也发现这三者实现很类似。接下来我们看源码是如何实现的

```js
// src/shared/constants.js

export const ASSET_TYPES = [
  'component',
  'directive',
  'filter'
]
```

```js
// src/core/global-api/index.js

ASSET_TYPES.forEach(type => {
  Vue.options[type + 's'] = Object.create(null)
})
```

```js
// src/core/global-api/assets.js

ASSET_TYPES.forEach(type => {
  Vue[type] = function (
    id: string,
    definition: Function | Object
  ): Function | Object | void {
    // 不传入定义，则为getter，返回存储的定义
    if (!definition) {
      return this.options[type + 's'][id]
    } else {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && type === 'component') {
        validateComponentName(id)
      }
      // 如果是component，并且definition是个对象，则调用Vue.extend初始化为Vue子类
      if (type === 'component' && isPlainObject(definition)) {
        definition.name = definition.name || id
        definition = this.options._base.extend(definition)
      }
      // 如果是directive，并且definition是个函数
      if (type === 'directive' && typeof definition === 'function') {
        // 默认监听bind和update事件
        definition = { bind: definition, update: definition }
      }
      // 存储定义
      this.options[type + 's'][id] = definition
      return definition
    }
  }
})
```

源码如上，跟我们之前分开分析的一样，就不赘述了。