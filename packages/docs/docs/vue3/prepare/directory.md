# 目录结构

Vue 3的源码相对于Vue 2版本有了较大程度的改变，采用Monorepo规范的目录结构，同时使用TypeScript作为开发语言(vue2在2022年4月底也更换TypeScript为开发语言 )

```md
├── packages                  # 项目源代码
│    ├── compiler-core           # 模板编译时核心代码
│    ├── compiler-dom            # 模板编译时Dom实现
│    ├── compiler-sfc            # 模板编译时单文件组件实现
│    ├── compiler-ssr            # 模板编译时服务端渲染实现
│    ├── dts-test                # 测试Typescript类型以确保类型保持为预期类型
│    ├── reactivity              # 实现变化侦测的代码，可以配合其他框架使用
│    ├── reactivity-transform    # 响应式实验功能,目前仅用于测试 
│    ├── runtime-core            # 运行时核心代码
│    ├── runtime-dom             # 运行时Dom实现
│    ├── runtime-test            # 运行时测试代码
│    ├── server-renderer         # 服务端渲染代码
│    ├── sfc-playground          # 单文件组件的在线编辑器
│    ├── shared                  # 内部工具库，不对外暴露
│    ├── size-check              # 检查包大小的工具
│    ├── template-explorer       # 用于调试编译器输出的开发工具
│    ├── vue                     # 面向公众的完整版本, 包含运行时和编译
│    └── vue-compat              # 兼容旧版本Vue2的代码
└─ scripts                    # 与项目构建相关的脚本和配置文件 
```

## Runtime 跟 Compiler

通过结构我们可以看到 `package` 中最重要的模块有5个，分别为

- compiler-core
- compiler-dom
- runtime-core
- runtime-dom
- reactivity

不难发现 `core`, `dom` 分别出现了两次，那么 `compiler` `runtime` 它们之间又有什么区别呢？

- `compiler`：`compiler` 是编译器的意思，Vue 的 `compiler` 版本包含了 Vue 的模板编译器。这意味着，如果你在代码中直接写了 Vue 的模板字符串，那么在运行时，Vue 就会自动调用编译器将模板字符串编译为 JavaScript 渲染函数。也就是说，`compiler` 版本允许你在 JavaScript 代码中写 Vue 模板，并且可以在浏览器运行时进行编译。

- `runtime`：`runtime` 是运行时的意思，Vue 的 `runtime` 版本不包含 Vue 的模板编译器。这意味着，如果你在代码中直接写了 Vue 的模板字符串，那么 `runtime` 版本的 Vue 就无法处理，会抛出错误。`runtime` 版本的 Vue 需要预编译模版，即你需要将 Vue 的模板预先编译为 JavaScript 渲染函数，然后再运行。`runtime` 版本的体积比 `compiler` 版本要小，因为它不包含编译器。

::: tip
  我们在使用构建工具（如 webpack、rollup 等）时，所有 Vue 模板都是在构建阶段被预编译成渲染函数的（比如通过 vue-loader 或 vue-cli），所以会使用 `runtime` 版本，这样可以体积更小，运行效率更高。
:::

## 模块关系图

```js
                      +---------------------+    +----------------------+
                      |                     |    |                      |
        +------------>|  @vue/compiler-dom  +--->|  @vue/compiler-core  |
        |             |                     |    |                      |
   +----+----+        +---------------------+    +----------------------+
   |         |
   |   vue   |
   |         |
   +----+----+        +---------------------+    +----------------------+    +-------------------+
        |             |                     |    |                      |    |                   |
        +------------>|  @vue/runtime-dom   +--->|  @vue/runtime-core   +--->|  @vue/reactivity  |
                      |                     |    |                      |    |                   |
                      +---------------------+    +----------------------+    +-------------------+
```
