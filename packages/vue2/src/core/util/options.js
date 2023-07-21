/* @flow */

import config from '../config'
import { warn } from './debug'
import { nativeWatch } from './env'
import { set } from '../observer/index'

import {
  ASSET_TYPES,
  LIFECYCLE_HOOKS
} from 'shared/constants'

import {
  extend,
  hasOwn,
  camelize,
  toRawType,
  capitalize,
  isBuiltInTag,
  isPlainObject
} from 'shared/util'

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 */
const strats = config.optionMergeStrategies

/**
 * Options with restrictions
 */
if (process.env.NODE_ENV !== 'production') {
  strats.el = strats.propsData = function (parent, child, vm, key) {
    if (!vm) {
      warn(
        `option "${key}" can only be used during instance ` +
        'creation with the `new` keyword.'
      )
    }
    return defaultStrat(parent, child)
  }
}

/**
 * Helper that recursively merges two data objects together.
 */
function mergeData (to: Object, from: ?Object): Object {
  if (!from) return to
  let key, toVal, fromVal
  const keys = Object.keys(from)
  for (let i = 0; i < keys.length; i++) {
    key = keys[i]
    toVal = to[key]
    fromVal = from[key]
    if (!hasOwn(to, key)) {
      set(to, key, fromVal)
    } else if (isPlainObject(toVal) && isPlainObject(fromVal)) {
      mergeData(toVal, fromVal)
    }
  }
  return to
}

/**
 * 合并数据或函数
 * @param {*} parentVal 父值
 * @param {*} childVal 子值
 * @param {Component} vm 组件实例
 * @returns {?Function} 合并后的函数
 */
export function mergeDataOrFn (
  parentVal: any,
  childVal: any,
  vm?: Component
): ?Function {
  if (!vm) {
    // 当 vm 不存在时，表示在 Vue.extend 合并中进行合并，此时两个都应该是函数
    if (!childVal) {
      return parentVal
    }
    if (!parentVal) {
      return childVal
    }
    // 当父值和子值都存在时，
    // 我们需要返回一个函数，该函数返回
    // 两个函数的合并结果...这里不需要检查 parentVal 是否为函数
    // 因为它必须是一个函数才能通过之前的合并
    return function mergedDataFn () {
      return mergeData(
        typeof childVal === 'function' ? childVal.call(this, this) : childVal,
        typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal
      )
    }
  } else {
    // 当 vm 存在时，表示在组件实例化阶段进行合并。
    return function mergedInstanceDataFn () {
      // instance merge
      // 获取 childVal 的实例数据，如果 childVal 是一个函数，则调用它，并传入组件实例 vm。
      const instanceData = typeof childVal === 'function'
        ? childVal.call(vm, vm)
        : childVal
      // 获取 parentVal 的默认数据，如果 parentVal 是一个函数，则调用它，并传入组件实例 vm
      const defaultData = typeof parentVal === 'function'
        ? parentVal.call(vm, vm)
        : parentVal
      // 如果实例数据存在，则返回实例数据和默认数据的合并结果；否则，返回默认数据
      if (instanceData) {
        return mergeData(instanceData, defaultData)
      } else {
        return defaultData
      }
    }
  }
}

strats.data = function (
  parentVal: any,
  childVal: any,
  vm?: Component
): ?Function {
  if (!vm) {
    // 如果不存在 vm，则表示在组件定义阶段进行合并
    if (childVal && typeof childVal !== 'function') {
      process.env.NODE_ENV !== 'production' && warn(
        'The "data" option should be a function ' +
        'that returns a per-instance value in component ' +
        'definitions.',
        vm
      )

      return parentVal
    }
    // 合并parentVal和childVal
    return mergeDataOrFn(parentVal, childVal)
  }

  // 合并parentVal和childVal
  return mergeDataOrFn(parentVal, childVal, vm)
}

/**
 * 合并钩子函数
 * @param {?Array<Function>} parentVal 父组件的钩子函数数组
 * @param {?Function|?Array<Function>} childVal 子组件的钩子函数或钩子函数数组
 * @returns {?Array<Function>} 合并后的钩子函数数组
 */
function mergeHook (
  parentVal: ?Array<Function>,
  childVal: ?Function | ?Array<Function>
): ?Array<Function> {
  return childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : Array.isArray(childVal)
        ? childVal
        : [childVal]
    : parentVal
}

LIFECYCLE_HOOKS.forEach(hook => {
  strats[hook] = mergeHook
})

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 * 合并资源对象
 * @param {?Object} parentVal 父组件的资源对象
 * @param {?Object} childVal 子组件的资源对象
 * @param {Component} vm 组件实例
 * @param {string} key 资源类型键名
 * @returns {Object} 合并后的资源对象
 */
function mergeAssets (
  parentVal: ?Object,
  childVal: ?Object,
  vm?: Component,
  key: string
): Object {
  const res = Object.create(parentVal || null)
  if (childVal) {
    process.env.NODE_ENV !== 'production' && assertObjectType(key, childVal, vm)
    return extend(res, childVal)
  } else {
    return res
  }
}

ASSET_TYPES.forEach(function (type) {
  strats[type + 's'] = mergeAssets
})

/**
 * Watchers.
 *
 * Watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 * Watchers 不能被覆盖，所以合并为数组
 * @param {?Object} parentVal 父组件的 watch 对象
 * @param {?Object} childVal 子组件的 watch 对象
 * @param {Component} vm 组件实例
 * @param {string} key watch 对象的键名
 * @returns {?Object} 合并后的 watch 对象
 */
strats.watch = function (
  parentVal: ?Object,
  childVal: ?Object,
  vm?: Component,
  key: string
): ?Object {
  // work around Firefox's Object.prototype.watch...
  if (parentVal === nativeWatch) parentVal = undefined
  if (childVal === nativeWatch) childVal = undefined
  /* istanbul ignore if */
  if (!childVal) return Object.create(parentVal || null)
  if (process.env.NODE_ENV !== 'production') {
    assertObjectType(key, childVal, vm)
  }
  if (!parentVal) return childVal
  const ret = {}
  extend(ret, parentVal)
  for (const key in childVal) {
    let parent = ret[key]
    const child = childVal[key]
    if (parent && !Array.isArray(parent)) {
      parent = [parent]
    }
    ret[key] = parent
      ? parent.concat(child)
      : Array.isArray(child) ? child : [child]
  }
  return ret
}

/**
 * 合并 props、methods、inject 和 computed 对象
 * @param {?Object} parentVal 父组件的对象
 * @param {?Object} childVal 子组件的对象
 * @param {Component} vm 组件实例
 * @param {string} key 对象的键名
 * @returns {?Object} 合并后的对象
 */
strats.props =
strats.methods =
strats.inject =
strats.computed = function (
  parentVal: ?Object,
  childVal: ?Object,
  vm?: Component,
  key: string
): ?Object {
  if (childVal && process.env.NODE_ENV !== 'production') {
    assertObjectType(key, childVal, vm)
  }
  if (!parentVal) return childVal
  const ret = Object.create(null)
  extend(ret, parentVal)
  if (childVal) extend(ret, childVal)
  return ret
}
strats.provide = mergeDataOrFn

/**
 * Default strategy.
 */
const defaultStrat = function (parentVal: any, childVal: any): any {
  return childVal === undefined
    ? parentVal
    : childVal
}

/**
 * Validate component names
 */
function checkComponents (options: Object) {
  for (const key in options.components) {
    validateComponentName(key)
  }
}

export function validateComponentName (name: string) {
  if (!/^[a-zA-Z][\w-]*$/.test(name)) {
    warn(
      'Invalid component name: "' + name + '". Component names ' +
      'can only contain alphanumeric characters and the hyphen, ' +
      'and must start with a letter.'
    )
  }
  if (isBuiltInTag(name) || config.isReservedTag(name)) {
    warn(
      'Do not use built-in or reserved HTML elements as component ' +
      'id: ' + name
    )
  }
}

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 */
function normalizeProps (options: Object, vm: ?Component) {
  // 输出props格式为propB: {
  //    type: String,
  //    ...
  //  }
  const props = options.props
  if (!props) return
  const res = {}
  let i, val, name
  // 对应props: ['propA', 'propB']
  if (Array.isArray(props)) {
    i = props.length
    while (i--) {
      val = props[i]
      if (typeof val === 'string') {
        // 将名字变为驼峰
        name = camelize(val)
        res[name] = { type: null }
      } else if (process.env.NODE_ENV !== 'production') {
        warn('props must be strings when using array syntax.')
      }
    }
  } else if (isPlainObject(props)) {
    // 对应写法：props: {
    //   propA: Number,
    //   propB: {
    //    type: String,
    //    required: true
    //  },
    //  propC: {
    //    type: [String, Number],
    //    default: 'default value'
    //  }
    // }
    for (const key in props) {
      val = props[key]
      name = camelize(key)
      res[name] = isPlainObject(val)
        ? val
        : { type: val }
    }
  } else if (process.env.NODE_ENV !== 'production') {
    warn(
      `Invalid value for option "props": expected an Array or an Object, ` +
      `but got ${toRawType(props)}.`,
      vm
    )
  }
  options.props = res
}

/**
 * Normalize all injections into Object-based format
 */
function normalizeInject (options: Object, vm: ?Component) {
  // 输出格式 dependencyB: {
  //   from: 'propB',
  //   ...
  // }
  const inject = options.inject
  if (!inject) return
  const normalized = options.inject = {}
  if (Array.isArray(inject)) {
  // 对应写法 inject: ['sharedData'],
    for (let i = 0; i < inject.length; i++) {
      normalized[inject[i]] = { from: inject[i] }
    }
  } else if (isPlainObject(inject)) {
    // 对应对象写法 inject: {
    //   dependencyA: 'propA',
    //   dependencyB: {
    //    from: 'propA',
    //    default: 'default value'
    //  }
    // }
    for (const key in inject) {
      const val = inject[key]
      normalized[key] = isPlainObject(val)
        ? extend({ from: key }, val)
        : { from: val }
    }
  } else if (process.env.NODE_ENV !== 'production') {
    warn(
      `Invalid value for option "inject": expected an Array or an Object, ` +
      `but got ${toRawType(inject)}.`,
      vm
    )
  }
}

/**
 * Normalize raw function directives into object format.
 * 将指令格式  Vue.directive('directiveName', function(el, binding, vnode, oldVnode) {
 *      // 指令的操作
 *    });
 * 转为 Vue.directive('directiveName', {
 *      bind(el, binding, vnode) {
 *       // 指令绑定时的操作
 *      },
 *      update(el, binding, vnode) {
 *       // 指令绑定时的操作
 *      },
 *    });
 */
function normalizeDirectives (options: Object) {
  const dirs = options.directives
  if (dirs) {
    for (const key in dirs) {
      const def = dirs[key]
      if (typeof def === 'function') {
        dirs[key] = { bind: def, update: def }
      }
    }
  }
}

function assertObjectType (name: string, value: any, vm: ?Component) {
  if (!isPlainObject(value)) {
    warn(
      `Invalid value for option "${name}": expected an Object, ` +
      `but got ${toRawType(value)}.`,
      vm
    )
  }
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 * @param {Object} parent - 父选项对象
 * @param {Object} child - 子选项对象
 * @param {Component} [vm] - 组件实例对象（可选）
 * @returns {Object} - 合并后的选项对象
 */

export function mergeOptions (
  parent: Object,
  child: Object,
  vm?: Component
): Object {
  // 在非生产环境下检查组件
  if (process.env.NODE_ENV !== 'production') {
    checkComponents(child)
  }

  if (typeof child === 'function') {
    child = child.options
  }

  // 规范化 props
  normalizeProps(child, vm)

  // 规范化 inject
  normalizeInject(child, vm)

  // 规范化 directives
  normalizeDirectives(child)

  // 处理继承
  const extendsFrom = child.extends
  if (extendsFrom) {
    parent = mergeOptions(parent, extendsFrom, vm)
  }

  // 处理混入
  if (child.mixins) {
    for (let i = 0, l = child.mixins.length; i < l; i++) {
      parent = mergeOptions(parent, child.mixins[i], vm)
    }
  }

  // 创建一个空对象，用于保存合并后的选项
  const options = {}

  // 遍历父选项的属性
  let key
  for (key in parent) {
    mergeField(key)
  }

  // 遍历子选项的属性
  for (key in child) {
    // 父属性中不存在再添加
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }

  // 使用策略模式合并字段
  function mergeField (key) {
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }

  // 返回合并后的选项对象
  return options
}

/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 */
export function resolveAsset (
  options: Object,
  type: string,
  id: string,
  warnMissing?: boolean
): any {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return
  }
  const assets = options[type]
  // check local registration variations first
  // 先从本地注册中查找
  if (hasOwn(assets, id)) return assets[id]
  const camelizedId = camelize(id)
  if (hasOwn(assets, camelizedId)) return assets[camelizedId]
  const PascalCaseId = capitalize(camelizedId)
  if (hasOwn(assets, PascalCaseId)) return assets[PascalCaseId]
  // fallback to prototype chain
  // 再从原型链中查找
  const res = assets[id] || assets[camelizedId] || assets[PascalCaseId]
  if (process.env.NODE_ENV !== 'production' && warnMissing && !res) {
    warn(
      'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
      options
    )
  }
  return res
}
