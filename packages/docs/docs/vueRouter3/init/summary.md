# 总结

在前几小节，我们分析了初始化的每个环节，让大家对初始化有了一定的印象，本小节，我们根据**代码执行顺序**，总结下初始化环节做了哪些事情。

1. 实例化`Vue Router`
   1. 使用初始化参数`routes`调用`createMatcher`函数，创建路由匹配器
   2. 根据初始化参数`mode`，判断路由模式
   3. 根据匹配的路由模式创建对应的路由实例
2. 将实例化后的对象作为参数传递给`new Vue`
3. 调用`Vue.use(VueRouter)`，插件注册完成
   1. 防止重复注册组件实例
   2. 将路由相关的逻辑通过`Vue.mixin`混入到每个 Vue 组件实例的`beforeCreate`和`destroyed`钩子函数中
   3. 设置`$router`和`$route`的代理，分别指向当前实例上的`_router`以及`_route`属性
   4. 全局注册组件`router-link`和`router-view`
   5. 设置路由的钩子函数与 `vue.created` 一样的 `mixin` 合并策略
4. 根组件渲染，触发插件`install`中`Vue.mixin`的生命周期
   1. 判断如果是根组件调用`VueRouter`实例的`init`方法完成初始化
      1. 增加 `destroyed` 钩子函数，用于销毁实例
      2. 如果是浏览器的 `history` 或 `hash` 模式，初始化滚动方法
      3. 监听路由变化，同步新的路由对象到所有Vue实例
   2. 调用`registerInstance`方法将当前组件实例注册到父组件中，完成了对`router-view`的挂载操作
