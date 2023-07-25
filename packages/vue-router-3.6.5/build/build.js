const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const terser = require('terser')
const rollup = require('rollup')
const configs = require('./configs')

// 如果不存在dist文件夹，则创建dist文件夹
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist')
}

build(configs)

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

function getSize (code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function logError (e) {
  console.log(e)
}

function blue (str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}
