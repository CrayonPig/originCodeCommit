# 匹配器

在`Vue Route`中，路由匹配是通过`matcher`相关的方法来实现的。我们先来看一下 `matcher` 的定义：

```js
// src/create-matcher.js

export type Matcher = {
  match: (raw: RawLocation, current?: Route, redirectedFrom?: Location) => Route;
  addRoutes: (routes: Array<RouteConfig>) => void;
  addRoute: (parentNameOrRoute: string | RouteConfig, route?: RouteConfig) => void;
  getRoutes: () => Array<RouteRecord>;
};
```

`matcher`上有多个方法可供使用：

- `match`: 匹配 route
- `addRoutes`: 批量新增 route 路由数据
- `addRoutes`: 添加一条 route 路由数据，可指定被添加路由的父级路由
- `getRoutes`: 获取所有的路由

在研究这几个方法之前，我们先来了解一下上面几个方法中提到的几个数据结构

## 数据结构

### Location

`Location` 数据结构和浏览器提供的 `window.location` 部分结构有点类似，它们都是对 `url` 的结构化描述。

```js
export interface Location {
  // 当前页面的名称
  name?: string
  // 当前页面的路径
  path?: string
  // 当前页面的hash
  hash?: string
  // 当前页面的查询参数
  query?: Dictionary<string | (string | null)[] | null | undefined>
  // 当前页面的动态匹配参数
  params?: Dictionary<string>
  // 在当前页面的路径后面追加新的路径，而不是替换当前路径
  append?: boolean
  // 在页面导航时使用替换而不是添加的方式
  replace?: boolean
}
```

从上述定义中可以知道`Location` 对象包含了当前页面的路径、查询参数和哈希值等信息，以便 `Vue Router` 可以根据该对象来管理路由状态。

### Route

`Route` 对象包含了与当前路由相关的所有信息

```js
export interface Route {
  // 当前路由的路径
  path: string
  // 当前路由的名称
  name?: string | null
  // 当前路由的hash
  hash: string
  // 当前路由的查询参数
  query: Dictionary<string | (string | null)[]>
  // 当前路由的动态匹配参数
  params: Dictionary<string>
  // 当前路由的完整路径，包括基本URL、路径、查询参数和哈希值
  fullPath: string
  // 当前路由匹配的 RouteRecord 对象数组
  matched: RouteRecord[]
  // 如果当前路由是由其他路由重定向而来，存储重定向来源路由的路径
  redirectedFrom?: string
  // 当前路由的元信息，可以包含自定义数据来提供额外的路由信息
  meta?: RouteMeta
}
```

### RouteRecord

`RouteRecord` 是在 `Vue Router` 中表示路由记录的对象类型。每个路由记录都对应着一个路由配置，用于管理路由和组件的映射关系。

```js
export interface RouteRecord {
  // 路由的路径
  path: string
  // 用于匹配路由的正则表达式
  regex: RegExp
  // 用于命名视图的多个组件配置
  components: Dictionary<Component>
  // 组件实例字典，用于存储命名视图对应的组件实例
  instances: Dictionary<Vue>
  // 路由的名称
  name?: string
  // 父级路由记录
  parent?: RouteRecord
  // 路由重定向的配置
  redirect?: RedirectOption
  // 路由别名的路径，用于表示路由的别名
  matchAs?: string
  // 路由的元信息，用于存储与路由相关的自定义信息
  meta: RouteMeta
  // 路由独享的守卫函数，用于在进入该路由之前执行特定的导航守卫逻辑
  beforeEnter?: (
    route: Route,
    redirect: (location: RawLocation) => void,
    next: () => void
  ) => any
  // 路由组件的属性配置，用于传递参数给路由组件
  props:
    | boolean
    | Object
    | RoutePropsFunction
    | Dictionary<boolean | Object | RoutePropsFunction>
}
```

搞明白上述类型的含义后，我们就开始分析`matcher`

## createRouteMap

还记得我们介绍初始化过程的时候，有这么一段代码

```js
this.matcher = createMatcher(options.routes || [], this)
```

当时我们介绍的时候说`createMatcher`会将 `route config` 数据转化为 `record`，我们从这里开始对`matcher`的分析，源码在`src/create-matcher.js`，简化代码如下：

```js
export function createMatcher (
  routes: Array<RouteConfig>,
  router: VueRouter
): Matcher {
  const { pathList, pathMap, nameMap } = createRouteMap(routes)

  function addRoute() {}
  
  function getRoutes() {}

  function addRoutes() {}

  return {
    match,
    addRoute,
    getRoutes,
    addRoutes
  }
}
```

从上述代码中，可以看出，调用`createMatcher`时，主要是调用了`createRouteMap`方法，其余方法都是在此基础上定义的方法。我们继续找`createRouteMap`的定义，源码在`src/create-matcher.js`

```js
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
  // 以 path 作为 key，存放所有的路由描述的Map
  const pathMap: Dictionary<RouteRecord> = oldPathMap || Object.create(null)
  // 以 name 作为 key，存放所有的路由描述的Map
  const nameMap: Dictionary<RouteRecord> = oldNameMap || Object.create(null)

  // routes 是一个数组对象。也就是用户手写的 new VueRouter( { routes: [xxx] } ) 的 routes 配置数据
  // 遍历routes数组的数据，将所有元素转化为 router record 对象。且会被记录到 pathMap, nameMap 对象中。
  routes.forEach(route => {
    addRouteRecord(pathList, pathMap, nameMap, route, parentRoute)
  })

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

  return {
    pathList,
    pathMap,
    nameMap
  }
}
```

`createRouteMap`先定义了三个变量

1. `pathList`: 存放所有路由的 `path`
2. `pathMap`: 以 `path` 作为 `key`，存放所有的路由描述的`Map`
3. `nameMap`: 以 `name` 作为 `key`，存放所有的路由描述的`Map`

这三个变量，也就是`createRouteMap`最终返回的数据，这个数据结构就跟我们之前分析的匹配思路很相似了。

接下来，循环`routes`调用`addRouteRecord`，将数据统一转为`RouteRecord`对象，`addRouteRecord`具体源码我们稍后分析，先顺着主线思路梳理。

循环`routes`完毕后，上述的三个变量就已经完成了添加，然后再对`pathList`处理

```js
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
```

上述代码是处理 `pathList` 中的 `path === *` 的路径，且移到数组末尾，这样是为了确保首先匹配更具体的路由，并且仅在没有其他匹配项时才回退到`*`路由

最后，返回`pathList`、`pathMap`、`nameMap`三个变量，完成`createRouteMap`的逻辑。

## addRouteRecord

`addRouteRecord`的逻辑很简单，将`route`对象转为`RouteRecord`对象，其中`route.path` 使用`path-to-regexp`转换成正则表达式，然后将`RouteRecord`对象添加到`pathMap`、`nameMap`中。

```js
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
    }
  }
}
```

上述代码看着复杂，实际上逻辑较为简单，主要做了几件事

1. 配置编译正则的选项`pathToRegexpOptions`
2. 构建`RouteRecord`对象
   1. `path`为完整路径
   2. `regex`为`path-to-regexp`处理的正则表达式
3. 如果存在嵌套的子路由，则递归处理
4. 将拼接后完整路径的`record.path` 记录到 `pathMap` 中
5. 如果设置了别名选项`alias`，则根据别名，再多构建一个`RouteRecord`对象
6. 如果 `route.name` 存在，则记录到`nameMap`中


## addRoute

`createRouteMap`的逻辑梳理清楚后，我们继续看`createMatcher`的逻辑

```js
export function createMatcher (
  routes: Array<RouteConfig>,
  router: VueRouter
): Matcher {
  const { pathList, pathMap, nameMap } = createRouteMap(routes)

  function addRoute() {}
  
  function getRoutes() {}

  function addRoutes() {}

  function match() {}

  return {
    match,
    addRoute,
    getRoutes,
    addRoutes
  }
}
```

`createMatcher`共返回了四个函数，我们挨个分析

```js
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
```

`addRoute`有两种用法

```js
// 添加一条新路由规则
addRoute(route: RouteConfig): () => void
// 添加一条新的路由规则记录作为现有路由的子路由
addRoute(parentName: string, route: RouteConfig): () => void
```

根据传参的不同，实现不同的功能，我们可以将两部分的代码拆开来分析

### 添加新路由

```js
function addRoute (route) {
  // 如果只有一个参数，则代表是直接添加到最后
  // 如果有两个参数，则第一个参数代表是要添加的父级路由节点，第二个参数为需要添加的路由
  createRouteMap([route], pathList, pathMap, nameMap, parent)
}
```

如果是添加一条新路由规则，则直接调用`createRouteMap`去处理即可

### 添加新路由到指定路由的子集

```js
function addRoute (parent, route) {
  const parent = nameMap[parent]
  // $flow-disable-line
  // 如果只有一个参数，则代表是直接添加到最后
  // 如果有两个参数，则第一个参数代表是要添加的父级路由节点，第二个参数为需要添加的路由
  createRouteMap([route], pathList, pathMap, nameMap, parent)

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
```

相比于单独添加新路由的实现来说，这里针对`parent` 存在 `alias` 的情形做了处理，需要将`alias`处理后的路由添加到列表中，以保证所有包含别名路径的子路由，也能正确访问

## addRoutes

```js
// 批量新增 route 路由数据
function addRoutes (routes) {
  // 如果旧的 path 存在，则新的会被忽略掉
  // 旧的 path 是不会被移除的
  createRouteMap(routes, pathList, pathMap, nameMap)
}
```

`addRoutes`的逻辑较为简单，只需要重新调用`createRouteMap`将新的`routes`传入即可，需要注意的是，由于`createRouteMap`本身的逻辑，如果在已有路由列表和批量新添加的路由中，存在相同 `path` 或 `name` 的情况，则新添加的路由会被忽略掉。

## getRoutes

```js
// 返回一个数组，包含所有的 router record 对象
function getRoutes () {
  return pathList.map(path => pathMap[path])
}
```

`getRoutes`逻辑比较简单，从`pathMap`中取出`pathList`每一项对应的`router record`对象

## match

最关键的`match`函数来了，这个函数是路由匹配的关键

```js
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
```

上述代码逻辑中，主要做了几件事

1. 调用`normalizeLocation`处理路由，计算出对应的`location`对象
2. 如果`location`中`name`存在，则在`nameMap`中匹配`name`
   1. 如果没匹配到，调用`_createRoute`创建对应的空`Route`对象
   2. 如果匹配到，则汇总当前所有`params`，匹配动态路由对应的参数，创建对应的`Route`对象
3. 如果`location`中`path`存在，用`path`找到`pathMap`对应的 `record`，并处理动态路由路径，创建对应的`Route`对象
4. 如果都没匹配到，则调用`_createRoute`创建对应的空`Route`对象
