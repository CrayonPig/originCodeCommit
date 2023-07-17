/* @flow */

import { makeMap, isBuiltInTag, cached, no } from 'shared/util'

let isStaticKey
let isPlatformReservedTag

const genStaticKeysCached = cached(genStaticKeys)

/**
 * Goal of the optimizer: walk the generated template AST tree
 * and detect sub-trees that are purely static, i.e. parts of
 * the DOM that never needs to change.
 *
 * Once we detect these sub-trees, we can:
 *
 * 1. Hoist them into constants, so that we no longer need to
 *    create fresh nodes for them on each re-render;
 * 2. Completely skip them in the patching process.
 */
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

function genStaticKeys (keys: string): Function {
  return makeMap(
    'type,tag,attrsList,attrsMap,plain,parent,children,attrs' +
    (keys ? ',' + keys : '')
  )
}

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

function isDirectChildOfTemplateFor (node: ASTElement): boolean {
  // 判断节点是否是 template 标签的直接子节点且带有 v-for 属性
  while (node.parent) {
    node = node.parent
     // 如果节点的标签不是 template
    if (node.tag !== 'template') {
      return false
    }

    // 如果节点具有 v-for 属性
    if (node.for) {
      return true
    }
  }
  
  // 节点不是 template 标签的直接子节点或不带有 v-for 属性，返回 false
  return false
}
