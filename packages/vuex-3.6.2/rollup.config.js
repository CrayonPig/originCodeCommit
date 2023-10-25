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
