# 总结

经过前几小节，我们分析了路由匹配的相关实现，本小节我们总结下流程

1. 初始化时，根据 `routes` 数据，生成所有路由的`pathList`、key 是 `path`，value 是路由对象的`pathMap`、key 是 `name`，value 是路由对象的`nameMap`
2. 