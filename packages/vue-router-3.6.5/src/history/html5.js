/* @flow */

import type Router from '../index'
import { History } from './base'
import { cleanPath } from '../util/path'
import { START } from '../util/route'
import { setupScroll, handleScroll } from '../util/scroll'
import { pushState, replaceState, supportsPushState } from '../util/push-state'

export class HTML5History extends History {
  _startLocation: string
  // base 为基准地址
  constructor (router: Router, base: ?string) {
    super(router, base)
    // 拼接完整的初始地址
    this._startLocation = getLocation(this.base)
  }

  // 设置路由监听器，用于处理浏览器地址变化事件
  setupListeners () {
    // 检查是否已设置监听器，避免重复设置
    if (this.listeners.length > 0) {
      return
    }
    // 当前 Vue Router 实例
    const router = this.router
    // 期望的滚动行为
    const expectScroll = router.options.scrollBehavior
    // 是否支持滚动行为
    const supportsScroll = supportsPushState && expectScroll

    // 添加滚动行为的监听器，如果支持滚动行为
    if (supportsScroll) {
      this.listeners.push(setupScroll())
    }

    // 定义处理路由变化事件的回调函数
    const handleRoutingEvent = () => {
      const current = this.current

      // Avoiding first `popstate` event dispatched in some browsers but first
      // history route not updated since async guard at the same time.
      // 获取当前地址信息
      const location = getLocation(this.base)

      // 避免处理浏览器首次 `popstate` 事件时，路由状态尚未更新
      if (this.current === START && location === this._startLocation) {
        return
      }

      // 进行路由转换
      this.transitionTo(location, route => {
        // 如果支持滚动行为，则处理滚动
        if (supportsScroll) {
          handleScroll(router, route, current, true)
        }
      })
    }

    // 添加 `popstate` 事件监听器，并将其添加到 listeners 数组中
    window.addEventListener('popstate', handleRoutingEvent)
    this.listeners.push(() => {
      window.removeEventListener('popstate', handleRoutingEvent)
    })
  }

  go (n: number) {
    window.history.go(n)
  }

  push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    const { current: fromRoute } = this
    this.transitionTo(location, route => {
      // 添加新路由地址到浏览器历史中
      pushState(cleanPath(this.base + route.fullPath))
      // 处理滚动相关
      handleScroll(this.router, route, fromRoute, false)
      // 执行成功回调
      onComplete && onComplete(route)
    }, onAbort)
  }

  replace (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    const { current: fromRoute } = this
    this.transitionTo(location, route => {
      // 新的路由地址直接替换当前的浏览器历史记录
      replaceState(cleanPath(this.base + route.fullPath))
      // 处理滚动相关
      handleScroll(this.router, route, fromRoute, false)
      // 执行成功回调
      onComplete && onComplete(route)
    }, onAbort)
  }

  ensureURL (push?: boolean) {
    if (getLocation(this.base) !== this.current.fullPath) {
      const current = cleanPath(this.base + this.current.fullPath)
      push ? pushState(current) : replaceState(current)
    }
  }

  getCurrentLocation (): string {
    return getLocation(this.base)
  }
}

// 拼接完整路径
export function getLocation (base: string): string {
  let path = window.location.pathname
  const pathLowerCase = path.toLowerCase()
  const baseLowerCase = base.toLowerCase()
  // base="/a" shouldn't turn path="/app" into "/a/pp"
  // https://github.com/vuejs/vue-router/issues/3555
  // so we ensure the trailing slash in the base
  // 把path中的base去除
  if (base && ((pathLowerCase === baseLowerCase) ||
    (pathLowerCase.indexOf(cleanPath(baseLowerCase + '/')) === 0))) {
    path = path.slice(base.length)
  }
  return (path || '/') + window.location.search + window.location.hash
}
