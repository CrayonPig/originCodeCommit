/* @flow */

import { inBrowser } from './dom'
import { saveScrollPosition } from './scroll'
import { genStateKey, setStateKey, getStateKey } from './state-key'
import { extend } from './misc'

// 判断浏览器是否支持 history 模式
export const supportsPushState =
  inBrowser &&
  (function () {
    const ua = window.navigator.userAgent

    if (
      (ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) &&
      ua.indexOf('Mobile Safari') !== -1 &&
      ua.indexOf('Chrome') === -1 &&
      ua.indexOf('Windows Phone') === -1
    ) {
      return false
    }

    return window.history && typeof window.history.pushState === 'function'
  })()

// push 方式跳转新路径，会在 history 中记录。
export function pushState (url?: string, replace?: boolean) {
  // 保存当前页面滚动位置
  saveScrollPosition()
  // try...catch the pushState call to get around Safari
  // DOM Exception 18 where it limits to 100 pushState calls
  const history = window.history
  try {
    // 如果是重定向，使用 history 的 replace 方法
    if (replace) {
      // preserve existing history state as it could be overriden by the user
      // 保存之前 history 的 state
      const stateCopy = extend({}, history.state)

      stateCopy.key = getStateKey()
      history.replaceState(stateCopy, '', url)
    // 如果是跳转，使用 history 的 push 方法
    } else {
      history.pushState({ key: setStateKey(genStateKey()) }, '', url)
    }
  } catch (e) {
    // 如果抛出了异常，则表示栈已经到了最大值，不能push了。
    // 使用 location.assign 也可以用来跳转网址，且 assign 会添加记录到浏览历史，点击后退可以返回到之前页面。
    window.location[replace ? 'replace' : 'assign'](url)
  }
}

// replace 方式跳转新路径，不会在 history 中记录
export function replaceState (url?: string) {
  pushState(url, true)
}
