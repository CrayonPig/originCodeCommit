/* @flow */

import { toNumber, toString, looseEqual, looseIndexOf } from 'shared/util'
import { createTextVNode, createEmptyVNode } from 'core/vdom/vnode'
import { renderList } from './render-list'
import { renderSlot } from './render-slot'
import { resolveFilter } from './resolve-filter'
import { checkKeyCodes } from './check-keycodes'
import { bindObjectProps } from './bind-object-props'
import { renderStatic, markOnce } from './render-static'
import { bindObjectListeners } from './bind-object-listeners'
import { resolveScopedSlots } from './resolve-slots'

export function installRenderHelpers (target: any) {
  // 标记一个 VNode 节点为静态节点（仅渲染一次）
  target._o = markOnce
  // 将值转换为数字
  target._n = toNumber
  // 将值转换为字符串
  target._s = toString
  // 渲染一个列表的 VNode 节点
  target._l = renderList
  // 渲染具名插槽的 VNode 节点
  target._t = renderSlot
  // 检查两个值是否松散相等
  target._q = looseEqual
  // 在数组中查找值的索引，使用松散相等进行比较
  target._i = looseIndexOf
  // 渲染静态根节点的 VNode 节点
  target._m = renderStatic
  // 解析过滤器
  target._f = resolveFilter
  // 检查键盘按键码
  target._k = checkKeyCodes
  // 绑定对象的属性到 VNode 节点上
  target._b = bindObjectProps
  // 创建一个文本类型的 VNode 节点
  target._v = createTextVNode
  // 创建一个空的 VNode 节点
  target._e = createEmptyVNode
  // 解析作用域插槽
  target._u = resolveScopedSlots
  // 将对象的事件监听器绑定到 VNode 节点上
  target._g = bindObjectListeners
}
