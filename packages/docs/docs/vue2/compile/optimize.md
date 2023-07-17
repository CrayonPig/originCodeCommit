# 优化阶段

经过前几节，我们知道了解析器是如何将HTML模板解析成`AST`。本节我们将介绍优化器的是如何在遍历`AST`，找出其中的静态节点，并打上标记的。

在这个过程中共分为两步

1. 在`AST`中找出所有的`静态节点`并打上标记
2. 在`AST`中找出所有的`静态根节点`并打上标记

`静态节点`我们已经知道是渲染到界面上后，就不会随着状态发生变化的节点。那`静态根节点`是什么呢？我们举个例子

```html
<ul>
    <li>我是文本信息</li>
    <li>我是文本信息</li>
    <li>我是文本信息</li>
    <li>我是文本信息</li>
    <li>我是文本信息</li>
</ul>
```

在上述例子中，所有的`li`元素中都是纯文本，一旦渲染到界面上，就不会随着状态发生改变，所以每个`li`标签都是一个`静态节点`。而`ul`元素作为父节点，它所有的子节点都是`静态节点`，我们就称它为`静态根节点`。

搞明白`静态节点`和`静态根节点`之后，我们再来讨论，为这两个打上标记后，有什么好处？

- 每次重新渲染时，不需要为`静态节点`和`静态根节点`创建新节点

  在生成`vnode`的过程中，如果发现一个节点被标记为`静态节点`或`静态根节点`，除了首次渲染外，重新渲染时不会生成该节点，而是克隆已经存在的节点
- 在`虚拟DOM`中`Diff`的过程中，可以忽略`静态节点`和`静态根节点`

  在`Diff`过程中，如果发现两个节点都是相同的`静态节点`或`静态根节点`，就不需要对比和更新`DOM`的操作，直接跳过

搞明白这些后，我们来看源码。源码位于`src/compiler/optimizer.js`中，如下：

```js
export function optimize (root: ?ASTElement, options: CompilerOptions) {
  if (!root) return

  // 生成静态键列表
  isStaticKey = genStaticKeysCached(options.staticKeys || '')

  // 判断是否是保留标签
  isPlatformReservedTag = options.isReservedTag || no
  
  // first pass: mark all non-static nodes.
  // 标记静态节点
  markStatic(root)
  // second pass: mark static roots.
  // 标记静态根节点
  markStaticRoots(root, false)
}
```

## 标记静态节点

从`AST`中找出所有静态节点并标记其实不难，我们只需从根节点开始，先标记根节点是否为静态节点，然后看根节点如果是元素节点，那么就去向下递归它的子节点，子节点如果还有子节点那就继续向下递归，直到标记完所有节点。代码如下：

```js
function markStatic (node: ASTNode) {
  // 判断是否为静态节点
  node.static = isStatic(node)

  if (node.type === 1) {
    // 不将组件插槽内容标记为静态，以避免：
    // 1. 组件无法更改插槽节点
    // 2. 静态插槽内容在热重载时失败
    if (
      !isPlatformReservedTag(node.tag) &&
      node.tag !== 'slot' &&
      node.attrsMap['inline-template'] == null
    ) {
      return
    }

    // 遍历节点的子节点，并标记静态节点
    for (let i = 0, l = node.children.length; i < l; i++) {
      const child = node.children[i]
      markStatic(child)
      // 子节点如果不是静态节点，父节点肯定不是静态节点
      if (!child.static) {
        node.static = false
      }
    }
    
    // 如果节点具有条件指令，则遍历条件块，并标记静态节点
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        const block = node.ifConditions[i].block
        markStatic(block)
        // 条件块内不是静态节点，父节点肯定不是静态节点
        if (!block.static) {
          node.static = false
        }
      }
    }
  }
}
```

上述代码，先调用`isStatic`函数判断当前节点是否为静态节点，并打上标记。

```js
// 判断是否为静态节点
node.static = isStatic(node)
```

`isStatic`函数源码如下：

```js
function isStatic (node: ASTNode): boolean {
  if (node.type === 2) { // 带变量的动态节点
    return false
  }
  if (node.type === 3) { // 不带变量的纯文本节点
    return true
  }
  return !!(node.pre || ( // 使用指令v-pre
    !node.hasBindings && // 没有动态绑定
    !node.if && !node.for && // 没有 v-if 或 v-for 或 v-else
    !isBuiltInTag(node.tag) && // 不是内置标签
    isPlatformReservedTag(node.tag) && // 不是组件
    !isDirectChildOfTemplateFor(node) && // 判断节点是否是 template 标签的直接子节点且带有 v-for 属性
    Object.keys(node).every(isStaticKey) // 节点是否为预设的静态键
  ))
}
```

当模板被解析器解析成`AST`时，会根据不同元素类型设置不同`type`值，`type`取值对应关系如下：

| type取值 | 对应的AST节点类型      |
| -------- | ---------------------- |
| 1        | 元素节点               |
| 2        | 包含变量的动态文本节点 |
| 3        | 不包含变量的纯文本节点 |

上述代码逻辑较清晰，具体逻辑如下：

1. `type === 2`，为包含变量的动态节点，说明不是静态节点
2. `type === 3`，为不包含变量的动态节点，说明是静态节点
3. 剩余情况就是`type === 1`，为元素节点，当是元素节点时需要考虑多种情况
   1. 如果使用了指令`v-pre`，说明是静态节点
   2. 否则，需要同时满足以下条件才可以是静态节点
      - 不能使用动态绑定语法，即标签上不能有`v-`、`@`、`:`开头的属性；
      - 不能使用`v-if`、`v-else`、`v-for`指令；
      - 不能是内置组件，即标签名不能是`slot`和`component`；
      - 标签名必须是平台保留标签，即不能是组件；
      - 当前节点的父节点不能是带有 `v-for` 的 `template` 标签；
      - 节点的所有属性的 `key` 都必须是静态节点才有的 `key`，注：静态节点的`key`是有限的，它只能是`type`,`tag`,`attrsList`,`attrsMap`,`plain`,`parent`,`children`,`attrs`之一；

判断当前节点是否为静态节点后，如果节点类型为`1`，说明是元素节点。

首先判断元素节点是否为插槽，如果是插槽，不能将其标记为静态节点

```js
// 不将组件插槽内容标记为静态，以避免：
// 1. 组件无法更改插槽节点
// 2. 静态插槽内容在热重载时失败
if (
  !isPlatformReservedTag(node.tag) &&
  node.tag !== 'slot' &&
  node.attrsMap['inline-template'] == null
) {
  return
}
```

元素节点可能会有子节点，还需要遍历所有子节点，递归调用`markStatic`函数处理。

```js
// 遍历节点的子节点，并标记静态节点
for (let i = 0, l = node.children.length; i < l; i++) {
  const child = node.children[i]
  markStatic(child)
  // 子节点如果不是静态节点，父节点肯定不是静态节点
  if (!child.static) {
    node.static = false
  }
}
```

这里需要注意的是，如果递归完毕后，发现子节点不是静态节点，那父节点肯定不能为静态节点，需要进行处理。

这是因为我们在判断的时候是从上往下判断的，也就是说先判断当前节点，再判断当前节点的子节点，如果当前节点在一开始被标记为了静态节点，但是通过判断子节点的时候发现有一个子节点却不是静态节点，这就有问题了，我们之前说过一旦标记为静态节点，就说明这个节点首次渲染之后不会再发生任何变化，但是它的一个子节点却又是可以变化的，就出现了自相矛盾，所以我们需要当发现它的子节点中有一个不是静态节点的时候，就得把当前节点重新设置为非静态节点

循环`node.children`后还不算把所有子节点都遍历完，因为如果当前节点的子节点中有标签带有`v-if`、`v-else-if`、`v-else`等指令时，这些子节点在每次渲染时都只渲染一个，所以其余没有被渲染的肯定不在`node.children`中，而是存在于`node.ifConditions`，所以我们还要把`node.ifConditions`循环一遍，如下：

```js
// 如果节点具有条件指令，则遍历条件块，并标记静态节点
if (node.ifConditions) {
  for (let i = 1, l = node.ifConditions.length; i < l; i++) {
    const block = node.ifConditions[i].block
    markStatic(block)
    // 条件块内不是静态节点，父节点肯定不是静态节点
    if (!block.static) {
      node.static = false
    }
  }
}
```

同样的，如果条件块内不是静态节点，那父节点肯定不是静态节点，需要将其改为非静态节点

## 标记根静态节点

找出根静态节点的过程跟找出静态节点的过程类似，都是从根节点往下一层层的递归查找。不同的是，如果一个节点被判定为静态根节点，那么将不会继续向它的子级继续寻找。因为静态节点树肯定只有一个根，就是最上面的那个静态节点。

源码如下

```js
/**
 * 标记静态根节点
 * @param {ASTNode} node - 节点
 * @param {boolean} isInFor - 是否在 v-for 指令中
 */
function markStaticRoots (node: ASTNode, isInFor: boolean) {
  // 只能是元素节点
  if (node.type === 1) {
    // 如果节点是静态节点或者只渲染一次的节点，设置 staticInFor 属性为 isInFor
    if (node.static || node.once) {
      node.staticInFor = isInFor
    }

    // 要使节点符合静态根节点的要求，它必须有子节点
    // 这个子节点不能是只有一个静态文本的子节点，否则优化成本将超过收益
    if (node.static && node.children.length && !(
      node.children.length === 1 &&
      node.children[0].type === 3
    )) {
      node.staticRoot = true
      return
    } else {
      node.staticRoot = false
    }

    // 遍历节点的子节点，并递归调用 markStaticRoots 函数
    if (node.children) {
      for (let i = 0, l = node.children.length; i < l; i++) {
        markStaticRoots(node.children[i], isInFor || !!node.for)
      }
    }
    
    // 如果节点具有条件指令，继续遍历条件块，并递归调用 markStaticRoots 函数
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        markStaticRoots(node.ifConditions[i].block, isInFor)
      }
    }
  }
}
```

首先先判断，是否是元素节点，因为只有元素节点才有子节点，可以找静态根节点，不然就只是一个静态子节点。

```js
// 如果节点是静态节点或者只渲染一次的节点，设置 staticInFor 属性为 isInFor
if (node.static || node.once) {
  node.staticInFor = isInFor
}
```

如果节点是静态节点或者只渲染一次的节点，将节点`staticInFor`属性进行标记，这是为了处理静态节点在 v-for 循环中的情况，以便在重新渲染时能够保持静态节点的稳定性。

接下来开始判断当前节点是否为根节点

```js
// 要使节点符合静态根节点的要求，它必须有子节点
// 这个子节点不能是只有一个静态文本的子节点，否则优化成本将超过收益
if (node.static && node.children.length && !(
  node.children.length === 1 &&
  node.children[0].type === 3
)) {
  node.staticRoot = true
  return
} else {
  node.staticRoot = false
}
```

从上述代码中，我们可以知道，一个元素节点必须要满足一下条件才成为静态根节点，不然优化成本就会大于收益

- 节点本身必须是静态节点
- 必须拥有子节点 `children`
- 子节点不能只有一个纯文本节点

这种判断主要是为了避免一个元素节点只有一个文本节点，例如：

```html
<p>这是纯文本节点</p>
```

上述代码中，也可以体现我们之前说的，如果一个节点被判定为静态根节点，那么将不会继续向它的子级继续寻找。因为静态节点树肯定只有一个根，就是最上面的那个静态节点。

接下来，如果当前节点不是静态根节点，那就继续递归遍历它的子节点`node.children`和`node.ifConditions`，如下：

```js
// 遍历节点的子节点，并递归调用 markStaticRoots 函数
if (node.children) {
  for (let i = 0, l = node.children.length; i < l; i++) {
    markStaticRoots(node.children[i], isInFor || !!node.for)
  }
}

// 如果节点具有条件指令，继续遍历条件块，并递归调用 markStaticRoots 函数
if (node.ifConditions) {
  for (let i = 1, l = node.ifConditions.length; i < l; i++) {
    markStaticRoots(node.ifConditions[i].block, isInFor)
  }
}
```

这里跟之前的查找静态节点逻辑一致，就不重复说明了。

## 总结

本小节，我们一起研究了模板编译中的优化阶段，这个阶段主要干了两件事情

1. 在`AST`中找出所有的`静态节点`并打上标记
2. 在`AST`中找出所有的`静态根节点`并打上标记

通过这两件事情，在后续`patch`过程中就可以跳过对比这些节点，提高虚拟DOM中`patch`过程的性能。
