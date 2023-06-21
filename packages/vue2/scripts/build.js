const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const rollup = require('rollup')
const uglify = require('uglify-js')

// 没有dist文件夹则创建
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist')
}

// 获取所有预设的构建模式
let builds = require('./config').getAllBuilds()

// filter builds via command line arg
// 根据运行中的额外参数筛选需要构建的模式
if (process.argv[2]) {
  const filters = process.argv[2].split(',')
  builds = builds.filter(b => {
    return filters.some(f => b.output.file.indexOf(f) > -1 || b._name.indexOf(f) > -1)
  })
} else {
  // filter out weex builds by default
  // 默认情况下不打包 weex 相关的构建模式
  builds = builds.filter(b => {
    return b.output.file.indexOf('weex') === -1
  })
}

build(builds)

function build (builds) {
  let built = 0
  const total = builds.length
  // 异步变同步循环构建
  const next = () => {
    buildEntry(builds[built]).then(() => {
      built++
      if (built < total) {
        next()
      }
    }).catch(logError)
  }

  next()
}

function buildEntry (config) {
  const output = config.output
  const { file, banner } = output
  // 最后生成文件名后缀为min.js的为构建环境
  const isProd = /min\.js$/.test(file)
  return rollup.rollup(config)
    // generate可以生成输出，指定output为输出选项
    .then(bundle => bundle.generate(output))
    .then(({ code }) => {
      if (isProd) {
        // 如果是构建环境，则压缩代码
        var minified = (banner ? banner + '\n' : '') + uglify.minify(code, {
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
    function report (extra) {
      // 打印特定格式日志
      console.log(blue(path.relative(process.cwd(), dest)) + ' ' + getSize(code) + (extra || ''))
      resolve()
    }
    // 将代码写入文件内
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

function getSize (code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function logError (e) {
  console.log(e)
}

function blue (str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}
