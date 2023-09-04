/* @flow */

import { _Vue } from '../install'
import { warn } from './warn'
import { isError } from '../util/errors'

export function resolveAsyncComponents (matched: Array<RouteRecord>): Function {
  return (to, from, next) => {
    let hasAsync = false
    let pending = 0
    let error = null

    // matched 可能包含多个RouteRecord
    // 每个RouteRecord可能有多个component的定义
    // flatMapComponents的价值就是要处理所有
    flatMapComponents(matched, (def, _, match, key) => {
      // if it's a function and doesn't have cid attached,
      // assume it's an async component resolve function.
      // we are not using Vue's default async resolving mechanism because
      // we want to halt the navigation until the incoming component has been
      // resolved.
      if (typeof def === 'function' && def.cid === undefined) {
        hasAsync = true
        pending++

        // 加载成功回调，once防止重复执行
        const resolve = once(resolvedDef => {
          // 如果是 ES 模块，模块的 default 属性才是组件的定义
          if (isESModule(resolvedDef)) {
            resolvedDef = resolvedDef.default
          }
          // 规范化处理异步组件解析后的定义
          def.resolved = typeof resolvedDef === 'function'
            ? resolvedDef
            // 不是函数，说明是已经解析好的组件选项对象
            : _Vue.extend(resolvedDef)
          match.components[key] = resolvedDef
          pending--
          if (pending <= 0) {
            next()
          }
        })

        // 加载失败回调，once防止重复执行
        const reject = once(reason => {
          const msg = `Failed to resolve async component ${key}: ${reason}`
          process.env.NODE_ENV !== 'production' && warn(false, msg)
          if (!error) {
            error = isError(reason)
              ? reason
              : new Error(msg)
            next(error)
          }
        })

        let res
        try {
          // 调用加载函数
          res = def(resolve, reject)
        } catch (e) {
          reject(e)
        }
        if (res) {
          if (typeof res.then === 'function') {
            res.then(resolve, reject)
          } else {
            // new syntax in Vue 2.3
            // Vue2.3 之后 允许异步组件使用一个 component 字段来定义异步组件的加载方式
            const comp = res.component
            if (comp && typeof comp.then === 'function') {
              comp.then(resolve, reject)
            }
          }
        }
      }
    })

    if (!hasAsync) next()
  }
}

/**
 * 将一个匹配的路由记录数组循环执行映射函数，输出扁平化的映射函数结果数组。
 * @param {Array<RouteRecord>} matched - 匹配的路由记录数组
 * @param {Function} fn - 映射函数，接收多个参数并返回一个函数
 * @returns {Array<?Function>} - 扁平化的函数数组
 */
export function flatMapComponents (
  matched: Array<RouteRecord>,
  fn: Function
): Array<?Function> {
  // 使用 flatten 函数将映射后的组件数组扁平化
  return flatten(matched.map(m => {
    return Object.keys(m.components).map(key => fn(
      m.components[key],
      m.instances[key],
      m, key
    ))
  }))
}

/**
 * 将一个嵌套的数组扁平化为一个一维数组。
 * @param {Array<any>} arr - 嵌套的数组
 * @returns {Array<any>} - 扁平化后的一维数组
 */
export function flatten (arr: Array<any>): Array<any> {
  return Array.prototype.concat.apply([], arr)
}

const hasSymbol =
  typeof Symbol === 'function' &&
  typeof Symbol.toStringTag === 'symbol'

function isESModule (obj) {
  return obj.__esModule || (hasSymbol && obj[Symbol.toStringTag] === 'Module')
}

// in Webpack 2, require.ensure now also returns a Promise
// so the resolve/reject functions may get called an extra time
// if the user uses an arrow function shorthand that happens to
// return that Promise.
function once (fn) {
  let called = false
  return function (...args) {
    if (called) return
    called = true
    return fn.apply(this, args)
  }
}
