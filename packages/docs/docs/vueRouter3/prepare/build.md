# 源码构建

基于 NPM 托管的项目都有一个 `package.json` 文件，该文件是对项目的描述，我们一般会配置 `script` 字段作为NPM的执行脚本，Vue Router V3 源码的构建脚本如下：

```json
{
  "scripts": {
    "build": "node build/build.js",
  }
}
```

当我们执行 `npm run build` 时，实际上就是在执行 `node build/build.js`, 我们找到 `build/build.js` 文件，看他是如何构建的。

## 构建配置

```js
// build/build.js

// 如果不存在dist文件夹，则创建dist文件夹
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist')
}

build(configs)
```

主要逻辑很简单，就是先判断项目中有没有`dist`文件夹，如果没有则创建一个。最后执行`build`函数将`configs`传入进行构建。

我们先看`configs`是啥，其定义在`build/build.js`中

```js
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
```

上述代码较为简单，可以看出来，就是处理`rollup`配置并导出，注释较为详细，不展开讲了

这里需要提一下的是，在处理入口文件`input`的时候，默认为`src/index.js`为入口文件。

梳理完`configs`后，再返回看`build`函数

```js
// build/build.js

function build (builds) {
  let built = 0
  const total = builds.length
  const next = () => {
    // 循环构建，直到所有的构建过一遍
    buildEntry(builds[built])
      .then(() => {
        built++
        if (built < total) {
          next()
        }
      })
      .catch(logError)
  }

  next()
}

function buildEntry ({ input, output }) {
  const { file, banner } = output
  // 最后生成文件名后缀为min.js的为构建环境
  const isProd = /min\.js$/.test(file)
  return rollup
    .rollup(input)
    // generate可以生成输出，指定output为输出选项
    .then(bundle => bundle.generate(output))
    .then(bundle => {
      // console.log(bundle)
      const code = bundle.output[0].code
      if (isProd) {
        // 如果是构建环境，则压缩代码
        const minified =
          (banner ? banner + '\n' : '') +
          terser.minify(code, {
            toplevel: true,
            output: {
              ascii_only: true
            },
            compress: {
              pure_funcs: ['makeMap']
            }
          }).code
        return write(file, minified, true)
      } else {
        return write(file, code)
      }
    })
}

function write (dest, code, zip) {
  return new Promise((resolve, reject) => {
    // 打印log
    function report (extra) {
      console.log(
        blue(path.relative(process.cwd(), dest)) +
          ' ' +
          getSize(code) +
          (extra || '')
      )
      resolve()
    }
    // 写入文件
    fs.writeFile(dest, code, err => {
      if (err) return reject(err)
      if (zip) {
        // 有压缩选项则写入完毕后压缩文件
        zlib.gzip(code, (err, zipped) => {
          if (err) return reject(err)
          report(' (gzipped: ' + getSize(zipped) + ')')
        })
      } else {
        report()
      }
    })
  })
}
```

从上述代码中，我们可以看出

1. `build` 函数接受上一步我们分析的 `configs`， 并使用`promise` 异步变同步循环执行 `buildEntry` 函数。
2. `buildEntry` 函数将`config`作为调用`rollup`的参数进行构建
3. 构建完毕后，如果是生产环境，使用`terser`压缩代码, 并生成压缩文件。否则直接生成文件
