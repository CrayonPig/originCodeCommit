# 挂载

实例化完成后，我们将其挂载到`Vue`实例的`options`上

```js
const app = new Vue({
  router
}).$mount('#app')
```

调用代码很简单，就是把初始化完毕后的`VueRouter`的实例`router`当成参数传入，`new Vue`的时候，会将`router`挂载到`vm.$options`上。

有些同学可能很好奇，为什么其他插件，只需要`Vue.use`就行，`Vue Router`还需要多这么一步呢？

其实这么做的原因有很多种

1. 唯一性：将`VueRouter`的实例挂载到`根组件`中，保证整个Vue生命周期内中都只有一个`VueRouter`的实例
2. 复用性：整个生命周期内共享一个`VueRouter`实例，即使在多个组件中使用`VueRouter`，也是可复用的
3. 后续使用中可以用`$options.router`来判断是否在`根Vue`中，方便后续逻辑处理

当然，能够实现上述功能的方法有很多种，`Vue Router`只是选择了当前这种实现方案
