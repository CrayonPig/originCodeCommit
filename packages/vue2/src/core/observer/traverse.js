/* @flow */

import { _Set as Set, isObject } from '../util/index'
import type { SimpleSet } from '../util/index'
import VNode from '../vdom/vnode'

const seenObjects = new Set()

/**
 * Recursively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 */
export function traverse (val: any) {
  _traverse(val, seenObjects)
  seenObjects.clear()
}

function _traverse (val: any, seen: SimpleSet) {
  let i, keys
  const isA = Array.isArray(val)
  // 不是Array或object，再或者已经被冻结，那么直接返回
  if ((!isA && !isObject(val)) || Object.isFrozen(val) || val instanceof VNode) {
    return
  }
  // 使用集合，防止重复收集依赖
  if (val.__ob__) {
    const depId = val.__ob__.dep.id
    if (seen.has(depId)) {
      return
    }
    seen.add(depId)
  }

  // 循环数组，将数组中每一项递归调用_traverse
  if (isA) {
    i = val.length
    while (i--) _traverse(val[i], seen)
  // 获取对象所有key，然后读取，再递归内部值
  } else {
    keys = Object.keys(val)
    i = keys.length
    while (i--) _traverse(val[keys[i]], seen)
  }
}
