# 更新子节点

在上一节中，我们研究了更新节点的过程，在这个过程中说到，当新节点`vnode`和旧节点`oldVnode` 都有子节点并且子节点不相同时，需要进行子节点的更新。本节我们就来详细研究这个过程。

我们将新子节点列表记为`newChildren`，旧子节点列表记为`oldChildren`。当需要对比两个列表时，我们需要将两个列表的每一个子节点进行对比，所以就有了如下双重循环的**伪代码**(仅供梳理思路使用)：

```js
for (let i = 0; i < newChildren.length; i++) {
  const newChild = newChildren[i];
  for (let j = 0; j < oldChildren.length; j++) {
    const oldChild = oldChildren[j];
    if (newChild === oldChild) {
      // ...
    }
  }
}
```

在这个过程中，我们可以发现一共有四种情况。

1. 新增子节点
  当一个节点只存在`newChildren`中时，说明这个节点是本次新增的节点，需要创建到DOM中
2. 删除子节点
  当一个节点只存在`oldChildren`中时，说明这个节点是本次删除的节点，需要从DOM中删除
3. 更新子节点
  当一个节点同时在两个节点列表中存在，位置相同但是值不同时，说明这个节点发生了更新，需要更新到DOM中
4. 移动子节点
  当一个节点同时在两个节点列表中存在，但是位置不同，说明这个节点需要移动到另一个位置

梳理完可能出现的情况后，我们就可以针对每种情况进行分析了。

## 新增子节点

当一个节点只存在`newChildren`中时，说明这个节点是本次新增的节点，需要创建到真实DOM中。

对于新增的节点，我们需要执行创建节点的逻辑，并将新创建的节点插入到`oldChildren`中所有未处理节点（没有经过更新操作的节点）的前面。

创建节点的逻辑，我们上一节已经分析过，这里就不再赘述了。

创建节点完毕后，下一步就是要把这个节点插入到`oldChildren`中所有未处理节点的前面。为什么是未处理节点的前面呢？

![DOM](@assets/vue2/updateChildDOM.png)

假设我们现在在对比新老子节点列表的过程中（当前DOM状态如图所示），发现位于列表第三个子节点是一个需要新增的子节点，在上图所示的DOM树中，可供新增子节点插入的位置有几个呢？

1. **已处理前**

  如果将新增子节点放入已处理前的位置中，第三个子节点就变成了DOM树的第一个子节点，导致渲染顺序错乱

2. **已处理节点后**

  好像还行

3. **未处理节点前**

  好像还行

4. **未处理节点后**
  如果新增子节点放在未处理节点后，如果下一个子节点是需要更新的，不会放在这个新增子节点的后面，导致渲染顺序错乱

所以，供我们选择的只有两种情况，放在已处理节点后，或者未处理节点前。

有的同学就很疑惑，这俩有啥区别呢？不都是在已处理节点和未处理节点的中间么？

对于单个节点来说没啥区别，但对于多个节点排序来说，就是有区别的。

假设我们现在将已处理节点设为`X`，未处理节点为`Y`，子节点列表位于第三个需要新增的为`3`，子节点列表位于第四个需要新增的为`4`。按照`已处理节点后`规则来讲，应该是这样的

```js
// 已处理节点后
// 未添加时的DOM树顺序
XXYY
// 新增第三个后的DOM树顺序
XX3YY
// 新增第四个后的DOM树顺序
XX43YY
```

可以看到，新增位于第三个的子节点时没问题，新增位于第四个子节点的时候，顺序就乱了，第四个子节点跑到第三个子节点前面了。

按照`未处理节点前`的规则，如下所示

```js
// 已处理节点后
// 未添加时的DOM树顺序
XXYY
// 新增第三个后的DOM树顺序
XX3YY
// 新增第四个后的DOM树顺序
XX34YY
```

可以看到，按照`未处理节点前`的规则，新增操作完成后的顺序才能保持一致

所以，**合适的位置是所有未处理节点之前，而并非所有已处理节点之后。**

## 删除子节点

当一个节点只存在`oldChildren`中时，说明这个节点是本次删除的节点，需要从DOM中删除。

删除节点的逻辑上节也分析过，这里同样不赘述

## 更新子节点

当一个节点同时在两个节点列表中存在，位置相同但是值不同时，说明这个节点发生了更新，需要更新到DOM中

更新节点的逻辑上节也分析过，这里同样不赘述

## 移动子节点

当一个节点同时在两个节点列表中存在，但是位置不同，说明这个节点需要移动到另一个位置

通过`insertBefore` 方法，我们可以将一个已有节点移动到指定的位置。

那么我们怎么得到这个指定的位置呢？

其实这个跟新增的逻辑是一样的，都是**未处理节点的最前面**，下图可供参考

![updateChildMove](@assets/vue2/updateChildMove.png)

## 回到源码

上述四种情况分析完毕后，我们回到源码看看，Vue实现的逻辑是否跟我们一样。源码在`/src/core/vdom/patch.js`

```js
//  oldChildren找不到当前循环的newChildren里的子节点
if (isUndef(idxInOld)) { // New element
  // 新增节点，插入到指定位置
  createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
// 如果在oldChildren里找到了当前循环的newChildren里的子节点
} else {
  vnodeToMove = oldCh[idxInOld]
  // 如果两个节点相同
  if (sameVnode(vnodeToMove, newStartVnode)) {
    // 调用patchVnode更新节点
    patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue)
    oldCh[idxInOld] = undefined
    // canmove表示是否需要移动节点，如果为true表示需要移动，则移动节点，如果为false则不用移动
    canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
  // key不同或者key相同但element不同，则视为不同，需要新建
  } else {
    // same key but different element. treat as new element
    createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
  }
}
```

- 如果当前循环的`newChildren`里的子节点在`oldChildren`不存在，则表示是一个新的节点，需要创建并插入到指定位置。
- 如果在 `oldChildren` 中找到了相同的子节点，则执行以下判断：
  - 如果两个子节点相同（key相同，元素类型相同），则调用 `patchVnode` 函数更新节点属性，更新完成后位置不同再挪动位置
  - 如果key不同或者key相同，但元素类型不同，则视为不同的节点，需要创建新节点并插入到指定位置。

## 总结

本小节通过对于 `oldChildren` 和`newChildren` 双循环的每个子节点对比，根据不同情况作出创建子节点、删除子节点、更新子节点以及移动子节点的操作。并针对每个操作进行了分析，最后归回源码，发现源码的逻辑与我们的保持一致。

我们知道双重循环的时间复杂度为`O(n^2)`，假设我们有一万个子节点，那我们就需要计算一亿次。这几乎是没法用到实际场景中的，那Vue是怎么优化这个算法的呢？我们下节分析
