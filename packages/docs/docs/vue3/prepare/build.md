# 源码构建

基于 NPM 托管的项目都有一个 package.json 文件，该文件是对项目的描述，我们一般会配置 `script` 字段作为NPM的执行脚本，Vue3源码的构建脚本如下：

```json
{
  "script": {
    "build": "node scripts/build.js",
  }
}
```

当我们执行 `npm run build` 时，实际上就是在执行 `node scripts/build.js`, 我们找到 `scripts/build.js` 文件，看他是如何构建的。

## 构建配置 

```js
// @ts-check

/*
Produces production builds and stitches together d.ts files.

To specify the package to build, simply pass its name and the desired build
formats to output (defaults to `buildOptions.formats` specified in that package,
or "esm,cjs"):

\`\`\`
# name supports fuzzy match. will build all packages with name containing "dom":
nr build dom

# specify the format to output
nr build core --formats cjs
\`\`\`
*/

import fs from 'node:fs/promises'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import path from 'node:path'
import minimist from 'minimist'
import { gzipSync, brotliCompressSync } from 'node:zlib'
import chalk from 'chalk'
import execa from 'execa'
import { cpus } from 'node:os'
import { createRequire } from 'node:module'
import { targets as allTargets, fuzzyMatchTarget } from './utils.js'
import { scanEnums } from './const-enum.js'

const require = createRequire(import.meta.url)
// 解析命令行参数
const args = minimist(process.argv.slice(2))
// 额外参数 构建的目标模块
const targets = args._
// 额外参数 输出格式
const formats = args.formats || args.f
// 额外参数 只构建开发环境下的模块
const devOnly = args.devOnly || args.d
// 额外参数 只构建生产环境下的模块
const prodOnly = !devOnly && (args.prodOnly || args.p)
// 额外参数 是否构建ts类型定义文件
const buildTypes = args.withTypes || args.t
// 额外参数 是否生成sourceMap文件
const sourceMap = args.sourcemap || args.s
// 额外参数 是否全量构建
const isRelease = args.release
// 额外参数 是否匹配所有模块
const buildAllMatching = args.all || args.a
// 获取最近一次提交的commit id
const commit = execa.sync('git', ['rev-parse', 'HEAD']).stdout.slice(0, 7)

run()

async function run() {
  // 对 TypeScript 中的 const enum 进行处理，返回清除ts枚举产生的缓存方法
  const removeCache = scanEnums()
  try {
    // 如果指定构建模块，则匹配，否则是所有的模块
    const resolvedTargets = targets.length
      ? fuzzyMatchTarget(targets, buildAllMatching)
      : allTargets
    // 构建所有的模块
    await buildAll(resolvedTargets)
    // 检查构建的文件大小
    checkAllSizes(resolvedTargets)
    // 如果构建ts类型定义文件
    if (buildTypes) {
      // 额外执行pnpm run build-dts
      await execa(
        'pnpm',
        [
          'run',
          'build-dts',
          ...(targets.length
            ? ['--environment', `TARGETS:${resolvedTargets.join(',')}`]
            : [])
        ],
        {
          stdio: 'inherit'
        }
      )
    }
  } finally {
    // 清除ts枚举的缓存
    removeCache()
  }
}

async function buildAll(targets) {
  // 根据cpu的核数并行构建
  await runParallel(cpus().length, targets, build)
}

async function runParallel(maxConcurrency, source, iteratorFn) {
  const ret = []
  const executing = []
  for (const item of source) {
    const p = Promise.resolve().then(() => iteratorFn(item, source))
    ret.push(p)

    // 如果最大并发数小于等于数据源的长度，那么就需要控制并发数
    if (maxConcurrency <= source.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1))
      executing.push(e)
      if (executing.length >= maxConcurrency) {
        await Promise.race(executing)
      }
    }
  }
  return Promise.all(ret)
}

async function build(target) {
  const pkgDir = path.resolve(`packages/${target}`)
  const pkg = require(`${pkgDir}/package.json`)

  // if this is a full build (no specific targets), ignore private packages
  // 如果这是一个完整的构建（没有特定的目标），忽略私有包
  if ((isRelease || !targets.length) && pkg.private) {
    return
  }

  // if building a specific format, do not remove dist.
  // 如果构建特定格式，请勿删除dist。
  if (!formats && existsSync(`${pkgDir}/dist`)) {
    await fs.rm(`${pkgDir}/dist`, { recursive: true })
  }

  // 确定构建环境
  const env =
    (pkg.buildOptions && pkg.buildOptions.env) ||
    (devOnly ? 'development' : 'production')
  // 使用rollup 构建
  await execa(
    'rollup',
    [
      '-c',
      '--environment',
      [
        `COMMIT:${commit}`,
        `NODE_ENV:${env}`,
        `TARGET:${target}`,
        formats ? `FORMATS:${formats}` : ``,
        prodOnly ? `PROD_ONLY:true` : ``,
        sourceMap ? `SOURCE_MAP:true` : ``
      ]
        .filter(Boolean)
        .join(',')
    ],
    { stdio: 'inherit' }
  )
}
// 检查所有文件大小
function checkAllSizes(targets) {
  if (devOnly || (formats && !formats.includes('global'))) {
    return
  }
  console.log()
  for (const target of targets) {
    checkSize(target)
  }
  console.log()
}
// 检查文件的大小
function checkSize(target) {
  const pkgDir = path.resolve(`packages/${target}`)
  checkFileSize(`${pkgDir}/dist/${target}.global.prod.js`)
  if (!formats || formats.includes('global-runtime')) {
    checkFileSize(`${pkgDir}/dist/${target}.runtime.global.prod.js`)
  }
}

// 检查文件大小
function checkFileSize(filePath) {
  if (!existsSync(filePath)) {
    return
  }
  const file = readFileSync(filePath)
  const minSize = (file.length / 1024).toFixed(2) + 'kb'
  const gzipped = gzipSync(file)
  const gzippedSize = (gzipped.length / 1024).toFixed(2) + 'kb'
  const compressed = brotliCompressSync(file)
  // @ts-ignore
  const compressedSize = (compressed.length / 1024).toFixed(2) + 'kb'
  console.log(
    `${chalk.gray(
      chalk.bold(path.basename(filePath))
    )} min:${minSize} / gzip:${gzippedSize} / brotli:${compressedSize}`
  )
}
```

这段代码较为简单

1. 从命令行参数中解析出需要构建的目标模块（`targets`）、输出格式（`formats`）、是否只构建开发环境下的模块（`devOnly`）、是否只构建生产环境下的模块（`prodOnly`）、是否构建类型定义文件（`buildTypes`）、是否生成源码映射文件（`sourceMap`）、是否全量构建（`isRelease`）、是否匹配所有模块（`buildAllMatching`）等选项。
2. 执行主函数`run`，该函数首先尝试获取模块列表（`targets`），然后并行构建这些模块，并检查构建后的文件大小。如果需要，它还会生成类型定义文件。
3. 并行构建函数`runParallel`，该函数会并行执行给定的`iteratorFn`函数，处理每个元素。
4. 单个模块的构建函数`build`，该函数会使用`rollup`来进行构建，构建的环境（开发环境或生产环境）和格式（如`cjs`、`esm`等）由前面的选项决定。
5. `checkAllSizes`函数用于检查构建后的所有文件的大小。
6. `checkSize`函数用于检查单个文件的大小，它会输出原始大小、`gzip`压缩后的大小和`brotli`压缩后的大小

## 总结

至此，`Vue3` 的构建函数已经分析完毕。跟`Vue2`相比，Vue3的构建函数在功能上并没有什么变化，只是由于采用了 `Monorepo`的结构，使得构建代码上发生了一些变化。同时增加了一些自定义的参数，方便开发者进行自定义构建。
