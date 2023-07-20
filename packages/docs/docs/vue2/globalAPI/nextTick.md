# Vue.nextTick

## 用法回顾

其用法如下：

```javascript
Vue.nextTick( [callback, context] )
```

- **参数**：

  - `{Function} [callback]`
  - `{Object} [context]`

- **作用**：

  在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM。

  ```javascript
  // 修改数据
  vm.msg = 'Hello'
  // DOM 还没有更新
  Vue.nextTick(function () {
    // DOM 更新了
  })

  // 作为一个 Promise 使用 (2.1.0 起新增，详见接下来的提示)
  Vue.nextTick()
    .then(function () {
      // DOM 更新了
    })
  ```

  > 2.1.0 起新增：如果没有提供回调且在支持 Promise 的环境中，则返回一个 Promise。请注意 Vue 不自带 Promise 的 polyfill，所以如果你的目标浏览器不原生支持 Promise (IE：你们都看我干嘛)，你得自己提供 polyfill。

## 原理分析

该API的原理同实例方法 `$nextTick`原理一样，此处不再重复。唯一不同的是实例方法 `$nextTick` 中回调的 `this` 绑定在调用它的实例上。
