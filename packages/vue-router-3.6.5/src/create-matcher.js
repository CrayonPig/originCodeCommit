/* @flow */

import type VueRouter from './index'
import { resolvePath } from './util/path'
import { assert, warn } from './util/warn'
import { createRoute } from './util/route'
import { fillParams } from './util/params'
import { createRouteMap } from './create-route-map'
import { normalizeLocation } from './util/location'
import { decode } from './util/query'

export type Matcher = {
  match: (raw: RawLocation, current?: Route, redirectedFrom?: Location) => Route;
  addRoutes: (routes: Array<RouteConfig>) => void;
  addRoute: (parentNameOrRoute: string | RouteConfig, route?: RouteConfig) => void;
  getRoutes: () => Array<RouteRecord>;
};

export function createMatcher (
  routes: Array<RouteConfig>,
  router: VueRouter
): Matcher {
  // 根据 routes 数据生成 route map 对象
  const { pathList, pathMap, nameMap } = createRouteMap(routes)

  // 批量新增 route 路由数据
  function addRoutes (routes) {
    // 如果旧的 path 存在，则新的会被忽略掉
    // 旧的 path 是不会被移除的
    createRouteMap(routes, pathList, pathMap, nameMap)
  }

  // 添加一条 route 路由数据
  function addRoute (parentOrRoute, route) {
    // 如果parentOrRoute是字符串，则代表传入的是name，找到对应的route对象，作为父级路由节点
    const parent = (typeof parentOrRoute !== 'object') ? nameMap[parentOrRoute] : undefined
    // $flow-disable-line
    // 如果只有一个参数，则代表是直接添加到最后
    // 如果有两个参数，则第一个参数代表是要添加的父级路由节点，第二个参数为需要添加的路由
    createRouteMap([route || parentOrRoute], pathList, pathMap, nameMap, parent)

    // add aliases of parent
    // 针对 parent 存在 alias 的情形，需要将 alias 数据包装成 route，以保证所有包含别名路径的子路由，也能正确访问，
    if (parent && parent.alias.length) {
      createRouteMap(
        // $flow-disable-line route is defined if parent is
        parent.alias.map(alias => ({ path: alias, children: [route] })),
        pathList,
        pathMap,
        nameMap,
        parent
      )
    }
  }
  
  // 返回一个数组，包含所有的 router record 对象
  function getRoutes () {
    return pathList.map(path => pathMap[path])
  }

  /**
   * 匹配 route
   * @param {*} raw 字符串形式的路径
   * @param {*} currentRoute 当前的 route 实例
   * @param {*} redirectedFrom 用于重定向的 redirectedFrom. 形式为: { 
                  name?: string
                  path?: string
                  hash?: string
                  query?: Dictionary<string | (string | null)[] | null | undefined>
                  params?: Dictionary<string>
                  append?: boolean
                  replace?: boolean
              }
   * @returns 
   */
  function match (
    raw: RawLocation,
    currentRoute?: Route,
    redirectedFrom?: Location
  ): Route {
    // 将 raw 和 currentRoute 分解成为 { path, name, query， params } 的形式。
    // 之所以用到 currentRoute, 是针对 raw 没有 path 和 name 时的原页面刷新，或者同一个动态路径页面跳转
    const location = normalizeLocation(raw, currentRoute, false, router)
    const { name } = location
    // 如果 name, path 同时存在，则优先使用 name
    if (name) {
      const record = nameMap[name]
      if (process.env.NODE_ENV !== 'production') {
        warn(record, `Route with name '${name}' does not exist`)
      }
      // 如果 record 不存在, 则不存在路径。创建相关的 route
      if (!record) return _createRoute(null, location)

      // 获取 record 中所有需要动态匹配的 key。
      // 比如路径为： /:user/:name, 则 paramNames 为 ["user", "name"]
      const paramNames = record.regex.keys
        .filter(key => !key.optional)
        .map(key => key.name)

      if (typeof location.params !== 'object') {
        location.params = {}
      }

      // 通过将currentRoute的params复制给location.params，来汇总当前所有params
      if (currentRoute && typeof currentRoute.params === 'object') {
        // 遍历 current route 的 params
        for (const key in currentRoute.params) {
          if (!(key in location.params) && paramNames.indexOf(key) > -1) {
            location.params[key] = currentRoute.params[key]
          }
        }
      }
      // 根据location.params 替换record.path的动态路径
      location.path = fillParams(record.path, location.params, `named route "${name}"`)
      // 输出route对象
      return _createRoute(record, location, redirectedFrom)
    } else if (location.path) {
      location.params = {}
      for (let i = 0; i < pathList.length; i++) {
        // 获取 path 对应的 record 对象
        const path = pathList[i]
        const record = pathMap[path]
        // 判断是否通过 path 是否能找到对应的 record。
        // 特别注意：location.params 经过 matchRoute()调用后，对于动态路由路径，会存储 url 上对应动态字段的数据。
        if (matchRoute(record.regex, location.path, location.params)) {
          return _createRoute(record, location, redirectedFrom)
        }
      }
    }
    // no match
    // 没有匹配到，直接返回空route对象
    return _createRoute(null, location)
  }

  /**
   * 创建一个重定向路径的路由。
   * @param {*} record 路由跳转路径匹配到的record
   * @param {*} location 需要重定向的信息。
   * @returns 
   */
  function redirect (
    record: RouteRecord,
    location: Location
  ): Route {

    const originalRedirect = record.redirect

    //如果 record.redirect 设置的是一个函数，则调用该函数获取返回值。
    //如果是字符串或者对象，则不处理。
    let redirect = typeof originalRedirect === 'function'
      ? originalRedirect(createRoute(record, location, null, router))
      : originalRedirect

    if (typeof redirect === 'string') {
      redirect = { path: redirect }
    }

    if (!redirect || typeof redirect !== 'object') {
      if (process.env.NODE_ENV !== 'production') {
        warn(
          false, `invalid redirect option: ${JSON.stringify(redirect)}`
        )
      }
      return _createRoute(null, location)
    }

    const re: Object = redirect
    const { name, path } = re
    let { query, hash, params } = location
    query = re.hasOwnProperty('query') ? re.query : query
    hash = re.hasOwnProperty('hash') ? re.hash : hash
    params = re.hasOwnProperty('params') ? re.params : params

    if (name) {
      // resolved named direct
      const targetRecord = nameMap[name]
      if (process.env.NODE_ENV !== 'production') {
        assert(targetRecord, `redirect failed: named route "${name}" not found.`)
      }
      // 将 redirect 的数据封装成一个新的 Location 对象，重新进行跳转匹配
      return match({
        _normalized: true,
        name,
        query,
        hash,
        params
      }, undefined, location)

    } else if (path) {
      // 1. resolve relative redirect
      // 如果用户配置的 redirect 或者 redirect.path 是 “/” 开头，则直接返回。
      // 否则就会以 record.parent.path 作为基准路径。返回结果为一个 /xxx/xxx/xxx 路径。
      const rawPath = resolveRecordPath(path, record)
      // 2. resolve params
      // 补全动态参数
      const resolvedPath = fillParams(rawPath, params, `redirect route with path "${rawPath}"`)
      // 3. rematch with existing query and hash
      // 将 redirect 的数据封装成一个新的 Location 对象，重新进行跳转匹配
      return match({
        _normalized: true,
        path: resolvedPath,
        query,
        hash
      }, undefined, location)
    } else {
      if (process.env.NODE_ENV !== 'production') {
        warn(false, `invalid redirect option: ${JSON.stringify(redirect)}`)
      }
      return _createRoute(null, location)
    }
  }
  // 针对 route conifg 上配置有 alias 属性的处理
  function alias (
    record: RouteRecord,
    location: Location,
    matchAs: string
  ): Route {
    // 将别名路径中动态参数路径使用 params 中对应属性进行填充
    const aliasedPath = fillParams(matchAs, location.params, `aliased route with path "${matchAs}"`)
    // 根据别名路径查找一个 route 实例
    const aliasedMatch = match({
      _normalized: true,
      path: aliasedPath
    })
    // 如果 route 存在
    if (aliasedMatch) {
      // 获取当 aliasedMatch 这个路由的 matched 数组（元素是 record）
      const matched = aliasedMatch.matched
      // 获取最后一个 record 对象
      const aliasedRecord = matched[matched.length - 1]
      // aliasedMatch.params 的数据是 url 上的动态字段对应的数据
      location.params = aliasedMatch.params
      return _createRoute(aliasedRecord, location)
    }
    return _createRoute(null, location)
  }
  // 创建 route 对象
  function _createRoute (
    record: ?RouteRecord,
    location: Location,
    redirectedFrom?: Location
  ): Route {
    // 如果 record 存在，且 record 中配置有 redirect 属性。
    if (record && record.redirect) {
      // 根据 redirect 对应的record 来创建 route 对象
      return redirect(record, redirectedFrom || location)
    }
    // 如果 record.matchAs 存在，则找到 alias 路径找到对应的 record 对象
    if (record && record.matchAs) {
      return alias(record, location, record.matchAs)
    }
    // 此时 record 可能为 null
    return createRoute(record, location, redirectedFrom, router)
  }

  return {
    match,
    addRoute,
    getRoutes,
    addRoutes
  }
}

// 判断 path 是否匹配 regex
function matchRoute (
  regex: RouteRegExp,
  path: string,
  params: Object
): boolean {
  const m = path.match(regex)

  if (!m) {
    return false
  } else if (!params) {
    return true
  }
  // 如果匹配，则将 path 中对应动态路由参数的数据收集到 params 中。
  for (let i = 1, len = m.length; i < len; ++i) {
    const key = regex.keys[i - 1]
    if (key) {
      // Fix #1994: using * with props: true generates a param named 0
      params[key.name || 'pathMatch'] = typeof m[i] === 'string' ? decode(m[i]) : m[i]
    }
  }

  return true
}

function resolveRecordPath (path: string, record: RouteRecord): string {
  // 第三个操作表示要路径拼接
  return resolvePath(path, record.parent ? record.parent.path : '/', true)
}
