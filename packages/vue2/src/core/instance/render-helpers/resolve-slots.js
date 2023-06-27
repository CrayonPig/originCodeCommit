/* @flow */

import type VNode from 'core/vdom/vnode'

/**
 * Runtime helper for resolving raw children VNodes into a slot object.
 */
export function resolveSlots (
  children: ?Array<VNode>,
  context: ?Component
): { [key: string]: Array<VNode> } {
  const slots = {}

  // 如果没有子节点，返回一个空的插槽对象。
  if (!children) {
    return slots
  }

  // 遍历每个子节点以解析插槽。
  for (let i = 0, l = children.length; i < l; i++) {
    const child = children[i]
    const data = child.data

    // 如果节点被解析为Vue插槽节点，则删除插槽属性。以确保在后续的处理中不会将其误解为普通的属性
    if (data && data.attrs && data.attrs.slot) {
      delete data.attrs.slot
    }
    // 相同上下文表明是一个具名插槽
    if ((child.context === context || child.fnContext === context) &&
      data && data.slot != null
    ) {
      const name = data.slot
      const slot = (slots[name] || (slots[name] = []))
      if (child.tag === 'template') {
        slot.push.apply(slot, child.children || [])
      } else {
        slot.push(child)
      }
    } else {
      // 非具名插槽直接存入
      (slots.default || (slots.default = [])).push(child)
    }
  }
  // 忽略只包含空格的插槽
  for (const name in slots) {
    if (slots[name].every(isWhitespace)) {
      delete slots[name]
    }
  }
  return slots
}

function isWhitespace (node: VNode): boolean {
  return (node.isComment && !node.asyncFactory) || node.text === ' '
}

export function resolveScopedSlots (
  fns: ScopedSlotsData, // see flow/vnode
  res?: Object
): { [key: string]: Function } {
  res = res || {}
  for (let i = 0; i < fns.length; i++) {
    if (Array.isArray(fns[i])) {
      resolveScopedSlots(fns[i], res)
    } else {
      res[fns[i].key] = fns[i].fn
    }
  }
  return res
}
