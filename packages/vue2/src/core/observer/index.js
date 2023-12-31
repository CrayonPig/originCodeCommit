/* @flow */

import Dep from './dep'
import VNode from '../vdom/vnode'
import { arrayMethods } from './array'
import {
  def,
  warn,
  hasOwn,
  hasProto,
  isObject,
  isPlainObject,
  isPrimitive,
  isUndef,
  isValidArrayIndex,
  isServerRendering
} from '../util/index'

const arrayKeys = Object.getOwnPropertyNames(arrayMethods)

/**
 * In some cases we may want to disable observation inside a component's
 * update computation.
 */
export let shouldObserve: boolean = true

export function toggleObserving (value: boolean) {
  shouldObserve = value
}

/**
 * Observer class that is attached to each observed
 * object. Once attached, the observer converts the target
 * object's property keys into getter/setters that
 * collect dependencies and dispatch updates.
 */
export class Observer {
  value: any; // 保存观察的对象
  dep: Dep; // 依赖实例，用于跟踪依赖项
  vmCount: number; // 作为根$数据拥有此对象的虚拟机数量

  constructor (value: any) {
    this.value = value;
    this.dep = new Dep(); 
    this.vmCount = 0; // 初始化虚拟机数量为0
    // 在对象上定义不可枚举的 __ob__ 属性，并将其值设置为当前 Observer 实例
    // 表示此对象已经为响应式
    def(value, '__ob__', this); 
    if (Array.isArray(value)) {
      // 支持原型继承（hasProto），使用原型继承的方式（protoAugment）
      // 不支持原型继承（hasProto），使用拷贝属性的方式（copyAugment）
      const augment = hasProto
        ? protoAugment
        : copyAugment
      // 将 arrayMethods 的方法混入数组对象
      augment(value, arrayMethods, arrayKeys)
      // 对数组中的每一项调用 observe
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }

  // 遍历对象的所有属性，将每个属性转换为响应式
  walk (obj: Object) {
    const keys = Object.keys(obj); // 获取对象的所有属性名
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i]); // 将对象的每个属性转换为响应式
    }
  }

  /**
   * Observe a list of Array items.
   */
  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}

// helpers

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 * 原型继承的方式
 */
function protoAugment (target, src: Object, keys: any) {
  /* eslint-disable no-proto */
  target.__proto__ = src
  /* eslint-enable no-proto */
}

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 * 拷贝属性的方式继承
 */
/* istanbul ignore next */
function copyAugment (target: Object, src: Object, keys: Array<string>) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]
    def(target, key, src[key])
  }
}

/**
 * 尝试为value创建Observer实例，
 * 如果创建成功，则返回新的Observer，
 * 如果value已经存在一个Observer，直接返回
 */
export function observe (value: any, asRootData: ?boolean): Observer | void {
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  let ob: Observer | void
  // __ob__ 代表已有observer，直接返回
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    // 没有observer需要创建一个新的
    ob = new Observer(value)
  }
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob
}

/**
 * Define a reactive property on an Object.
 */
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  const dep = new Dep()
  // 获取obj的自身属性描述符
  const property = Object.getOwnPropertyDescriptor(obj, key)
  // 如果是不可配置，则停止
  if (property && property.configurable === false) {
    return
  }

  // 处理预定义的 getter/setter
  const getter = property && property.get
  const setter = property && property.set

  if ((!getter || setter) && arguments.length === 2) {
    // 传入参数没有val，则手动获取
    val = obj[key]
  }
  // 如果存在val时对象或者数组创建observer
  let childOb = !shallow && observe(val)

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          // 为val收集依赖
          childOb.dep.depend()
          if (Array.isArray(value)) {
            // 如果是数组，则跟踪数组依赖
            dependArray(value)
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val
      // 如果新值和旧值相同，或者都是 NaN，则不进行任何操作
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      // 创建观察者
      childOb = !shallow && observe(newVal)
      // 通知依赖项发生变化
      dep.notify()
    }
  })
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
export function set (target: Array<any> | Object, key: any, val: any): any {
  if (process.env.NODE_ENV !== 'production' &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(`Cannot set reactive property on undefined, null, or primitive value: ${(target: any)}`)
  }
  
  // 如果是数组，并且key是有效的数组索引
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    // 使用较大的数值作为新的长度
    target.length = Math.max(target.length, key)
    // 使用splice触发Array拦截器，完成响应
    target.splice(key, 1, val)
    return val
  }
  // 不是数组就是对象
  // 如果key存在，则更新对象中该key的值为val
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }
  // __ob__ 代表是否为响应式对象
  const ob = (target: any).__ob__
  // 不能为Vue实例或者 Vue 实例的根数据对象
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    )
    return val
  }
  // 不是一个响应式对象，只需要简单的增加一个属性
  if (!ob) {
    target[key] = val
    return val
  }
  // 如果是响应式对象，调用defineReactive
  // defineReactive方会将新属性添加完之后并将其转化成响应式
  defineReactive(ob.value, key, val)
  // 通知依赖更新
  ob.dep.notify()
  return val
}

/**
 * Delete a property and trigger change if necessary.
 */
export function del (target: Array<any> | Object, key: any) {
  if (process.env.NODE_ENV !== 'production' &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(`Cannot delete reactive property on undefined, null, or primitive value: ${(target: any)}`)
  }
  // 如果是数组，并且是有效索引长度
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    // 调用splice触发Array拦截器，完成响应
    target.splice(key, 1)
    return
  }

  // __ob__ 代表是否为响应式对象
  const ob = (target: any).__ob__
  // 不能为Vue实例或者 Vue 实例的根数据对象
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    )
    return
  }
  // 不存在这个属性，无需处理
  if (!hasOwn(target, key)) {
    return
  }
  // 删除此属性
  delete target[key]
  // 不是响应式对象，直接完成
  if (!ob) {
    return
  }
  // 是响应式对象，通知依赖更新
  ob.dep.notify()
}

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray (value: Array<any>) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i]
    // 已有observer时，直接收集数组的依赖
    e && e.__ob__ && e.__ob__.dep.depend()
    if (Array.isArray(e)) {
      // 多重数组递归调用
      dependArray(e)
    }
  }
}
