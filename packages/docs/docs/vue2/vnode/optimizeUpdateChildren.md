# 优化更新子节点

上一节总结的时候，我们说双重循环的时间复杂度为`O(n^2)`，假设我们有一万个子节点，那我们就需要计算一亿次。这几乎是没法用到实际场景中的。本节我们一起来研究，Vue对于这种情况是怎么处理的。

## 优化策略

在大部分场景中，并不是所有的子节点位置都会发生移动，一个列表总有几个节点的位置是不变的。针对这些位置不变或者说可以预测的节点。我们不需要在循环中查找，只需要查找他特殊的节点。具体思路如下：

- 先把`newChildren`数组里的所有未处理子节点的第一个子节点和`oldChildren`数组里所有未处理子节点的第一个子节点做比对，如果相同，那就直接进入更新节点的操作；
- 如果不同，再把`newChildren`数组里所有未处理子节点的最后一个子节点和`oldChildren`数组里所有未处理子节点的最后一个子节点做比对，如果相同，那就直接进入更新节点的操作；
- 如果不同，再把`newChildren`数组里所有未处理子节点的最后一个子节点和`oldChildren`数组里所有未处理子节点的第一个子节点做比对，如果相同，那就直接进入更新节点的操作，更新完后再将`oldChildren`数组里的该节点移动到与`newChildren`数组里节点相同的位置；
- 如果不同，再把`newChildren`数组里所有未处理子节点的第一个子节点和`oldChildren`数组里所有未处理子节点的最后一个子节点做比对，如果相同，那就直接进入更新节点的操作，更新完后再将`oldChildren`数组里的该节点移动到与`newChildren`数组里节点相同的位置；
- 最后四种情况都试完如果还不同，那就按照之前循环的方式来查找节点。

![optimizeUpdateChildren](@assets/vue2/optimizeUpdateChildren.png)

在上图中，我们把

- `newChildren`数组里的所有未处理子节点的第一个子节点称为：新前；
- `newChildren`数组里的所有未处理子节点的最后一个子节点称为：新后；
- `oldChildren`数组里的所有未处理子节点的第一个子节点称为：旧前；
- `oldChildren`数组里的所有未处理子节点的最后一个子节点称为：旧后；

了解这些名词后，我们一起梳理下上文提到的四种查找方式。

## 新前与旧前

使用`新前`和`旧前`节点进行对比，对比是否为同一个节点，如果为同一个节点，就更新该节点。

![newBeforeAndOldBefore](@assets/vue2/newBeforeAndOldBefore.png)

`新前`和`旧前`的位置相同，所以不需要执行移动的操作，只需要更新节点

## 新后与旧后

使用`新后`和`旧后`节点进行对比，对比是否为同一个节点，如果为同一个节点，就更新该节点。

![newAfterAndOldAfter](@assets/vue2/newAfterAndOldAfter.png)

`新后`和`旧后`的位置相同，所以不需要执行移动的操作，只需要更新节点

## 新后与旧前

使用`新后`和`旧前`节点进行对比，对比是否为同一个节点，如果为同一个节点，就更新该节点。

![newAfterAndOldBefore](@assets/vue2/newAfterAndOldBefore.png)

如果两个节点是同一个节点，由于他们的位置不同，所以除了更新节点外，还需要执行移动节点的操作

![newAfterAndOldBefore2](@assets/vue2/newAfterAndOldBefore2.png)

## 新前与旧后

使用`新前`和`旧后`节点进行对比，对比是否为同一个节点，如果为同一个节点，就更新该节点。

![newBeforeAndOldAfter](@assets/vue2/newBeforeAndOldAfter.png)

如果两个节点是同一个节点，由于他们的位置不同，所以除了更新节点外，还需要执行移动节点的操作

![newAfterAndOldAfter2](@assets/vue2/newAfterAndOldAfter2.png)

以上就是四种优化策略。大部分情况下，通过前面四种方式就可以找到相同的节点，所以节省了很多次循环操作。

四种优化策略执行完毕后，再通循环的方式去执行未处理过的节点即可。

## 双端比较

基于前面的优化策略，节点有可能是从后面对比，也有可能从后面对比。所以我们循环执行的时候，就不能只从前或从后循环，而是要从两边进行双端比较。

![doubleComparison](@assets/vue2/doubleComparison.png)

解释下上述名词。

- `newStartIdx`:`newChildren`数组里开始位置的下标；
- `newEndIdx`:`newChildren`数组里结束位置的下标；
- `oldStartIdx`:`oldChildren`数组里开始位置的下标；
- `oldEndIdx`:`oldChildren`数组里结束位置的下标；

再循环体内，每处理一个节点，就将下标向指定的方向移动一个位置，由于我们对比的是新旧两个节点列表，就相当于一次性处理两个节点，将新旧两个节点的下标都向指定方向移动一个位置。

开始位置的节点对比完后，就向后移动一个位置。结束位置的节点对比完后，就向前移动一个位置。

换句话说，`newStartIdx`和`oldStartIdx`只能向后移动，`newEndIdx`和`oldEndIdx`只能向前移动。

当开始位置大于等于结束位置时，就代表所有的节点都被遍历过了，则结束循环

```js
while(oldStartIdx <= oldEndIdx && newStartIdx <= oldStartIdx) {
  // 循环内部
}
```

通过双端比较的循环方式，可以保证循环结束时，没有未处理的节点。

## 回归源码

逻辑都梳理完毕后，我们一起看看源码是怎么写的，源码在`/src/core/vdom/patch.js`

```js
function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
  // oldChildren开始索引
  let oldStartIdx = 0
  // newChildren开始索引
  let newStartIdx = 0
  // oldChildren结束索引
  let oldEndIdx = oldCh.length - 1
  // oldChildren 第一个节点
  let oldStartVnode = oldCh[0]
  // oldChildren 最后一个节点
  let oldEndVnode = oldCh[oldEndIdx]
  // newChildren 结束索引
  let newEndIdx = newCh.length - 1
  // newChildren 第一个节点
  let newStartVnode = newCh[0]
  // newChildren 最后一个节点
  let newEndVnode = newCh[newEndIdx]
  let oldKeyToIdx, idxInOld, vnodeToMove, refElm

  // removeOnly is a special flag used only by <transition-group>
  // to ensure removed elements stay in correct relative positions
  // during leaving transitions
  const canMove = !removeOnly

  // 双端对比，以"新前"、"新后"、"旧前"、"旧后"的方式开始比对节点
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    // 旧前不存在，继续处理下一个
    if (isUndef(oldStartVnode)) {
      oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
    // 旧后不存在，继续处理下一个
    } else if (isUndef(oldEndVnode)) {
      oldEndVnode = oldCh[--oldEndIdx]
    // 判断旧前和新前是否为同一个节点
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      // 更新节点
      patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue)
      // 继续处理下一个
      oldStartVnode = oldCh[++oldStartIdx]
      newStartVnode = newCh[++newStartIdx]
    // 判断旧后和新后是否为同一个节点
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      // 更新节点
      patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue)
      // 继续处理下一个
      oldEndVnode = oldCh[--oldEndIdx]
      newEndVnode = newCh[--newEndIdx]
    // 判断旧前和新后是否为同一个节点
    } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
      // 更新节点
      patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue)
      // 可移动的话，再移动节点
      canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
      // 继续处理下一个
      oldStartVnode = oldCh[++oldStartIdx]
      newEndVnode = newCh[--newEndIdx]
    // 判断旧后和新前是否为同一个节点
    } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
      // 更新节点
      patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue)
      // 可移动的话，再移动节点
      canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
      // 继续处理下一个
      oldEndVnode = oldCh[--oldEndIdx]
      newStartVnode = newCh[++newStartIdx]
    // 如果不属于以上四种情况，就进行常规的循环比对patch
    } else {
      if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
      idxInOld = isDef(newStartVnode.key)
        ? oldKeyToIdx[newStartVnode.key]
        : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
      //  oldChildren找不到newChildren的子节点
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
      newStartVnode = newCh[++newStartIdx]
    }
  }
  if (oldStartIdx > oldEndIdx) {
    /**
     * 如果oldChildren比newChildren先循环完毕，
     * 那么newChildren里面剩余的节点都是需要新增的节点，
     * 把[newStartIdx, newEndIdx]之间的所有节点都插入到DOM中
     */
    refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
    addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
  } else if (newStartIdx > newEndIdx) {
    /**
     * 如果newChildren比oldChildren先循环完毕，
     * 那么oldChildren里面剩余的节点都是需要删除的节点，
     * 把[oldStartIdx, oldEndIdx]之间的所有节点都删除
     */
    removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
  }
}
```

上述注释写的较为详细，可以看出来，跟我们前面分析的思路是一样的，就不做重复的说明了。值得一提的是循环刚开始的时候

```js
// 旧前不存在，继续处理下一个
if (isUndef(oldStartVnode)) {
  oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
// 旧后不存在，继续处理下一个
} else if (isUndef(oldEndVnode)) {
  oldEndVnode = oldCh[--oldEndIdx]
}    
```

`oldStartVnode` 和 `oldEndVnode` 的未定义可能出现在以下情况下：

1. 初始化阶段：在首次渲染时，旧的子节点列表 `oldCh` 尚未被赋值或定义。这意味着旧子节点列表为空，因此 `oldStartVnode` 和 `oldEndVnode` 在初始状态下是未定义的。
2. 处理旧子节点的过程中：
   - 在遍历旧子节点列表时，当 `oldStartIdx` 指针超出了旧子节点列表的索引范围时，表示已经处理完所有旧子节点。此时，`oldStartVnode` 将未定义。
   - 同样地，当 `oldEndIdx` 指针小于旧子节点列表的最小索引值时，表示已经处理完所有旧子节点。此时，`oldEndVnode` 将未定义。

## 总结

本节我们详细分析了Vue 针对同一层级下新旧子节点列表对比的优化策略。通过在双端对比循环中选择了从子节点列表中的4个特殊位置互相比对，分别是：新前与旧前，新后与旧后，新后与旧前，新前与旧后。特殊位置对比完后未处理的数据再递归判断，提升了对比算法的性能。