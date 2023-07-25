# 目录结构

```md
├── assets                      # 静态资源    
├── build                       # 与项目构建相关的脚本和配置文件
├── dist                        # 项目构建后的文件
├── docs                        # 文档
├── docs-gitbook                # gitbook文档
├── examples                    # 示例
├── flow                        # flow的类型声明文件
├── scripts                     # 与项目提交相关的脚本和配置文件
├── src                         # 项目源代码
│   ├── components              # 注册的组件
│   ├── composables             # hooks写法
│   ├── create-matcher.js       # 匹配器工厂函数
│   ├── create-route-map.js     # 路由映射函数
│   ├── entries                 # 不同模块规范的导出
│   ├── history                 # 路由历史相关
│   ├── index.js                # 默认为cjs的导出
│   ├── install.js              # Vue插件注册入口函数
│   ├── router.js               # Router主要实现
│   └── util                    # 工具函数
├── test                        # 项目测试代码
├── types                       # TypeScript的类型声明文件
└── vetur                       # vetur 相关配置
```
