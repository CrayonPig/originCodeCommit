/* @flow */

import { hasOwn } from 'shared/util'
import { warn, hasSymbol } from '../util/index'
import { defineReactive, toggleObserving } from '../observer/index'

export function initProvide (vm: Component) {
  const provide = vm.$options.provide
  if (provide) {
    // 将provide注册为私有属性，如果是function则绑定当前组件为this
    vm._provided = typeof provide === 'function'
      ? provide.call(vm)
      : provide
  }
}

export function initInjections (vm: Component) {
  const result = resolveInject(vm.$options.inject, vm)
  if (result) {
    // 禁用observe
    toggleObserving(false)
    Object.keys(result).forEach(key => {
      /* istanbul ignore else */
      if (process.env.NODE_ENV !== 'production') {
        defineReactive(vm, key, result[key], () => {
          warn(
            `Avoid mutating an injected value directly since the changes will be ` +
            `overwritten whenever the provided component re-renders. ` +
            `injection being mutated: "${key}"`,
            vm
          )
        })
      } else {
        // 将解析出的inject绑定为当前组件的响应式数据
        defineReactive(vm, key, result[key])
      }
    })
    // 开启
    toggleObserving(true)
  }
}

export function resolveInject (inject: any, vm: Component): ?Object {
  if (inject) {
    // inject is :any because flow is not smart enough to figure out cached
    const result = Object.create(null)
    // Reflect.ownKeys() 方法返回一个由所有键（包括符号键和非符号键）组成的数组，
    // 而 Object.keys() 方法只返回一个由字符串键组成的数组
    // 所以优先使用Reflect判断
    const keys = hasSymbol
      ? Reflect.ownKeys(inject).filter(key => {
        /* istanbul ignore next */
        return Object.getOwnPropertyDescriptor(inject, key).enumerable
      })
      : Object.keys(inject)

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const provideKey = inject[key].from
      let source = vm
      while (source) {
        // 根组件_provided为空，后续步骤初始化_provided
        if (source._provided && hasOwn(source._provided, provideKey)) {
          result[key] = source._provided[provideKey]
          break
        }
        // 如果在父级没找到，则向祖先查找，如果父级找到了，直接break出去，不需要祖先覆盖
        source = source.$parent
      }
      if (!source) {
        // 没获取值的时候，如果设置了默认值，default字段，取默认值
        if ('default' in inject[key]) {
          const provideDefault = inject[key].default
          // 如果获取到的值为function，则将this绑定到当前组件
          result[key] = typeof provideDefault === 'function'
            ? provideDefault.call(vm)
            : provideDefault
        } else if (process.env.NODE_ENV !== 'production') {
          warn(`Injection "${key}" not found`, vm)
        }
      }
    }
    return result
  }
}
