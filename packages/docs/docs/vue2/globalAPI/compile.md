# Vue.compile

## 用法回顾

其用法如下：

```javascript
Vue.compile( template )
```

- **参数**：

  - `{string} template`

- **作用**：

  在 render 函数中编译模板字符串。**只在独立构建时有效**

  ```javascript
  var res = Vue.compile('<div><span>{{ msg }}</span></div>')

  new Vue({
    data: {
      msg: 'hello'
    },
    render: res.render,
    staticRenderFns: res.staticRenderFns
  })
  ```

## 原理分析

从用法回顾中可以知道，该API是用来编译模板字符串的，我们在日常业务开发中几乎用不到，它内部是调用了`compileToFunctions`方法，如下：

```javascript
// src/platforms/web/entry-runtime-with-compiler.js

Vue.compile = compileToFunctions;
```

关于`compileToFunctions`方法在**模板编译篇**已经做了非常详细的介绍，此处不再重复。
