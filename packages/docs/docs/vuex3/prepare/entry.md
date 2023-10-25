# 源码入口

在`VueX`的源码中，主入口有三个，分别是`index.js`、`index.mjs`和`index.cjs.js`，它们的作用是什么呢？

1. `index.js`：这是一个普通的JavaScript文件，使用ECMAScript 5语法编写。它是Vuex 3的默认入口文件，包含了主要的代码逻辑和功能。该文件使用CommonJS模块规范，可以通过`require()`语句引入其他模块。
2. `index.mjs`：这是一个使用ECMAScript模块规范（ESM）的JavaScript文件。它使用`import`和`export`语句来引入和导出模块。`index.mjs`文件通常用于支持使用ESM的现代浏览器或Node.js环境。
3. `index.cjs.js`：这是一个使用CommonJS模块规范（CJS）的JavaScript文件。它使用`require()`和`module.exports`语句来引入和导出模块。`index.cjs.js`文件通常用于支持使用CJS的旧版浏览器或Node.js环境。

`VueX`的源码中包含这三种文件类型是为了支持不同的模块规范和兼容不同的环境。通常情况下，开发者可以根据自己的项目需求选择使用哪种文件类型。在支持ESM的环境中，可以使用`index.mjs`；在支持CJS的环境中，可以使用`index.js`或`index.cjs.js`。
