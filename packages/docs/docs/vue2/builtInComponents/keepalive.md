# keep-alive

`<keep-alive>` 包裹动态组件时，会缓存不活动的组件实例，而不是销毁它们。和 `<transition>` 相似，`<keep-alive>` 是一个抽象组件：它自身不会渲染一个 DOM 元素，也不会出现在组件的父组件链中。

当组件在 `<keep-alive>` 内被切换，它的 `activated` 和 `deactivated` 这两个生命周期钩子函数将会被对应执行。

> 在 2.2.0 及其更高版本中，`activated` 和 `deactivated` 将会在 `<keep-alive>` 树内的所有嵌套组件中触发。

主要用于保留组件状态或避免重新渲染。

## 用法回顾

介绍原理之前，我们先根据官方文档来回顾一下`<keep-alive>`组件的具体用法，如下：

`<keep-alive>`组件可接收三个属性：

- `include` - 字符串或正则表达式。只有名称匹配的组件会被缓存。
- `exclude` - 字符串或正则表达式。任何名称匹配的组件都不会被缓存。
- `max` - 数字。最多可以缓存多少组件实例。

`include` 和 `exclude` 属性允许组件有条件地缓存。二者都可以用逗号分隔字符串、正则表达式或一个数组来表示：

```html
<!-- 逗号分隔字符串 -->
<keep-alive include="a,b">
  <component :is="view"></component>
</keep-alive>

<!-- 正则表达式 (使用 `v-bind`) -->
<keep-alive :include="/a|b/">
  <component :is="view"></component>
</keep-alive>

<!-- 数组 (使用 `v-bind`) -->
<keep-alive :include="['a', 'b']">
  <component :is="view"></component>
</keep-alive>
```

匹配时首先检查组件自身的 `name` 选项，如果 `name` 选项不可用，则匹配它的局部注册名称 (父组件 `components` 选项的键值)，也就是组件的标签值。匿名组件不能被匹配。

`max`表示最多可以缓存多少组件实例。一旦这个数字达到了，在新实例被创建之前，**已缓存组件中最久没有被访问的实例**会被销毁掉。

请读者注意此处加粗的地方，暂时有个印象，后面我们会详细说明。

```html
<keep-alive :max="10">
  <component :is="view"></component>
</keep-alive>
```

OK，以上就是`<keep-alive>`组件的用法，下面我们将着重介绍其内部实现原理。

## 原理分析

`<keep-alive>`组件的定义位于源码的 `src/core/components/keep-alive.js` 文件中，如下：

```js
export default {
  name: 'keep-alive',
  abstract: true,

  props: {
    // include 表示只有匹配到的组件会被缓存
    include: patternTypes,
    // exclude 表示任何匹配到的组件都不会被缓存
    exclude: patternTypes,
    // 缓存组件的数量
    max: [String, Number]
  },

  created () {
    // 初始化缓存对象
    this.cache = Object.create(null)
    // 初始化节点key集合，就是this.cache的键值
    this.keys = []
  },

  destroyed () {
    // 遍历缓存对象，挨个销毁
    for (const key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys)
    }
  },

  mounted () {
    // 监听include和exclude，如果发生变化则调用pruneCache
    this.$watch('include', val => {
      pruneCache(this, name => matches(val, name))
    })
    this.$watch('exclude', val => {
      pruneCache(this, name => !matches(val, name))
    })
  },

  render () {
    // 获取插槽中第一个节点
    const slot = this.$slots.default
    const vnode: VNode = getFirstComponentChild(slot)

    const componentOptions: ?VNodeComponentOptions = vnode && vnode.componentOptions
    if (componentOptions) {
      // 获取节点的名称，优先获取节点的name字段，如果name不存在则获取节点的tag
      const name: ?string = getComponentName(componentOptions)
      const { include, exclude } = this
      if (
        // 如果name不在include中
        (include && (!name || !matches(include, name))) ||
        // 如果name存在于exclude中
        (exclude && name && matches(exclude, name))
      ) {
        // 不缓存，直接返回
        return vnode
      }

      const { cache, keys } = this
      // 获取当前节点的key
      const key: ?string = vnode.key == null
        // same constructor may get registered as different local components
        // so cid alone is not enough (#3269)
        ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
        : vnode.key
      // 如果缓存中存在组件
      if (cache[key]) {
        // 从缓存中读取各种选项信息赋值给当前的节点
        vnode.componentInstance = cache[key].componentInstance
        // 通过删除和重新添加key，将key放在缓存最后
        // 防止超出最大缓存条数被删除
        remove(keys, key)
        keys.push(key)
      } else {
        // 当前vnode存入缓存中
        cache[key] = vnode
        keys.push(key)
        // 如果超出最大缓存条数，则删除存储的第一条，也就是最早存储的一条
        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode)
        }
      }

      vnode.data.keepAlive = true
    }
    return vnode || (slot && slot[0])
  }
}
```

我们发现`<keep-alive>`是一个函数式组件，没有常规的`<template></template>`标签，执行 `<keep-alive>` 组件渲染的时候，就会执行到这个 `render` 函数。

具体逻辑注释里描述的很详细了，这里重点说几个问题

1. 为什么要删除第一个缓存组件并且为什么命中缓存了还要调整组件key的顺序？

这其实应用了一个缓存淘汰策略LRU：

> LRU（**Least recently used**，最近最少使用）算法根据数据的历史访问记录来进行淘汰数据，其核心思想是“如果数据最近被访问过，那么将来被访问的几率也更高”。

它的算法是这样子的：

![LRU](@assets/vue2/LRU.png)

1. 将新数据从尾部插入到`this.keys`中；
2. 每当缓存命中（即缓存数据被访问），则将数据移到`this.keys`的尾部；
3. 当`this.keys`满的时候，将头部的数据丢弃；

LRU的核心思想是如果数据最近被访问过，那么将来被访问的几率也更高，所以我们将命中缓存的组件`key`重新插入到`this.keys`的尾部，这样一来，`this.keys`中越往头部的数据即将来被访问几率越低，所以当缓存数量达到最大值时，我们就删除将来被访问几率最低的数据，即`this.keys`中第一个缓存的组件。这也就之前加粗强调的**已缓存组件中最久没有被访问的实例**会被销毁掉的原因所在。

2. 为什么缓存`vnode.componentInstance`后就可以保存所有的状态？

`vnode.componentOptions`是在Vue中用于表示组件选项的一个属性。当使用Vue渲染组件时，虚拟DOM节点（VNode）的`componentOptions`属性存储了该组件的各种选项信息，包括组件的构造函数、组件的props数据、组件的监听器、组件的插槽信息等。

所以重新渲染该节点时，只需要将`componentOptions`赋值给新渲染的组件即可。

## 总结

本小节介绍了`<keep-alive>`组件的用法和实现原理。

首先，根据官方文档回顾了`<keep-alive>`组件的具体用法。

然后，从源码角度深入分析了`<keep-alive>`组件的内部原理，并且知道了该组件使用了LRU的缓存策略。