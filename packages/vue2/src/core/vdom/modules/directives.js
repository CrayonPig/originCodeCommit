/* @flow */

import { emptyNode } from 'core/vdom/patch'
import { resolveAsset, handleError } from 'core/util/index'
import { mergeVNodeHook } from 'core/vdom/helpers/index'

export default {
  create: updateDirectives,
  update: updateDirectives,
  destroy: function unbindDirectives (vnode: VNodeWithData) {
    updateDirectives(vnode, emptyNode)
  }
}

function updateDirectives (oldVnode: VNodeWithData, vnode: VNodeWithData) {
  if (oldVnode.data.directives || vnode.data.directives) {
    _update(oldVnode, vnode)
  }
}

function _update (oldVnode, vnode) {
  // 判断当前节点`vnode`对应的旧节点`oldVnode`是不是一个空节点，如果是的话，表明当前节点是一个新创建的节点
  const isCreate = oldVnode === emptyNode
  // 判断当前节点`vnode`是不是一个空节点，如果是的话，表明当前节点对应的旧节点将要被销毁
  const isDestroy = vnode === emptyNode
  // 旧的指令集合，即`oldVnode`中保存的指令
  const oldDirs = normalizeDirectives(oldVnode.data.directives, oldVnode.context)
  // 新的指令集合，即`vnode`中保存的指令
  const newDirs = normalizeDirectives(vnode.data.directives, vnode.context)
  // 保存需要触发`inserted`指令钩子函数的指令列表
  const dirsWithInsert = []
  // 保存需要触发`componentUpdated`指令钩子函数的指令列表
  const dirsWithPostpatch = []

  let key, oldDir, dir
  for (key in newDirs) {
    oldDir = oldDirs[key]
    dir = newDirs[key]
    // 判断当前循环到的指令名`key`在旧的指令列表`oldDirs`中是否存在，如果不存在，那么说明这是一个新的指令
    if (!oldDir) {
      // 新的指令触发钩子函数bind
      callHook(dir, 'bind', vnode, oldVnode)
      // 如果定义了inserted 时的钩子函数 那么将该指令添加到dirsWithInsert中
      if (dir.def && dir.def.inserted) {
        dirsWithInsert.push(dir)
      }
    } else {
      // 新旧指令同时存在，说明是更新操作
      dir.oldValue = oldDir.value
      // 触发钩子函数update
      callHook(dir, 'update', vnode, oldVnode)
      // 如果定义了componentUpdated 时的钩子函数 那么将该指令添加到dirsWithPostpatch中
      if (dir.def && dir.def.componentUpdated) {
        dirsWithPostpatch.push(dir)
      }
    }
  }

  // 循环结束后，如果有需要触发`inserted`指令钩子函数的指令列表
  if (dirsWithInsert.length) {
    const callInsert = () => {
      // 循环列表触发 inserted钩子函数
      for (let i = 0; i < dirsWithInsert.length; i++) {
        callHook(dirsWithInsert[i], 'inserted', vnode, oldVnode)
      }
    }
    if (isCreate) {
      // 新创建的节点，虚拟DOM渲染更新的insert钩子函数和指令的inserted钩子函数都要被触发，进行合并
      // 确保后续触发时元素已经被插入到父节点中
      mergeVNodeHook(vnode, 'insert', callInsert)
    } else {
      callInsert()
    }
  }

  // 循环结束后，如果有需要触发`componentUpdated`指令钩子函数的指令列表
  if (dirsWithPostpatch.length) {
    // 将虚拟DOM渲染更新的postpatch钩子函数和指令的componentUpdated钩子函数进行合并触发
    // 保证触发时，指令所在的组件的VNode及其子VNode已经全部更新完
    mergeVNodeHook(vnode, 'postpatch', () => {
      for (let i = 0; i < dirsWithPostpatch.length; i++) {
        callHook(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode)
      }
    })
  }

  if (!isCreate) {
    // 如果某个指令在旧的指令列表，但不在新的指令列表中，说明指令被删除了，需要触发unbind钩子函数
    for (key in oldDirs) {
      if (!newDirs[key]) {
        // no longer present, unbind
        callHook(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy)
      }
    }
  }
}

const emptyModifiers = Object.create(null)

/**
 * 规范化指令
 * 将指令改为如下结构
 * {
 *  'v-focus':{
 *      name : 'focus' ,  // 指令的名称
 *      value : '',       // 指令的值
 *      arg:'',           // 指令的参数
 *      modifiers:{},     // 指令的修饰符
 *      def:{
 *        inserted:fn
 *      }
 *    }
 *  }
 */
function normalizeDirectives (
  dirs: ?Array<VNodeDirective>,
  vm: Component
): { [key: string]: VNodeDirective } {
  const res = Object.create(null)
  if (!dirs) {
    // $flow-disable-line
    return res
  }
  let i, dir
  for (i = 0; i < dirs.length; i++) {
    dir = dirs[i]
    if (!dir.modifiers) {
      // $flow-disable-line
      dir.modifiers = emptyModifiers
    }
    res[getRawDirName(dir)] = dir
    dir.def = resolveAsset(vm.$options, 'directives', dir.name, true)
  }
  // $flow-disable-line
  return res
}

function getRawDirName (dir: VNodeDirective): string {
  return dir.rawName || `${dir.name}.${Object.keys(dir.modifiers || {}).join('.')}`
}

function callHook (dir, hook, vnode, oldVnode, isDestroy) {
  const fn = dir.def && dir.def[hook]
  if (fn) {
    try {
      fn(vnode.elm, dir, vnode, oldVnode, isDestroy)
    } catch (e) {
      handleError(e, vnode.context, `directive ${dir.name} ${hook} hook`)
    }
  }
}
