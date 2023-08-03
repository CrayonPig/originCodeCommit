/* @flow */

import type Router from '../index'
import { History } from './base'
import { NavigationFailureType, isNavigationFailure } from '../util/errors'

export class AbstractHistory extends History {
  index: number
  stack: Array<Route>

  constructor (router: Router, base: ?string) {
    super(router, base)
    // 路由的历史记录
    this.stack = []
    // 当前路由的索引
    this.index = -1
  }

  push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    this.transitionTo(
      location,
      route => {
        // 舍去当前索引之后的历史记录，将新路由添加到栈顶
        this.stack = this.stack.slice(0, this.index + 1).concat(route)
        // 更新索引
        this.index++
        onComplete && onComplete(route)
      },
      onAbort
    )
  }

  replace (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    this.transitionTo(
      location,
      route => {
        // 用新的记录替换当前记录，并舍去后续历史记录
        this.stack = this.stack.slice(0, this.index).concat(route)
        onComplete && onComplete(route)
      },
      onAbort
    )
  }

  go (n: number) {
    const targetIndex = this.index + n
    // 目标索引超出范围，不予处理
    if (targetIndex < 0 || targetIndex >= this.stack.length) {
      return
    }
    // 获取指向路由
    const route = this.stack[targetIndex]
    // 跳转
    this.confirmTransition(
      route,
      () => {
        const prev = this.current
        this.index = targetIndex
        this.updateRoute(route)
        // 触发跳转成功回调
        this.router.afterHooks.forEach(hook => {
          hook && hook(route, prev)
        })
      },
      err => {
        if (isNavigationFailure(err, NavigationFailureType.duplicated)) {
          this.index = targetIndex
        }
      }
    )
  }

  // 获取当前路由
  getCurrentLocation () {
    const current = this.stack[this.stack.length - 1]
    return current ? current.fullPath : '/'
  }

  ensureURL () {
    // noop
  }
}
