const path = require('path')
const buble = require('rollup-plugin-buble')
const flow = require('rollup-plugin-flow-no-whitespace')
const cjs = require('@rollup/plugin-commonjs')
const node = require('@rollup/plugin-node-resolve').nodeResolve
const replace = require('rollup-plugin-replace')
const version = process.env.VERSION || require('../package.json').version
const banner = `/*!
  * vue-router v${version}
  * (c) ${new Date().getFullYear()} Evan You
  * @license MIT
  */`

// 拼接完整路径
const resolve = _path => path.resolve(__dirname, '../', _path)

module.exports = [
  // browser dev
  {
    file: resolve('dist/vue-router.js'),
    format: 'umd',
    env: 'development'
  },
  {
    file: resolve('dist/vue-router.min.js'),
    format: 'umd',
    env: 'production'
  },
  {
    file: resolve('dist/vue-router.common.js'),
    format: 'cjs'
  },
  {
    input: resolve('src/entries/esm.js'),
    file: resolve('dist/vue-router.esm.js'),
    format: 'es'
  },
  {
    input: resolve('src/entries/esm.js'),
    file: resolve('dist/vue-router.mjs'),
    format: 'es'
  },
  {
    input: resolve('src/entries/esm.js'),
    file: resolve('dist/vue-router.esm.browser.js'),
    format: 'es',
    env: 'development',
    transpile: false
  },
  {
    input: resolve('src/entries/esm.js'),
    file: resolve('dist/vue-router.esm.browser.min.js'),
    format: 'es',
    env: 'production',
    transpile: false
  },
  {
    input: resolve('src/composables/index.js'),
    file: resolve('./composables.mjs'),
    format: 'es'
  },
  {
    input: resolve('src/composables/index.js'),
    file: resolve('./composables.js'),
    format: 'cjs'
  }
].map(genConfig)

function genConfig (opts) {
  const config = {
    input: {
      // 如果没有指定入口文件，则使用src/index.js为入口文件
      input: opts.input || resolve('src/index.js'),
      plugins: [
        // 去除 Flow 类型注解产生的空格
        flow(),
        // 解析和处理 Node.js 模块导入语句
        node(),
        // 将 CommonJS 模块转换为 ES6 模块
        cjs(),
        // 全局替换
        replace({
          __VERSION__: version
        })
      ],
      // 声明外部依赖，打包时不构建
      external: ['vue']
    },
    output: {
      file: opts.file,
      format: opts.format,
      banner,
      name: 'VueRouter'
    }
  }

  if (opts.env) {
    config.input.plugins.unshift(
      // 替换环境变量
      replace({
        'process.env.NODE_ENV': JSON.stringify(opts.env)
      })
    )
  }

  if (opts.transpile !== false) {
    // 将 ES6+ 的代码转换为 ES5 代码
    config.input.plugins.push(buble())
  }

  return config
}
