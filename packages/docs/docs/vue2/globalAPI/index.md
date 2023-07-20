# 前言

与实例方法不同，实例方法是将方法挂载到`Vue`的原型上，而全局API是直接在`Vue`上挂载方法。在`Vue`中，全局API一共有12个，分别是`Vue.extend`、`Vue.nextTick`、`Vue.set`、`Vue.delete`、`Vue.directive`、`Vue.filter `、`Vue.component`、`Vue.use`、`Vue.mixin`、`Vue.observable`、`Vue.version`。

这12个API中有的是我们在日常业务开发中经常会用到的，有的是对`Vue`内部或外部插件提供的，我们在日常业务开发中几乎用不到。

接下来我们就对这12个API逐个进行分析，看看其内部原理都是怎样的。
