# 构建版本

在 Vue3 中，执行 `npm run build` 后，会生成以下文件，分别代表了不同的版本

```js
├── vue.cjs.js                        # CommonJS 的模块化构建版本，适合在 Node.js 环境中使用
├── vue.cjs.prod.js                   # CommonJS 的模块化构建版本，开启 prod 模式，适合在 Node.js 环境中使用
├── vue.esm-browser.js                # ES Module 的浏览器模块版本，适合在浏览器环境中使用
├── vue.esm-browser.prod.js           # ES Module 的浏览器模块版本，开启 prod 模式，适合在浏览器环境中使用
├── vue.esm-bundler.js                # ES Module 的构建版本，适合在构建工具中使用
├── vue.global.js                     # 全局变量的构建版本，无 tree-shaking 支持
├── vue.global.prod.js                # 全局变量的构建版本，开启 prod 模式，无 tree-shaking 支持
├── vue.runtime.esm-browser.js        # 运行时 + 编译器，浏览器模块版本，无 tree-shaking 支持
├── vue.runtime.esm-browser.prod.js   # 运行时 + 编译器，浏览器模块版本，开启 prod 模式，无 tree-shaking 支持
├── vue.runtime.esm-bundler.js        # 运行时 + 编译器，构建版本，无 tree-shaking 支持
├── vue.runtime.global.js             # 运行时，全局变量的构建版本，无 tree-shaking 支持
└── vue.runtime.global.prod.js        # 运行时，全局变量的构建版本，开启 prod 模式，无 tree-shaking 支持
```

