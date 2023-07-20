# Vue.extend

## 用法回顾

其用法如下：

```javascript
Vue.extend( options )
```

- **参数**：

  - `{Object} options`

- **作用**：

  使用基础 `Vue` 构造器，创建一个“子类”。参数是一个包含组件选项的对象。

  `data` 选项是特例，需要注意 - 在 `Vue.extend()` 中它必须是函数

  ```html
  <div id="mount-point"></div>
  ```

  ```javascript
  // 创建构造器
  var Profile = Vue.extend({
    template: '<p>{{firstName}} {{lastName}} aka {{alias}}</p>',
    data: function () {
      return {
        firstName: 'Walter',
        lastName: 'White',
        alias: 'Heisenberg'
      }
    }
  })
  // 创建 Profile 实例，并挂载到一个元素上。
  new Profile().$mount('#mount-point')
  ```

  结果如下：

  ```html
  <p>Walter White aka Heisenberg</p>
  ```

## 原理分析

通过用法回顾，我们知道`Vue.extend`的作用是创建一个子类，所以实现思路就是创建一个子类，然后继承Vue构造函数的一些功能。

虽然在平时的开发中很少用到它，但是在 Vue 源码内部，`extend` 方法却很重要。因为在 Vue 中，组件的本质就是通过 `extend` 方法创建出来的 Vue 构造函数的子类构造函数。

```js
// src/core/global-api/extend.js

export function initExtend (Vue: GlobalAPI) {
  Vue.cid = 0
  let cid = 1

  Vue.extend = function (extendOptions: Object): Function {
    // 初始化用户传入的参数
    extendOptions = extendOptions || {}
    // 指向父类
    const Super = this
    // 父类cid
    const SuperId = Super.cid
    // 获取缓存项
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
    // 如果父类已经创建过子类，直接使用缓存
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }
    // 获取name，初始化没设置，就使用父类的
    const name = extendOptions.name || Super.options.name
    if (process.env.NODE_ENV !== 'production' && name) {
      validateComponentName(name)
    }

    // 创建子类Sub
    const Sub = function VueComponent (options) {
      // 调用原型上的_init
      this._init(options)
    }
    // 继承父类原型方法
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub
    // 添加子类唯一标识
    Sub.cid = cid++
    // 合并父类和子类选项并设置为子类选项
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    )
    // 将父类存到子类的super字段中
    Sub['super'] = Super

    // 初始化props
    if (Sub.options.props) {
      initProps(Sub)
    }
    // 初始化computed
    if (Sub.options.computed) {
      initComputed(Sub)
    }

    // 复制父类的extend/mixin/use
    Sub.extend = Super.extend
    Sub.mixin = Super.mixin
    Sub.use = Super.use

    // 复制父类的'component','directive', 'filter'
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type]
    })
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub
    }

    // 定义子类特殊的属性
    Sub.superOptions = Super.options
    Sub.extendOptions = extendOptions
    Sub.sealedOptions = extend({}, Sub.options)

    // cache constructor
    // 将初始化完毕的子类加入到缓存中
    cachedCtors[SuperId] = Sub
    return Sub
  }
}

function initProps (Comp) {
  const props = Comp.options.props
  // 将key代理到_props
  for (const key in props) {
    proxy(Comp.prototype, `_props`, key)
  }
}

function initComputed (Comp) {
  const computed = Comp.options.computed
  // 遍历computed，重新定义一遍
  for (const key in computed) {
    defineComputed(Comp.prototype, key, computed[key])
  }
}
```

上述代码的逻辑较为简单，跟我们之前分析的一样，创建一个子类，然后继承Vue构造函数的一些功能。里面大量的初始化方法，我们在**生命周期篇**都已经介绍过了，此处不再重复介绍

这里需要注意的是，Vue为了性能考虑，在`Vue.extend`方法中增加了缓存策略。反复调用`Vue.extend`会同一个结果。
