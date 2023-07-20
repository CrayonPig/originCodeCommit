# Vue.observable

## 用法回顾

其用法如下：

```javascript
Vue.observable( object )
```

- **参数**：

  - `{Object} object`

- **用法**：

  让一个对象可响应。Vue 内部会用它来处理 `data` 函数返回的对象。

  返回的对象可以直接用于[渲染函数](https://cn.vuejs.org/v2/guide/render-function.html)和[计算属性](https://cn.vuejs.org/v2/guide/computed.html)内，并且会在发生改变时触发相应的更新。也可以作为最小化的跨组件状态存储器，用于简单的场景：

  ```javascript
  const state = Vue.observable({ count: 0 })

  const Demo = {
    render(h) {
      return h('button', {
        on: { click: () => { state.count++ }}
      }, `count is: ${state.count}`)
    }
  }
  ```

## 原理分析

从用法回顾中可以知道，该API是用来将一个普通对象转化成响应式对象。在日常业务开发中也几乎用不到，它内部是调用了`observe`方法，关于该方法在**数据变化侦测篇**已经做了非常详细的介绍，此处不再重复。
