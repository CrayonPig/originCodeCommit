# 源码构建

基于 NPM 托管的项目都有一个 package.json 文件，该文件是对项目的描述，我们一般会配置 `script` 字段作为NPM的执行脚本，Vue2源码的构建脚本如下：

```json
{
  "scripts": {
    "dev": "node examples/server.js",
    "build": "npm run build:main && npm run build:logger",
    "build:main": "node scripts/build-main.js",
    "build:logger": "node scripts/build-logger.js",
    "lint": "eslint src test",
    "test": "npm run lint && npm run test:types && npm run test:unit && npm run test:ssr && npm run test:e2e && npm run test:esm",
    "test:unit": "jest --testPathIgnorePatterns test/e2e",
    "test:e2e": "start-server-and-test dev http://localhost:8080 \"jest --testPathIgnorePatterns test/unit\"",
    "test:ssr": "cross-env VUE_ENV=server jest --testPathIgnorePatterns test/e2e",
    "test:types": "tsc -p types/test",
    "test:esm": "node test/esm/esm-test.js",
    "coverage": "jest --testPathIgnorePatterns test/e2e --coverage",
    "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s",
    "release": "node scripts/release.js",
    "docs": "vuepress dev docs",
    "docs:build": "vuepress build docs"
  }
}
```

我们可以发现，跟 `build` 相关的命令共有三条。

当我们执行 `npm run build` 时，实际上就是在执行 `node scripts/build-main.js`和`node scripts/build-logger.js`

## build:main

我们先找到 `scripts/build-main.jss` 文件，看他是如何构建的。


```js
// scripts/build-main.js
const { run } = require('./build')

const files = [
  'dist/vuex.esm.browser.js',
  'dist/vuex.esm.browser.min.js',
  'dist/vuex.esm.js',
  'dist/vuex.js',
  'dist/vuex.min.js',
  'dist/vuex.common.js'
]

run('rollup.main.config.js', files)
```

代码较为简单，从`./build`中导入`run`函数，然后调用`run`函数，传入`rollup.main.config.js`和`files`数组。

我们先看`rollup.main.config.js`文件

```js
// rollup.main.config.js
import { createEntries } from './rollup.config'

export default createEntries([
  { input: 'src/index.js', file: 'dist/vuex.esm.browser.js', format: 'es', browser: true, transpile: false, env: 'development' },
  { input: 'src/index.js', file: 'dist/vuex.esm.browser.min.js', format: 'es', browser: true, transpile: false, minify: true, env: 'production' },
  { input: 'src/index.js', file: 'dist/vuex.esm.js', format: 'es', env: 'development' },
  { input: 'src/index.cjs.js', file: 'dist/vuex.js', format: 'umd', env: 'development' },
  { input: 'src/index.cjs.js', file: 'dist/vuex.min.js', format: 'umd', minify: true, env: 'production' },
  { input: 'src/index.cjs.js', file: 'dist/vuex.common.js', format: 'cjs', env: 'development' }
])
```

上述代码可以看出，这是调用`./rollup.config`文件中的`createEntries`方法。

我们再找到`createEntries`的定义，看它是如何创建构建配置的。

```js
// rollup.config.js

import buble from '@rollup/plugin-buble'
import replace from '@rollup/plugin-replace'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

const banner = `/*!
 * vuex v${pkg.version}
 * (c) ${new Date().getFullYear()} Evan You
 * @license MIT
 */`

export function createEntries (configs) {
  return configs.map((c) => createEntry(c))
}

function createEntry (config) {
  const c = {
    input: config.input,
    plugins: [],
    output: {
      banner,
      file: config.file,
      format: config.format
    },
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg)
      }
    }
  }

  if (config.format === 'umd') {
    c.output.name = c.output.name || 'Vuex'
  }

  // 替换环境变量
  c.plugins.push(replace({
    __VERSION__: pkg.version,
    __DEV__: config.format !== 'umd' && !config.browser
      ? `(process.env.NODE_ENV !== 'production')`
      : config.env !== 'production'
  }))

  if (config.transpile !== false) {
    // 将 ES6+ 的代码转换为 ES5 代码
    c.plugins.push(buble())
  }

  // 解析和处理 Node.js 模块导入语句
  c.plugins.push(resolve())
  // 将 CommonJS 模块转换为 ES6 模块
  c.plugins.push(commonjs())

  if (config.minify) {
    // 压缩
    c.plugins.push(terser({ module: config.format === 'es' }))
  }

  return c
}
```

代码较为简单，可以看出来，就是循环传入的`configs`，并为每项添加`rollup`配置并导出，注释较为详细，不展开讲了

那么此刻我们知道了，`createEntries`方法就是传入一个数组，数组中的每一项都是一个对象，表示一个构建配置。

回过头，我们再看`run`函数，它是在`build.js`文件中定义的，它接收两个参数，一个是配置列表，一个是需要构建的文件列表。

```js
const fs = require('fs-extra')
const chalk = require('chalk')
const execa = require('execa')
const { gzipSync } = require('zlib')
const { compress } = require('brotli')

async function run (config, files) {
  await Promise.all([build(config), copy()])
  checkAllSizes(files)
}

async function build (config) {
  await execa('rollup', ['-c', config], { stdio: 'inherit' })
}

async function copy () {
  await fs.copy('src/index.mjs', 'dist/vuex.mjs')
}

function checkAllSizes (files) {
  console.log()
  files.map((f) => checkSize(f))
  console.log()
}

// 检查文件大小
function checkSize (file) {
  const f = fs.readFileSync(file)
  const minSize = (f.length / 1024).toFixed(2) + 'kb'
  const gzipped = gzipSync(f)
  const gzippedSize = (gzipped.length / 1024).toFixed(2) + 'kb'
  const compressed = compress(f)
  const compressedSize = (compressed.length / 1024).toFixed(2) + 'kb'
  console.log(
    `${chalk.gray(
      chalk.bold(file)
    )} size:${minSize} / gzip:${gzippedSize} / brotli:${compressedSize}`
  )
}

module.exports = { run }
```

可以看出`run`函数实际上就是使用`rollup`将生成好的配置项循环执行，并在构建完成后执行`checkAllSizes`函数，检查所有文件的大小。

## build:logger

然后我们找到 `scripts/build-logger.js` 文件，看他是如何构建的。

```js
const { run } = require('./build')

const files = ['dist/logger.js']

run('rollup.logger.config.js', files)
```

跟执行`main`一样，都是调用了`run`函数，传入了配置项和需要构建的文件列表。此处不赘述
