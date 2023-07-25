# 前言

首先回顾下，我们在实际开发中是如何完成`Vue router`的初始化的

```js
Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  routes: [
    // ...
  ]
})

const app = new Vue({
  router
}).$mount('#app')
```

```html
<div id="app">
  <router-view />
</div>
```

上述代码共有三步：

1. 调用`Vue.use`注册插件
2. 传入 `routes` 配置，创建 `router` 实例
3. 把`router`实例挂载到根实例中，让整个应用都有路由功能
4. 使用`<router-view />`组件切换路由

本章节让我们随着这三步，一起分析源码中是如何完成初始化的
