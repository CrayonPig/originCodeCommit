/* @flow */

import {
  warn,
  nextTick,
  emptyObject,
  handleError,
  defineReactive
} from '../util/index'

import { createElement } from '../vdom/create-element'
import { installRenderHelpers } from './render-helpers/index'
import { resolveSlots } from './render-helpers/resolve-slots'
import VNode, { createEmptyVNode } from '../vdom/vnode'

import { isUpdatingChildComponent } from './lifecycle'

export function initRender (vm: Component) {
  // 用于存储组件自身实例的虚拟节点，表示组件在虚拟DOM树中的位置。
  vm._vnode = null 
  //缓存 v-once 指令生成的静态树
  vm._staticTrees = null 
  
  const options = vm.$options
  // 父组件创建的占位节点
  const parentVnode = vm.$vnode = options._parentVnode 
  const renderContext = parentVnode && parentVnode.context

  // 插槽内容的集合
  vm.$slots = resolveSlots(options._renderChildren, renderContext)

  // 包含了具名插槽的作用域插槽函数的对象
  vm.$scopedSlots = emptyObject

  // _c 方法的参数顺序是：标签名、数据对象、子节点数组、规范化类型、是否总是规范化。
  // 在组件中创建虚拟节点的辅助函数，实际上就是调用 $createElement。
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)

  // 用于创建虚拟节点，即用于渲染组件的模板。
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)

  // 获取父组件的虚拟节点
  const parentData = parentVnode && parentVnode.data

  /* istanbul ignore else */
  // 将 $attrs 添加到组件实例，并指定其初始值为父虚拟节点的 attrs 属性或空对象（emptyObject）
  // 将 $listeners 添加到组件实例，并指定其初始值为选项对象中的 _parentListeners 属性或空对象（emptyObject）。
  // 区别在于是生产环境，初始化时不需要传递警告的回调函数。
  if (process.env.NODE_ENV !== 'production') {
    // defineReactive 用于定义响应式属性。它会将属性添加到组件实例上，并创建一个响应式的 getter 和 setter
    defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, () => {
      !isUpdatingChildComponent && warn(`$attrs is readonly.`, vm)
    }, true)
    defineReactive(vm, '$listeners', options._parentListeners || emptyObject, () => {
      !isUpdatingChildComponent && warn(`$listeners is readonly.`, vm)
    }, true)
  } else {
    defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, null, true)
    defineReactive(vm, '$listeners', options._parentListeners || emptyObject, null, true)
  }
}

export function renderMixin (Vue: Class<Component>) {
  // install runtime convenience helpers
  installRenderHelpers(Vue.prototype)

  Vue.prototype.$nextTick = function (fn: Function) {
    return nextTick(fn, this)
  }

  Vue.prototype._render = function (): VNode {
    const vm: Component = this
    const { render, _parentVnode } = vm.$options

    // reset _rendered flag on slots for duplicate slot check
    if (process.env.NODE_ENV !== 'production') {
      for (const key in vm.$slots) {
        // $flow-disable-line
        vm.$slots[key]._rendered = false
      }
    }

    if (_parentVnode) {
      vm.$scopedSlots = _parentVnode.data.scopedSlots || emptyObject
    }

    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    vm.$vnode = _parentVnode
    // render self
    let vnode
    try {
      vnode = render.call(vm._renderProxy, vm.$createElement)
    } catch (e) {
      handleError(e, vm, `render`)
      // return error render result,
      // or previous vnode to prevent render error causing blank component
      /* istanbul ignore else */
      if (process.env.NODE_ENV !== 'production') {
        if (vm.$options.renderError) {
          try {
            vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e)
          } catch (e) {
            handleError(e, vm, `renderError`)
            vnode = vm._vnode
          }
        } else {
          vnode = vm._vnode
        }
      } else {
        vnode = vm._vnode
      }
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
      if (process.env.NODE_ENV !== 'production' && Array.isArray(vnode)) {
        warn(
          'Multiple root nodes returned from render function. Render function ' +
          'should return a single root node.',
          vm
        )
      }
      vnode = createEmptyVNode()
    }
    // set parent
    vnode.parent = _parentVnode
    return vnode
  }
}
