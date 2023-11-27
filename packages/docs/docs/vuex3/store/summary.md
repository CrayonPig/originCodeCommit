# 总结

实例化 Vuex 的 `Store` 是 Vuex 的核心流程之一，这个过程涉及到 `Store` 类的构造函数和 Vuex 的一些初始化操作。

主要步骤如下：

1. 创建一个新的 `Store` 实例，传入预定义的选项，如 `state`、`mutations`、`actions`、`getters` 等。

2. 在 `Store` 的构造函数中，首先处理并注册所有的 `modules`，形成一个树状的 `module` 结构。然后将 `state` 和 `getters` 初始化，并将 `mutations` 和 `actions` 注册到 `Store` 中。

3. 创建一个新的 Vue 实例 `_vm` 用于存储 `state` 和 `getters`。 `state` 会被设置为 Vue 实例的 `data`，而 `getters` 则会被设置为 Vue 实例的 `computed` 属性，这样利用了 Vue 的响应式系统，可以实现 `state` 的响应式以及 `getters` 的计算和缓存。

4. 如果 Vuex store 启用了严格模式，那么对 `state` 的修改只能通过 `mutation`，否则会抛出错误。这是通过监听 `_vm` 实例的 `data` 属性变化来实现的。

5. 在实例化 `Store` 后，你就可以调用 `Store` 的方法如 `dispatch`、`commit` 等来改变 `state` 或触发 `actions`，也可以通过 `store.state` 和 `store.getters` 来获取状态和计算属性。

在这个过程中，Vuex 将 `state`、`mutations`、`actions` 和 `getters` 结构化管理，利用 Vue 的响应式系统实现了 `state` 的响应式和 `getters` 的计算和缓存，同时还提供了一些方便的方法来操作和读取 `state`。
