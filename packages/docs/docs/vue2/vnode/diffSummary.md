# Diff算法总结

我们都知道 Vue 使用 `虚拟DOM`树 来描述`真实DOM`树，通过`Diff`算法对比新旧`虚拟DOM`树，对比差异，根据差异生成新的真实DOM树。

严格意义上来讲Diff两个DOM树的时间复杂度为`O(n^3)`，是无法用到实际场景中的。但Vue`Diff`算法优化后时间复杂度只有 `O(n)`。

本小节我们一起总结下，Vue`Diff`算法究竟干了什么，做了什么优化。

## 深度优先

在深度优先搜索中，算法首先比较当前层级的节点，然后递归地向下遍历子节点，直到遍历完整个节点树。这种策略使得算法能够尽早地发现并处理节点差异，从而减少不必要的比较和操作。

1. 从根节点开始，依次比较新旧 VNode：
   - 如果两个 VNode 不同，则执行相应的更新操作。
   - 如果两个 VNode 相同，则进一步比较和更新子节点。
2. 对于每个 VNode 的子节点列表，依次进行深度优先搜索：
   - 对比新旧子节点列表的节点差异。
   - 递归地对比和更新子节点的子节点，直到遍历完整个节点树。

## 只在同层级比较

回顾我们之前分析的`Patch`方法，都是对比的同一层级，没有跨层级的逻辑。

![同一层级对比](@assets/vue2/diffSummary1.png)

在同一层级对比过程中，遵循以下规则：

1. 忽略静态节点
2. 只针对相同节点（tag 和 key，两者都相同）对比，节点不相同直接删除重建

## 子节点更新策略

1. 采用双端比较循环，减少循环次数
2. 选择了从子节点列表中的4个特殊位置互相比对，分别是：新前与旧前，新后与旧后，新后与旧前，新前与旧后。较少对比次数
3. 特殊位置对比完后未处理的数据再递归判断。
