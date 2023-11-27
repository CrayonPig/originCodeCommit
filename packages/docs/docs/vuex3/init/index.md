# 前言

首先我们回顾下Vuex是如何使用的

```js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment (state) {
      state.count++
    }
  }
})
```

在这个例子中，我们使用`Vue.use(Vuex)`来安装Vuex，然后创建了一个新的`Vuex.Store`实例。

所以，我们分析Vuex的初始化，应该从两方面分析

1. `Vue.use(Vuex)` 安装Vuex，实际调用的是Vuex 的 `install` 方法
2. `new Vuex.Store` 初始化 Vuex Store实例，调用的是 `Store` 方法
