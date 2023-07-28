/* @flow */

import Regexp from 'path-to-regexp'
import { cleanPath } from './util/path'
import { assert, warn } from './util/warn'

export function createRouteMap (
  routes: Array<RouteConfig>,
  oldPathList?: Array<string>,
  oldPathMap?: Dictionary<RouteRecord>,
  oldNameMap?: Dictionary<RouteRecord>,
  parentRoute?: RouteRecord
): {
  pathList: Array<string>,
  pathMap: Dictionary<RouteRecord>,
  nameMap: Dictionary<RouteRecord>
} {
  // 存放所有路由的 path
  const pathList: Array<string> = oldPathList || []
  // $flow-disable-line
  // 以 path 作为 key，存放所有的路由描述的Map
  const pathMap: Dictionary<RouteRecord> = oldPathMap || Object.create(null)
  // $flow-disable-line
  // 以 name 作为 key，存放所有的路由描述的Map
  const nameMap: Dictionary<RouteRecord> = oldNameMap || Object.create(null)

  // routes 是一个数组对象。也就是用户手写的 new VueRouter( { routes: [xxx] } ) 的 routes 配置数据
  // 遍历routes数组的数据，将所有元素转化为 router record 对象。且会被记录到 pathMap, nameMap 对象中。
  routes.forEach(route => {
    addRouteRecord(pathList, pathMap, nameMap, route, parentRoute)
  })

  // ensure wildcard routes are always at the end
  // 处理 pathList 中的 path == * 的路径，且移到数组末尾。
  for (let i = 0, l = pathList.length; i < l; i++) {
    if (pathList[i] === '*') {
      // pathList.splice(i, 1) 移除当前元素，返回移除元素的数组
      // pathList.push 将移除的元素放到数组末尾
      pathList.push(pathList.splice(i, 1)[0])
      // 最后一个是当前元素，无需重新处理
      l--
      // 数组发生变更，重新处理新的第i位元素
      i--
    }
  }

  if (process.env.NODE_ENV === 'development') {
    // warn if routes do not include leading slashes
    const found = pathList
    // check for missing leading slash
      .filter(path => path && path.charAt(0) !== '*' && path.charAt(0) !== '/')

    if (found.length > 0) {
      const pathNames = found.map(path => `- ${path}`).join('\n')
      warn(false, `Non-nested routes must include a leading slash character. Fix the following routes: \n${pathNames}`)
    }
  }

  return {
    pathList,
    pathMap,
    nameMap
  }
}

/**
 * 用于添加 route 数据
 * @param {*} pathList 存储路由 path
 * @param {*} pathMap  以 path 作为 key，存放所有的路由描述的Map
 * @param {*} nameMap  以 name 作为 key，存放所有的路由描述的Map
 * @param {*} route 用户配置的单个路由数据信息
 * @param {*} parent 父级路由描述对象
 * @param {*} matchAs 
 */
function addRouteRecord (
  pathList: Array<string>,
  pathMap: Dictionary<RouteRecord>,
  nameMap: Dictionary<RouteRecord>,
  route: RouteConfig,
  parent?: RouteRecord,
  matchAs?: string
) {
  /*
    正常的route 数据为：
      {
        name: xxx,
        path: xxx,
        component: xxx,
        children: [ {
          name: xxx,
          path: xxx,
          component: xxx,
        }]
        meta: xxx
      }
  */
  const { path, name } = route

  if (process.env.NODE_ENV !== 'production') {
    assert(path != null, `"path" is required in a route configuration.`)
    assert(
      typeof route.component !== 'string',
      `route config "component" for path: ${String(
        path || name
      )} cannot be a ` + `string id. Use an actual component instead.`
    )

    warn(
      // eslint-disable-next-line no-control-regex
      !/[^\u0000-\u007F]+/.test(path),
      `Route with path "${path}" contains unencoded characters, make sure ` +
        `your path is correctly encoded before passing it to the router. Use ` +
        `encodeURI to encode static segments of your path.`
    )
  }
  // pathToRegexpOptions 表示编译正则的选项。
  // 可以通过配置 route 的 pathToRegexpOptions 参数添加高级配选项。默认是空对象
  const pathToRegexpOptions: PathToRegexpOptions =
    route.pathToRegexpOptions || {}
  // 格式化路径路径名称
  // 绝对路径直接返回，相对路径就拼接父路由的path
  const normalizedPath = normalizePath(path, parent, pathToRegexpOptions.strict)

  // route.caseSensitive 属性如果存在，则设置到 pathToRegexpOptions 中。
  // caseSensitive： 表示大小写敏感。
  if (typeof route.caseSensitive === 'boolean') {
    pathToRegexpOptions.sensitive = route.caseSensitive
  }

  const record: RouteRecord = {
    // 完整的绝对路径
    path: normalizedPath,
    // 根据完整的路径，以及路径匹配配置参数，生成路径匹配正则对象
    regex: compileRouteRegex(normalizedPath, pathToRegexpOptions),
    // 设置 components
    // 如果是别名路由的创建，则 components 为 undefined。
    components: route.components || { default: route.component },
    // 设置路由别名。别名类似于重定向，但是显示的路径会是别名的路径。
    // 别名可以设置多个，用数组表示；如果只有一个且是字符串，则格式化为数组。
    alias: route.alias
      ? typeof route.alias === 'string'
        ? [route.alias]
        : route.alias
      : [],
    instances: {},
    enteredCbs: {},
    name,
    // 父路由 record 对象
    parent,
    // 如果是 root route, 则 matchAS 为 undefined
    matchAs,
    // 记录路由的 redirect 重定向属性
    redirect: route.redirect,
    // 当前路由单独定义的路由守卫
    beforeEnter: route.beforeEnter,
    // 记录 route 元数据。一般用于配置keepalive, required 等
    meta: route.meta || {},
    // 如果没配置有 route.props，则默认为空对象。
    // 如果配置有 route.props, 则如果 component 存在，则记录 route.props 数据。
    // 说明： props 类似于 query, params，都是用于携带路由传参的。不过 props 会自动把数据传递到组件的 props 中
    props:
      route.props == null
        ? {}
        : route.components
          ? route.props
          : { default: route.props }
  }

  // 如果有子路由
  if (route.children) {
    // Warn if route is named, does not redirect and has a default child route.
    // If users navigate to this route by name, the default child will
    // not be rendered (GH Issue #629)
    if (process.env.NODE_ENV !== 'production') {
      if (
        route.name &&
        !route.redirect &&
        route.children.some(child => /^\/?$/.test(child.path))
      ) {
        warn(
          false,
          `Named Route '${route.name}' has a default child route. ` +
            `When navigating to this named route (:to="{name: '${
              route.name
            }'}"), ` +
            `the default child route will not be rendered. Remove the name from ` +
            `this route and use the name of the default child route for named ` +
            `links instead.`
        )
      }
    }
    // 遍历子路由生成record对象
    route.children.forEach(child => {
      // 如果 route 是用户真实配置的 route 数据，则 matchAs 为 undefine。
      // 如果 route 是 alias 生成的 route 数据，则 matchAs 为被别名的完整路径。
      // 子 route 通过 matchAs 记录没有被别名的完整路径
      const childMatchAs = matchAs
        ? cleanPath(`${matchAs}/${child.path}`)
        : undefined
      addRouteRecord(pathList, pathMap, nameMap, child, record, childMatchAs)
    })
  }
  // 如果 record.path 没有被记录到 pathMap 中。
  // 后面出现相同的 record.path，相当于直接丢弃。
  if (!pathMap[record.path]) {
    pathList.push(record.path)
    pathMap[record.path] = record
  }

  // 如果设置了别名
  if (route.alias !== undefined) {
    // 格式化别名，后续统一为数组处理
    const aliases = Array.isArray(route.alias) ? route.alias : [route.alias]

    for (let i = 0; i < aliases.length; ++i) {
      const alias = aliases[i]
      if (process.env.NODE_ENV !== 'production' && alias === path) {
        warn(
          false,
          `Found an alias with the same value as the path: "${path}". You have to remove that alias. It will be ignored in development.`
        )
        // skip in dev to make it work
        continue
      }

      // 将alias封装为route，生成对应的record
      const aliasRoute = {
        path: alias,
        children: route.children
      }
      addRouteRecord(
        pathList,
        pathMap,
        nameMap,
        aliasRoute,
        parent,
        // record.path 就是被别名的 path 的完整路径。
        record.path || '/' // matchAs
      )
    }
  }

  // 如果 route.name 存在，则记录到nameMap中
  if (name) {
    // 不重复记录
    if (!nameMap[name]) {
      nameMap[name] = record
    } else if (process.env.NODE_ENV !== 'production' && !matchAs) {
      warn(
        false,
        `Duplicate named routes definition: ` +
          `{ name: "${name}", path: "${record.path}" }`
      )
    }
  }
}

/**
 * 编译路由正则表达式
 * @param {*} path 路由完整的绝对路径
 * @param {*} pathToRegexpOptions 正则匹配高级配置选项
 * @returns 
 */
function compileRouteRegex (
  path: string,
  pathToRegexpOptions: PathToRegexpOptions
): RouteRegExp {
  // Regexp 是 path-to-regexp 对象。 vue-router 使用 path-to-regexp.js 来进行路由规则匹配
  // 生成指定 path 的路由匹配正则对象
  const regex = Regexp(path, [], pathToRegexpOptions)
  if (process.env.NODE_ENV !== 'production') {
    const keys: any = Object.create(null)
    regex.keys.forEach(key => {
      warn(
        !keys[key.name],
        `Duplicate param keys in route with path: "${path}"`
      )
      keys[key.name] = true
    })
  }
  // 返回正则匹配对象。 作为 router record 对象的 regex 属性
  return regex
}

/**
 * 规范化路径
 * @param {*} path route中配置的path
 * @param {*} parent 父级route
 * @param {*} strict 严格模式，末尾斜杠是否精确匹配 (default: false)
 * @returns 
 */
function normalizePath (
  path: string,
  parent?: RouteRecord,
  strict?: boolean
): string {
  // 严格模式，末尾斜杠精确匹配
  if (!strict) path = path.replace(/\/$/, '')
  // path为完整路径，返回path
  if (path[0] === '/') return path
  // 如果 parent 不存在，则没有父路径可以拼接
  if (parent == null) return path
  // 返回拼接父路径和当前路径
  return cleanPath(`${parent.path}/${path}`)
}
