# patch

介绍`虚拟DOM`的时候，我们就说过引入`虚拟DOM`的原因就是对比状态更新前后的`虚拟DOM`的差异，来更新`真实DOM`，达到减少操作`真实DOM`的目的。

这对比的过程，就是`patch`的一部分，我们称之为`Diff`。而完整的`patch`函数是 Vue2 内部的一个核心函数，用于将新的`虚拟DOM`转化为`真实DOM`并应用到浏览器中。它会根据`Diff算法`的计算结果进行更新，包括添加、移动、修改或删除`真实DOM`节点，以确保最终的DOM结构与最新的`虚拟DOM`一致。

`patch`对现有DOM的更改主要做三件事情：

1. 创建新增的节点：新的`VNode`中有而旧的`oldVNode`中没有，就在旧的`oldVNode`中创建。
2. 删除已经废弃的节点：新的`VNode`中没有而旧的`oldVNode`中有，就从旧的`oldVNode`中删除。
3. 修改需要更新的节点：新的`VNode`和旧的`oldVNode`中都有，就以新的`VNode`为准，更新旧的`oldVNode`。

## 创建节点

创建节点通常发生在两种情况下

1. 当`oldVNode`不存在而`vnode`存在时，需要使用`vnode`生成真实的DOM元素插入到视图中。一般发生在首次渲染时
2. 当`oldVNode`和`vnode`完全不是同一个节点时，需要使用`vnode`生成真实的DOM元素插入到视图中。

我们之前分析过`VNode`可以生成六种不同的节点类型，但实际上只有3种类型的节点能够被创建并插入到DOM中，它们分别是：元素节点、文本节点、注释节点。在创建节点的过程中，会根据它们的特点来进行不同的创建方式。源码在`/src/core/vdom/patch.js`

```js
function createElm (
    vnode, // 虚拟节点
    insertedVnodeQueue, // 插入虚拟节点队列
    parentElm, // 父元素
    refElm, // 参考元素
    nested, // 是否嵌套
    ownerArray, // 虚拟节点所属的数组
    index // 虚拟节点在数组中的索引
  ) {
    const data = vnode.data
    const children = vnode.children
    const tag = vnode.tag
    if (isDef(tag)) {
      // 如果是元素节点
      vnode.elm = vnode.ns
        // 创建 SVG 元素和其他 XML 具有命名空间的元素
        ? nodeOps.createElementNS(vnode.ns, tag) 
        // 创建普通元素
        : nodeOps.createElement(tag, vnode) 

      // 设置作用域
      setScope(vnode)
      // 创建子节点
      createChildren(vnode, children, insertedVnodeQueue)

      if (isDef(data)) {
        // 如果存在节点数据，则调用 invokeCreateHooks 函数执行创建钩子函数
        invokeCreateHooks(vnode, insertedVnodeQueue)
      }
      insert(parentElm, vnode.elm, refElm)
    } else if (isTrue(vnode.isComment)) {
      // 如果是注释节点，创建注释节点并插入到父元素中
      vnode.elm = nodeOps.createComment(vnode.text)
      insert(parentElm, vnode.elm, refElm)
    } else {
      // 否则，创建文本节点并插入到父元素中
      vnode.elm = nodeOps.createTextNode(vnode.text)
      insert(parentElm, vnode.elm, refElm)
    }
  }
```
> `nodeOps`是Vue为了跨平台兼容性，对所有节点操作进行了封装，例如`nodeOps.createTextNode()`在浏览器端等同于`document.createTextNode()`

从上述代码中，我们可以发现，创建节点时，我们先对节点类型做了判断

- 根据`tag`判断是否为元素节点，如果是元素节点，则调用`createElement`或`createElementNS`方法创建元素节点，再递归子节点，插入到当前节点中，最后把当前节点插入DOM中
- 不是元素节点则根据`isComment`判断是否为注释节点，如果是注释节点，则调用`createComment`生成注释节点，插入DOM中
- 如果都不是则为文本节点，则调用`createTextNode`生成文本节点，插入DOM中

这样就完成了创建流程，流程图如下

![创建节点流程图](@assets/vue2/createElm.png)

## 删除节点

删除节点的场景很简单，就是当一个节点只存在于`oldVNode`中时，从DOM中删除

代码也很简单，获取父级节点，如果父级节点存在，则从父级中删除，如果父级不存在，说明整个节点都被删除了，无需操作

```js
function removeNode (el) {
  const parent = nodeOps.parentNode(el)
  // element may have already been removed due to v-html / v-text
  if (isDef(parent)) {
    nodeOps.removeChild(parent, el)
  }
}
```

## 更新节点

新增节点和删除节点的场景，都是在新旧两个节点是完全不同的情况下。我们需要以新节点为标准渲染DOM，所以只能新增新节点和删除旧节点。

相比于这种场景，新旧两个节点是同一节点的场景更为常见。在这个场景中，我们需要对新旧两个节点做更详细的对比。

1. 如果 `vnode` 和 `oldVnode` 是同一个对象（引用相同），则直接返回，无需更新。
2. 如果 `vnode` 和 `oldVnode` 都是静态节点，并且它们的 key 相同，则更新 `vnode` 的一些属性到`oldVnode` 上，并返回。
3. 如果 `vnode` 为文本节点，则判断`oldVnode`是否为文本节点
   1. `oldVnode`为文本节点，并且两者文本内容不同，则直接更新`oldVnode`的文本内容
   2. `oldVnode`不为文本节点，则删除`oldVnode`子节点，并将其改为文本节点，更新文本内容
4. 如果 `vnode` 为元素节点，则判断`vnode`是否包含子节点
   1. 如果`vnode`有子节点，则判断`oldVnode`是否包含子节点
      1. 如果`oldVnode`有子节点，则需要对比子节点后进行更新
      2. 如果`oldVnode`没有子节点，那这个节点可能是空节点或者文本节点
         1. 如果`oldVnode`是空节点，则将`vnode`子节点挨个添加到`oldVnode`
         2. 如果`oldVnode`是文本节点，则将文本内容清空后，将`vnode`子节点挨个添加到`oldVnode`
   2. 如果`vnode`没有子节点，又不是文本节点，说明是个空节点，直接将`oldVnode`内容清空，置为空节点

带着这个逻辑，我们看看Vue源码中是如何处理更新节点的，源码在`/src/core/vdom/patch.js`

```js
function patchVnode (oldVnode, vnode, insertedVnodeQueue, removeOnly) {
    // 节点相同不更新（引用相同）
    if (oldVnode === vnode) {
      return
    }

    const elm = vnode.elm = oldVnode.elm

    // 如果都是静态节点
    if (isTrue(vnode.isStatic) &&
      isTrue(oldVnode.isStatic) &&
      // 相同的key
      vnode.key === oldVnode.key &&
      // 新节点时克隆节点 || 只渲染一次的节点
      (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
    ) {
      // 直接更新组件实例
      vnode.componentInstance = oldVnode.componentInstance
      return
    }

    let i
    const data = vnode.data
    const oldCh = oldVnode.children
    const ch = vnode.children

    // 新节点没有文本内容text
    if (isUndef(vnode.text)) {
      // 新旧节点的子节点都存在
      if (isDef(oldCh) && isDef(ch)) {
        // 并且不相等，更新子节点
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
      // 只有新节点的有子节点
      } else if (isDef(ch)) {
        // 如果旧节点存在文本内容text，则清空DOM的文本内容
        if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
        // 新的节点的子节点添加到旧的节点的 DOM 元素中。
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
      // 新节点没有文本内容，而且只有旧节点的有子节点
      } else if (isDef(oldCh)) {
        // 删除DOM的子节点
        removeVnodes(elm, oldCh, 0, oldCh.length - 1)
      // 新节点没有文本内容，旧节点有文本内容
      } else if (isDef(oldVnode.text)) {
        // 清空旧节点的内容
        nodeOps.setTextContent(elm, '')
      }
    // 新节点有文本内容并且跟旧节点文本不相等
    } else if (oldVnode.text !== vnode.text) {
      // 新节点是文本节点，直接把旧节点的文本内容替换
      nodeOps.setTextContent(elm, vnode.text)
    }
  }
```

在`vnode` 和 `oldVnode`都有子节点时，调用了 `updateChildren`方法去对比子节点，这个方法我们下节去分析

源码中的顺序跟我们分析的顺序不太一样，但整体的判断逻辑是一致的，可以跟着流程图对比源码中的注释一起梳理

![更新节点](@assets/vue2/patchVnode.png)

## 总结

这节主要分析了`patch`中的`Diff`部分，针对创建节点、删除节点、更新节点三部分分析了适用场景及源码逻辑，并辅助有流程图去分析。

对于`vnode` 和 `oldVnode`都有子节点时的逻辑，我们在下节进行详细的分析。
