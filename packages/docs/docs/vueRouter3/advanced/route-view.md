# \<router-view>

`<router-view>` 组件是一个 `functional` 组件，渲染路径匹配到的视图组件。`<router-view>` 渲染的组件还可以内嵌自己的 `<router-view>`，根据嵌套路径，渲染嵌套组件。

## 源码分析

```js
// src/components/view.js
export default {
  name: 'RouterView',
  functional: true,
  props: {
    name: {
      type: String,
      default: 'default'
    }
  },
  render (_, { props, children, parent, data }) {
    // ...
  }
}
```

从上述代码中，可以看出 `<router-view>` 通过`render`函数渲染，是一个 `functional` 组件，它接收 `name` 作为 props。`name` 会渲染对应的路由配置中 `components` 下的相应组件。

我们逐步分析 `render` 的实现逻辑

```js
data.routerView = true
```

首先，为 `<router-view>` 组件添加自定义数据属性 `routerView` 并赋值为 `true`。该自定义属性主要用于如下功能：

1. 作为`Devtools`工具的标记字段
2. 判断`<router-view>`路由嵌套层级

```js
const h = parent.$createElement
const name = props.name
const route = parent.$route
const cache = parent._routerViewCache || (parent._routerViewCache = {})
```

`<router-view>` 组件不直接渲染，所以使用父级的相关渲染函数，以防止命名插槽的解析问题

```js
// 确定当前视图深度，同时检查组件树是否是keep-alive的非活动状态
let depth = 0
let inactive = false
while (parent && parent._routerRoot !== parent) {
  const vnodeData = parent.$vnode ? parent.$vnode.data : {}
  if (vnodeData.routerView) {
    depth++
  }
  // 如果组件被keep-alive保持状态，并且父组件是非活跃状态，那么当前组件也应该保持状态。
  if (vnodeData.keepAlive && parent._directInactive && parent._inactive) {
    inactive = true
  }
  parent = parent.$parent
}
data.routerViewDepth = depth
```

在理解为什么需要确定当前视图的深度并检查路由树是否已经切换为非活动但需要保留活动状态之前，需要先了解一些基本概念：

1. **路由深度（Route Depth）**：
  路由深度表示在路由层次结构中当前路由的深度或嵌套层级。例如，一个嵌套在另一个路由下的路由将具有更深的嵌套深度。

2. **活动状态（Active State）**：
  路由在Vue Router中可以处于活动状态或非活动状态。活动状态表示当前选中的路由，也就是当前显示在 `<router-view>` 中的路由。

Vue Router需要确定当前视图的深度并检查路由树是否已经切换为非活动但保持活动状态的原因有以下几点：

- **嵌套路由的情况**：
  当存在嵌套路由时，路由可能会有多个层级。Vue Router需要确定当前视图的深度，以便在嵌套路由中正确渲染每个层级的组件。

- **保持活动状态**：
  即使某个路由在视图上不再处于活动状态（比如它的父路由被切换了），但可能由于`<keep-alive/>`仍然需要保留活动状态。

通过确定当前视图的深度并检查路由树，Vue Router可以确保在嵌套路由中正确渲染每个层级的组件，并且可以保留特定路由的活动状态，以满足组件间的交互需求。

```js
// 如果需要保留活动状态，则呈现之前缓存的组件
if (inactive) {
  const cachedData = cache[name]
  const cachedComponent = cachedData && cachedData.component
  if (cachedComponent) {
    if (cachedData.configProps) {
      fillPropsinData(cachedComponent, data, cachedData.route, cachedData.configProps)
    }
    return h(cachedComponent, data, children)
  } else {
    // 如果没有缓存组件，则渲染空节点
    return h()
  }
}
```

如果需要保留活动状态，则呈现之前缓存的组件，并将缓存的`props`加载。如果没有缓存组件，则渲染空节点。

```js
// 根据路由层级和名称获取组件
const matched = route.matched[depth]
const component = matched && matched.components[name]

// 没有匹配的路由或者组件，则渲染空节点
if (!matched || !component) {
  cache[name] = null
  return h()
}

// 缓存组件，以便在下次渲染时复用
// 相当于缓存到parent._routerViewCache中
cache[name] = { component }
```

根据路由层级和名称获取组件，如果没有匹配的路由或者组件，则渲染空节点。如果有匹配到的组件，则进行缓存。

```js
// val 存在则代表注册路由实例
// val 不存在则代表销毁路由实例
data.registerRouteInstance = (vm, val) => {
  // 获取当前路由实例
  const current = matched.instances[name]
  if (
    // val 存在，并且当前路由不等于vm实例，说明路由没注册，则注册路由实例
    (val && current !== vm) ||
    // val 不存在，并且当前路由等于vm实例，则销毁路由实例
    (!val && current === vm)
  ) {
    matched.instances[name] = val
  }
}
```

定义`registerRouteInstance`注册/销毁路由实例，如果`val`存在并且当前路由不等于`vm`实例，说明路由没有注册，则注册路由实例。如果`val`不存在并且当前路由等于`vm`实例，则销毁路由实例。

```js
// 注册`prepatch`生命周期函数，在组件更新之前被调用
;(data.hook || (data.hook = {})).prepatch = (_, vnode) => {
  // 将当前组件实例注册到路由实例中
  matched.instances[name] = vnode.componentInstance
}
```

注册`Vue`的`prepatch`生命周期函数，该生命周期会在组件更新之前被调用。这里将当前组件实例注册到路由实例中。

```js
// 在init钩子中注册实例
// 以防路由更改时激活保活组件
data.hook.init = (vnode) => {
  if (vnode.data.keepAlive &&
    vnode.componentInstance &&
    vnode.componentInstance !== matched.instances[name]
  ) {
    matched.instances[name] = vnode.componentInstance
  }

  // if the route transition has already been confirmed then we weren't
  // able to call the cbs during confirmation as the component was not
  // registered yet, so we call it here.
  // 处理路由进入的函数
  // 如果在路由确认转换时组件还未注册，那么在这里会调用这个函数
  // 这主要是处理异步组件加载的情况，确保在组件加载完成后能正确处理路由的进入。
  handleRouteEntered(route)
}
```

在`init`钩子函数中注册组件实例，如果异步组件，则额外处理路由进入的逻辑。

```js
const configProps = matched.props && matched.props[name]
if (configProps) {
  // 将路由和Props保存在缓存中
  extend(cache[name], {
    route,
    configProps
  })
  // 将数据填充到组件中
  fillPropsinData(component, data, route, configProps)
}
// 渲染组件
return h(component, data, children)
```

在`render`的最后，如果组件有props，则将路由和props保存在缓存中，并将数据填充到组件中。最后渲染组件。

## 组件重新渲染

分析完源码后，我们来梳理下当我们执行 `transitionTo` 来更改路由线路后，组件是如何重新渲染的呢？

```js
// 设置代理，当访问 this.$route 的时候，代理到 this._routerRoot._route
Object.defineProperty(Vue.prototype, '$route', {
  get () { return this._routerRoot._route }
})
```

在初始化的时候，我们对`$route`做了代理，我们在每个 `<router-view>` 执行 `render` 函数的时候，都会访问 `parent.$route`, 
也就是直接访问到`_routerRoot._route`

而在我们混入的 `beforeCreate` 钩子函数中有这么一段逻辑：

```js
Vue.mixin({
  beforeCreate () {
    if (isDef(this.$options.router)) {
      // 将当前路由的状态作为组件实例的响应式属性，这样在路由切换时，组件会自动更新
      Vue.util.defineReactive(this, '_route', this._router.history.current)
    }
    // ...
  }
})
```

在这里把根 Vue 实例的 `_route` 属性定义成响应式的，也就是说当我们访问到`parent.$route`的时候，会访问 `this._routerRoot._route`，触发了它的 `getter`，相当于 `<router-view>` 对它有依赖，然后再执行完 `transitionTo` 后，修改`app._route` 的时候，又触发了`setter`，因此会通知 `<router-view>` 的渲染 `watcher` 更新，重新渲染组件。
