import { warn } from '../util/warn'
import { extend } from '../util/misc'
import { handleRouteEntered } from '../util/route'

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
    // devtools 标记字段
    data.routerView = true

    // router-view 不直接渲染，所以使用父级的相关渲染函数，以防止命名插槽的解析问题
    const h = parent.$createElement
    const name = props.name
    const route = parent.$route
    const cache = parent._routerViewCache || (parent._routerViewCache = {})

    // 确定当前视图深度，同时检查组件树是否是keep-alive的非活动状态
    let depth = 0
    let inactive = false
    while (parent && parent._routerRoot !== parent) {
      const vnodeData = parent.$vnode ? parent.$vnode.data : {}
      if (vnodeData.routerView) {
        depth++
      }
      // 如果组件被keep-alive保留状态，并且父组件是非活跃状态，那么当前组件也应该保留状态。
      if (vnodeData.keepAlive && parent._directInactive && parent._inactive) {
        inactive = true
      }
      parent = parent.$parent
    }
    data.routerViewDepth = depth

    // 如果需要保留活动状态，则呈现之前缓存的组件
    if (inactive) {
      const cachedData = cache[name]
      const cachedComponent = cachedData && cachedData.component
      if (cachedComponent) {
        // 如果缓存的组件有props属性，则填充数据
        if (cachedData.configProps) {
          fillPropsinData(cachedComponent, data, cachedData.route, cachedData.configProps)
        }
        return h(cachedComponent, data, children)
      } else {
        // 如果没有缓存组件，则渲染空节点
        return h()
      }
    }

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

    // attach instance registration hook
    // this will be called in the instance's injected lifecycle hooks
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

    // also register instance in prepatch hook
    // in case the same component instance is reused across different routes
    // 注册`prepatch`生命周期函数，在组件更新之前被调用
    ;(data.hook || (data.hook = {})).prepatch = (_, vnode) => {
      // 将当前组件实例注册到路由实例中
      matched.instances[name] = vnode.componentInstance
    }

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
  }
}

function fillPropsinData (component, data, route, configProps) {
  // resolve props
  let propsToPass = data.props = resolveProps(route, configProps)
  if (propsToPass) {
    // clone to prevent mutation
    propsToPass = data.props = extend({}, propsToPass)
    // pass non-declared props as attrs
    const attrs = data.attrs = data.attrs || {}
    for (const key in propsToPass) {
      if (!component.props || !(key in component.props)) {
        attrs[key] = propsToPass[key]
        delete propsToPass[key]
      }
    }
  }
}

function resolveProps (route, config) {
  switch (typeof config) {
    case 'undefined':
      return
    case 'object':
      return config
    case 'function':
      return config(route)
    case 'boolean':
      return config ? route.params : undefined
    default:
      if (process.env.NODE_ENV !== 'production') {
        warn(
          false,
          `props in "${route.path}" is a ${typeof config}, ` +
          `expecting an object, function or boolean.`
        )
      }
  }
}
