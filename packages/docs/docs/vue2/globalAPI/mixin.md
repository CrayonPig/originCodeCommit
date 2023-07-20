# Vue.mixin

## 用法回顾

其用法如下：

```javascript
Vue.mixin( mixin )
```

- **参数**：

  - `{Object} mixin`

- **作用**：

  全局注册一个混入，影响注册之后所有创建的每个 Vue 实例。插件作者可以使用混入，向组件注入自定义的行为。**不推荐在应用代码中使用**。

## 原理分析

从用法回顾中可以知道，该API是用来向全局注册一个混入，即可以修改`Vue.options`属性，并且会影响之后的所有`Vue`实例，这个API虽然在日常的业务开发中几乎用不到，但是在编写`Vue`插件时用处非常大。下面我们就来看一下该API的内部实现原理。

```js
// src/core/global-api/mixin.js

export function initMixin (Vue: GlobalAPI) {
  Vue.mixin = function (mixin: Object) {
    // 修改`Vue.options`属性进而影响之后的所有`Vue`实例
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}
```

我们上文提到，可以通过修改`Vue.options`属性进而影响之后的所有`Vue`实例。所以这里只需要将传入的`mixin`对象与`this.options`合并即可

