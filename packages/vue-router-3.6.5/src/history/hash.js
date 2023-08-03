/* @flow */

import type Router from '../index'
import { History } from './base'
import { cleanPath } from '../util/path'
import { getLocation } from './html5'
import { setupScroll, handleScroll } from '../util/scroll'
import { pushState, replaceState, supportsPushState } from '../util/push-state'

export class HashHistory extends History {
  constructor (router: Router, base: ?string, fallback: boolean) {
    super(router, base)
    // 如果是降级来的，则重新生成降级的路径
    // 如 base 为 /user 当前路径为/user/admin 则重新生成路径为/user#/admin
    if (fallback && checkFallback(this.base)) {
      return
    }
    // 如果hash开头是/，则代表是hash模式的路由
    // 如果不是，则需要切换成hash模式的路由
    ensureSlash()
  }

  // this is delayed until the app mounts
  // to avoid the hashchange listener being fired too early
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

    const handleRoutingEvent = () => {
      // 获取当前地址信息
      const current = this.current
      // 如果当前路径不符合hash模式，则直接进行替换并取消后续操作
      if (!ensureSlash()) {
        return
      }

      // 进行路由转换
      this.transitionTo(getHash(), route => {
        // 如果支持滚动行为，则处理滚动
        if (supportsScroll) {
          handleScroll(this.router, route, current, true)
        }
        // 不支持history，则使用location.replace跳转
        if (!supportsPushState) {
          replaceHash(route.fullPath)
        }
      })
    }
    // 支持history，使用history相关方法跳转，用popstate监听
    // 不支持history，使用location.replace跳转，用hashchange监听
    const eventType = supportsPushState ? 'popstate' : 'hashchange'
    window.addEventListener(
      eventType,
      handleRoutingEvent
    )
    this.listeners.push(() => {
      window.removeEventListener(eventType, handleRoutingEvent)
    })
  }

  push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    const { current: fromRoute } = this
    this.transitionTo(
      location,
      route => {
        // 添加新路由地址到浏览器历史中
        pushHash(route.fullPath)
        // 处理滚动相关
        handleScroll(this.router, route, fromRoute, false)
        // 执行成功回调
        onComplete && onComplete(route)
      },
      onAbort
    )
  }

  replace (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    const { current: fromRoute } = this
    this.transitionTo(
      location,
      route => {
        // 新的路由地址直接替换当前的浏览器历史记录
        replaceHash(route.fullPath)
        // 处理滚动相关
        handleScroll(this.router, route, fromRoute, false)
        // 执行成功回调
        onComplete && onComplete(route)
      },
      onAbort
    )
  }

  go (n: number) {
    window.history.go(n)
  }

  ensureURL (push?: boolean) {
    const current = this.current.fullPath
    if (getHash() !== current) {
      push ? pushHash(current) : replaceHash(current)
    }
  }

  getCurrentLocation () {
    return getHash()
  }
}

function checkFallback (base) {
  const location = getLocation(base)
  // 如果当前地址中没有hash，则将base之后的地址都放入#后面作为路径
  if (!/^\/#/.test(location)) {
    window.location.replace(cleanPath(base + '/#' + location))
    return true
  }
}

function ensureSlash (): boolean {
  const path = getHash()
  if (path.charAt(0) === '/') {
    return true
  }
  // 切换到hash模式的路由
  replaceHash('/' + path)
  return false
}

// 切割hash
export function getHash (): string {
  // We can't use window.location.hash here because it's not
  // consistent across browsers - Firefox will pre-decode it!
  let href = window.location.href
  const index = href.indexOf('#')
  // empty path
  if (index < 0) return ''

  href = href.slice(index + 1)

  return href
}

function getUrl (path) {
  const href = window.location.href
  const i = href.indexOf('#')
  const base = i >= 0 ? href.slice(0, i) : href
  return `${base}#${path}`
}

function pushHash (path) {
  // 如果环境支持history，则使用pushState跳转
  if (supportsPushState) {
    pushState(getUrl(path))
  } else {
    // 直接修改hash
    window.location.hash = path
  }
}

function replaceHash (path) {
  // 如果环境支持history，则使用replaceState跳转
  if (supportsPushState) {
    replaceState(getUrl(path))
  } else {
    // 不支持直接走replace方法
    window.location.replace(getUrl(path))
  }
}
