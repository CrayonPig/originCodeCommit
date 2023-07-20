/* @flow */

import { toArray } from '../util/index'

export function initUse (Vue: GlobalAPI) {
  Vue.use = function (plugin: Function | Object) {
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    // 如果当前插件被注册过，不重复注册
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters
    const args = toArray(arguments, 1)
    // 将Vue实例放在数组第一位，后续install第一个参数必须是Vue实例
    args.unshift(this)
    // 如果插件提供了install方法，则调用install初始化
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    // 如果插件没提供install方法，并且插件本身是一个function，则调用插件本身初始化
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args)
    }
    // 缓存plugin
    installedPlugins.push(plugin)
    return this
  }
}
