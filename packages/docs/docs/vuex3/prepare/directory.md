# 目录结构

```md
├─.circleci                   # CircleCI构建流程
├─.github                     # github构建流程
├─dist                        # 项目构建后的文件
├─docs                        # 项目文档
├─docs-gitbook                # 项目文档gitbook版
├─examples                    # 使用示例
├─scripts                     # 与项目构建相关的脚本和配置文件 
├─src
│  ├── helpers.js             # 辅助函数
│  ├── index.cjs.js           # CommonJS版本的入口文件
│  ├── index.js               # 主入口文件，ES5
│  ├── index.mjs              # ES6模块版本的入口文件
│  ├── mixin.js               # 在 Vue 实例上注入
│  ├── module                 # module对象相关
│  ├── plugins                # 项目插件
│  ├── store.js               # Vuex store
│  └── util.js                # 工具类
├─test                        # 项目测试代码
└─types                       # TS定义代码
```

