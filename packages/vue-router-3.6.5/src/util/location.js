/* @flow */

import type VueRouter from '../index'
import { parsePath, resolvePath } from './path'
import { resolveQuery } from './query'
import { fillParams } from './params'
import { warn } from './warn'
import { extend } from './misc'

/**
  * 格式化location
  * @param {*} raw 
  * @param {*} current 当前路由信息 this.$route
  * @param {*} append 表示相对路径是否追加基准路径
  * @param {*} router 当前路由对象 this.$router
  * @returns 
  * {
      _normalized: true,
      name, //name, path 同时存在的情况下，优先使用 name。
      path, //就是 window.location.href 的 pathname 部分。
      query,
      hash,
    } 
  */
export function normalizeLocation (
  raw: RawLocation,
  current: ?Route,
  append: ?boolean,
  router: ?VueRouter
): Location {
  // 如果 raw 是字符串，则表示 raw 就是跳转路径，包装成为 { path: xxx } 形式
  // 如果 raw 是对象，则不需要处理，本身就是  { path: xxx } 或者 { name: xxx } 的形式
  let next: Location = typeof raw === 'string' ? { path: raw } : raw
  // named target
  // 是否已经对 next 进行过格式化处理。如果处理过，则直接返回就行。
  if (next._normalized) {
    return next
  } else if (next.name) {
    // 如果 raw.name 存在，则表示是命名路由跳转形式。则将 raw 中属性浅拷贝到 next 对象中。
    next = extend({}, raw)
    const params = next.params
    if (params && typeof params === 'object') {
      next.params = extend({}, params)
    }
    return next
  }

  // relative params
  // next.name, next.path 都不存在的情形。且 next.params 路径参数对象存在
  // 这种情形就是 path 为 "" 的情形，即原路径跳转(相当于刷新当前页)
  if (!next.path && next.params && current) {
    next = extend({}, next)
    next._normalized = true
    // 将当前 route 的 params 数据，以及要跳转的 next route 的 params 拼凑成一个
    const params: any = extend(extend({}, current.params), next.params)
    // 如果当前 route 的 name 存在
    if (current.name) {
      next.name = current.name
      next.params = params
    } else if (current.matched.length) {
      // 如果 name 不存在; 但是 current 的 record 对象数组存在。
      // 获取 current route 对象对应的 record 对象的 path 属性。
      const rawPath = current.matched[current.matched.length - 1].path
      // 替换动态参数
      next.path = fillParams(rawPath, params, `path ${current.path}`)
    } else if (process.env.NODE_ENV !== 'production') {
      warn(false, `relative params navigation requires a current route.`)
    }
    return next
  }

  const parsedPath = parsePath(next.path || '')
  // 如果 next 的 path 是相对路径，那么就需要 current 的路由 path 作为基准路径
  const basePath = (current && current.path) || '/'
  //处理 parsedPath.path 的路径，如果是绝对路径，则原样返回
  const path = parsedPath.path
    // 如果不是绝对路径，则拼接 basePath
    ? resolvePath(parsedPath.path, basePath, append || next.append)
    : basePath
    
  // 合并所有的 query 
  const query = resolveQuery(
    parsedPath.query,
    next.query,
    router && router.options.parseQuery
  )
  // 如果 next 上存在 hash，则优先使用 next 上的hash。如果 next 上没有 hash，则使用 url 带有的 hash
  let hash = next.hash || parsedPath.hash
  // 没#号，则添加
  if (hash && hash.charAt(0) !== '#') {
    hash = `#${hash}`
  }

  return {
    _normalized: true,
    path,
    query,
    hash
  }
}
