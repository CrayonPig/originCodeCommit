# 源码入口

在源码构建的过程中，我们说过默认为`src/index.js`为入口文件。

```js
// build/build.js
function genConfig(opts) {
  const config = {
    input: {
      // 如果没有指定入口文件，则使用src/index.js为入口文件
      input: opts.input || resolve("src/index.js"),
      // ...
    },
  };
```

找到`src/index.js`文件

```js
import VueRouter from './entries/cjs'

export default VueRouter
```

很明显，入口还有一层，我们再找`src/entries/cjs`

```js
import VueRouter from '../router'

export default VueRouter
```

还有一层，再看`src/router.js`

```js
export default class VueRouter {
  // ...
}

VueRouter.install = install
```

好了，至此，真正的入口文件就找到了`src/router.js`
