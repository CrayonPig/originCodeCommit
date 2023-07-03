/* @flow */

import config from '../config'
import Watcher from '../observer/watcher'
import { mark, measure } from '../util/perf'
import { createEmptyVNode } from '../vdom/vnode'
import { updateComponentListeners } from './events'
import { resolveSlots } from './render-helpers/resolve-slots'
import { toggleObserving } from '../observer/index'
import { pushTarget, popTarget } from '../observer/dep'

import {
  warn,
  noop,
  remove,
  handleError,
  emptyObject,
  validateProp
} from '../util/index'

export let activeInstance: any = null
export let isUpdatingChildComponent: boolean = false

export function initLifecycle (vm: Component) {
  const options = vm.$options

  // locate first non-abstract parent
  let parent = options.parent
  // 如果存在父组件实例并且当前组件实例不是抽象组件（abstract为false）
  if (parent && !options.abstract) {
    // 当父组件实例是抽象组件且父组件实例的父组件存在时，执行循环体。保证最后找到的父组件不是抽象组件
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent
    }
    // 将当前组件加入到父组件中的列表中
    parent.$children.push(vm)
  }

  // 父组件实例
  vm.$parent = parent
  // 根组件实例
  vm.$root = parent ? parent.$root : vm

  // 子组件实例数组
  vm.$children = []
  // ref 引用对象
  vm.$refs = {}

  vm._watcher = null; // 渲染 watcher 实例
  vm._inactive = null; // 是否处于非激活状态
  vm._directInactive = false; // 是否直接处于非激活状态
  vm._isMounted = false; // 是否已挂载
  vm._isDestroyed = false; // 是否已销毁
  vm._isBeingDestroyed = false; // 是否正在销毁
}

export function lifecycleMixin (Vue: Class<Component>) {
  Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
    const vm: Component = this
    const prevEl = vm.$el
    const prevVnode = vm._vnode
    const prevActiveInstance = activeInstance
    activeInstance = vm
    vm._vnode = vnode
    // Vue.prototype.__patch__ is injected in entry points
    // based on the rendering backend used.
    if (!prevVnode) {
      // initial render
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
    } else {
      // updates
      vm.$el = vm.__patch__(prevVnode, vnode)
    }
    activeInstance = prevActiveInstance
    // update __vue__ reference
    if (prevEl) {
      prevEl.__vue__ = null
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm
    }
    // if parent is an HOC, update its $el as well
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el
    }
    // updated hook is called by the scheduler to ensure that children are
    // updated in a parent's updated hook.
  }

  Vue.prototype.$forceUpdate = function () {
    const vm: Component = this
    if (vm._watcher) {
      vm._watcher.update()
    }
  }

  Vue.prototype.$destroy = function () {
    const vm: Component = this
    // 防止重复调用
    if (vm._isBeingDestroyed) {
      return
    }
  
    callHook(vm, 'beforeDestroy')
  
    // 表示组件正在销毁
    vm._isBeingDestroyed = true
  
    // 从父级中删除当前组件
    const parent = vm.$parent
    // 如果父组件没有被销毁，并且当前组件不是一个抽象组件
    if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
      remove(parent.$children, vm)
    }
    // 销毁watcher监听
    // _watcher 是组件的主 Watcher，负责监听组件中的响应式数据变化。
    if (vm._watcher) {
      vm._watcher.teardown()
    }
    // _watchers 是组件所有的 Watcher 数组，包括主 Watcher 在内，存储了与组件的计算属性、侦听属性等相关联的其他 Watcher 实例。
    let i = vm._watchers.length
    while (i--) {
      vm._watchers[i].teardown()
    }
  
    // __ob__标识了一个对象的响应式特性，并管理依赖追踪和引用计数等功能，可通过vmCount--来释放对应的Observer对象
    if (vm._data.__ob__) {
      vm._data.__ob__.vmCount--
    }
    // 标记组件已被销毁
    vm._isDestroyed = true
    // 将当前虚拟节点_vnode 设置为null，触发当前渲染树的销毁
    vm.__patch__(vm._vnode, null)
    // 触发destroyed生命周期钩子
    callHook(vm, 'destroyed')
    // 关闭所有监听事件
    vm.$off()
    // 删除 __vue__ 引用
    // __vue__ 用来获取组件实例
    if (vm.$el) {
      vm.$el.__vue__ = null
    }
    // 解除循环引用
    if (vm.$vnode) {
      vm.$vnode.parent = null
    }
  }
}

export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  // 将组件实例$el设置为挂载的dom
  vm.$el = el
  if (!vm.$options.render) {
  // 如果没有render，则创建一个空的VNode作为render
    vm.$options.render = createEmptyVNode
    if (process.env.NODE_ENV !== 'production') {
      /* istanbul ignore if */
      if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
        vm.$options.el || el) {
        warn(
          'You are using the runtime-only build of Vue where the template ' +
          'compiler is not available. Either pre-compile the templates into ' +
          'render functions, or use the compiler-included build.',
          vm
        )
      } else {
        warn(
          'Failed to mount component: template or render function not defined.',
          vm
        )
      }
    }
  }
  // 调用生命周期 beforeMount
  callHook(vm, 'beforeMount')

  let updateComponent
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    updateComponent = () => {
      const name = vm._name
      const id = vm._uid
      const startTag = `vue-perf-start:${id}`
      const endTag = `vue-perf-end:${id}`

      mark(startTag)
      const vnode = vm._render()
      mark(endTag)
      measure(`vue ${name} render`, startTag, endTag)

      mark(startTag)
      vm._update(vnode, hydrating)
      mark(endTag)
      measure(`vue ${name} patch`, startTag, endTag)
    }
  } else {
    updateComponent = () => {
      // 执行渲染函数vm._render()得到一份最新的VNode节点树
      // vm._update()方法对最新的VNode节点树与上一次渲染的旧VNode节点树进行对比并更新DOM节点(即patch操作)，完成一次渲染。
      // hydrating 是一个布尔值，用于指示是否是服务端渲染（hydration）的过程。
      vm._update(vm._render(), hydrating)
    }
  }

  // 将updateComponent作为Watcher第二个参数传入，创建一个watcher实例。并且会立即执行updateComponent, 完成渲染

  // Watcher实例化后，updateComponent函数中使用到的所有数据都将被watcher监听，一但发生改变，就执行第四个参数，也就是这里的before, 又通过私有属性_isMounted判断是否渲染完成后，再次调用beforeUpdate生命周期钩子。

  // Watcher内部会在更新完成后调用updated生命周期钩子，从而完成整个挂载阶段的流程。
  new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)
  hydrating = false

  // $vnode 组件实例的占位节点，用于表示组件在父组件中的位置
  // $vnode 为null，表示组件初次挂载
  if (vm.$vnode == null) {
    vm._isMounted = true
    callHook(vm, 'mounted')
  }
  return vm
}

export function updateChildComponent (
  vm: Component,
  propsData: ?Object,
  listeners: ?Object,
  parentVnode: MountedComponentVNode,
  renderChildren: ?Array<VNode>
) {
  if (process.env.NODE_ENV !== 'production') {
    isUpdatingChildComponent = true
  }

  // determine whether component has slot children
  // we need to do this before overwriting $options._renderChildren
  const hasChildren = !!(
    renderChildren ||               // has new static slots
    vm.$options._renderChildren ||  // has old static slots
    parentVnode.data.scopedSlots || // has new scoped slots
    vm.$scopedSlots !== emptyObject // has old scoped slots
  )

  vm.$options._parentVnode = parentVnode
  vm.$vnode = parentVnode // update vm's placeholder node without re-render

  if (vm._vnode) { // update child tree's parent
    vm._vnode.parent = parentVnode
  }
  vm.$options._renderChildren = renderChildren

  // update $attrs and $listeners hash
  // these are also reactive so they may trigger child update if the child
  // used them during render
  vm.$attrs = parentVnode.data.attrs || emptyObject
  vm.$listeners = listeners || emptyObject

  // update props
  if (propsData && vm.$options.props) {
    toggleObserving(false)
    const props = vm._props
    const propKeys = vm.$options._propKeys || []
    for (let i = 0; i < propKeys.length; i++) {
      const key = propKeys[i]
      const propOptions: any = vm.$options.props // wtf flow?
      props[key] = validateProp(key, propOptions, propsData, vm)
    }
    toggleObserving(true)
    // keep a copy of raw propsData
    vm.$options.propsData = propsData
  }

  // update listeners
  listeners = listeners || emptyObject
  const oldListeners = vm.$options._parentListeners
  vm.$options._parentListeners = listeners
  updateComponentListeners(vm, listeners, oldListeners)

  // resolve slots + force update if has children
  if (hasChildren) {
    vm.$slots = resolveSlots(renderChildren, parentVnode.context)
    vm.$forceUpdate()
  }

  if (process.env.NODE_ENV !== 'production') {
    isUpdatingChildComponent = false
  }
}

function isInInactiveTree (vm) {
  while (vm && (vm = vm.$parent)) {
    if (vm._inactive) return true
  }
  return false
}

export function activateChildComponent (vm: Component, direct?: boolean) {
  if (direct) {
    vm._directInactive = false
    if (isInInactiveTree(vm)) {
      return
    }
  } else if (vm._directInactive) {
    return
  }
  if (vm._inactive || vm._inactive === null) {
    vm._inactive = false
    for (let i = 0; i < vm.$children.length; i++) {
      activateChildComponent(vm.$children[i])
    }
    callHook(vm, 'activated')
  }
}

export function deactivateChildComponent (vm: Component, direct?: boolean) {
  if (direct) {
    vm._directInactive = true
    if (isInInactiveTree(vm)) {
      return
    }
  }
  if (!vm._inactive) {
    vm._inactive = true
    for (let i = 0; i < vm.$children.length; i++) {
      deactivateChildComponent(vm.$children[i])
    }
    callHook(vm, 'deactivated')
  }
}

export function callHook (vm: Component, hook: string) {
  // #7573 disable dep collection when invoking lifecycle hooks
  // 调用生命周期钩子函数时, 禁用依赖收集
  pushTarget()
  // 获取组件实例 vm 中指定生命周期钩子 hook 的处理函数数组。
  const handlers = vm.$options[hook]
  if (handlers) {
    for (let i = 0, j = handlers.length; i < j; i++) {
      try {
        // 调用处理函数，并将组件实例作为上下文 (this) 来执行。
        handlers[i].call(vm)
      } catch (e) {
        handleError(e, vm, `${hook} hook`)
      }
    }
  }
  // 判断组件实例是否有钩子事件监听器。
  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook)
  }
  // 恢复依赖收集的状态
  popTarget()
}
