# Vue.version

## 用法回顾

其用法如下：

```javascript
Vue.version
```

- **细节**：提供字符串形式的 Vue 安装版本号。这对社区的插件和组件来说非常有用，你可以根据不同的版本号采取不同的策略。

- **用法**：

  ```javascript
  var version = Number(Vue.version.split('.')[0])

  if (version === 2) {
    // Vue v2.x.x
  } else if (version === 1) {
    // Vue v1.x.x
  } else {
    // Unsupported versions of Vue
  }
  ```

## 原理分析

从用法回顾中可以知道，该API是用来标识当前构建的`Vue.js`的版本号，对于日常业务开发几乎用不到，但是对于插件编写非常有用，可以根据`Vue`版本的不同从而做一些不同的事情。

```js
/// src/core/util.js

Vue.version = '__VERSION__'
```

```js
// scripts/config.js
const version = process.env.VERSION || require('../package.json').version

function genConfig (name) {
  const config = {
    // ...
    plugins: [
      // 替换变量
      replace({
        __WEEX__: !!opts.weex,
        __WEEX_VERSION__: weexVersion,
        __VERSION__: version
      }),
    ]
  }
}
```

该API是将`Vue.version`设置为固定字符串`__VERSION__`, 后续在使用`rollup`构建的时候，将字符串替换为环境变量里面的`VERSION`或`package.json`中的`version`字段
