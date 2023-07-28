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

这三个变量，也就是`createRouteMap`最终返回的数据，可能一些数据结构比较好的同学就知道后续处理的大概思路了。