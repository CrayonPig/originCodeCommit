# \<router-link>

`<router-link>` 组件支持用户在具有路由功能的应用中 (点击) 导航。 通过 to 属性指定目标地址，默认渲染成带有正确链接的 `<a>` 标签，可以通过配置 tag 属性生成别的标签.。另外，当目标路由成功激活时，链接元素自动设置一个表示激活的 CSS 类名。

```js
// src/components/link.js
export default {
  name: 'RouterLink',
  props: {
    // 表示目标路由的链接。当被点击后，内部会立刻把 to 的值传到 router.push()，所以这个值可以是一个字符串或者是描述目标位置的对象。
    to: {
      type: toTypes,
      required: true
    },
    // router-link渲染的元素
    tag: {
      type: String,
      default: 'a'
    },
    // 是否使用自定义的渲染函数
    custom: Boolean,
    // 是否激活
    exact: Boolean,
    // 是否忽略路径
    exactPath: Boolean,
    // 是否在当前路径前
    append: Boolean,
    // 是否替换当前路径
    replace: Boolean,
    // 自定义的激活样式
    activeClass: String,
    // 自定义的精确匹配激活样式
    exactActiveClass: String,
    // 精确匹配激活时配置的 aria-current
    ariaCurrentValue: {
      type: String,
      default: 'page'
    },
    // 声明可以用来触发导航的事件
    event: {
      type: eventTypes,
      default: 'click'
    }
  },
  render (h: Function) {
    // 获取当前的路由实例和路由器实例
    const router = this.$router
    const current = this.$route

    // 通过路由解析，获取目标路由的位置、路由对象、和 URL
    const { location, route, href } = router.resolve(
      this.to,
      current,
      this.append
    )

    // 创建一个空的对象用于存储 CSS 类
    const classes = {}
    // 获取全局配置的活动类和精确活动类
    const globalActiveClass = router.options.linkActiveClass
    const globalExactActiveClass = router.options.linkExactActiveClass

    // 支持全局的空活动类
    const activeClassFallback =
      globalActiveClass == null ? 'router-link-active' : globalActiveClass
    const exactActiveClassFallback =
      globalExactActiveClass == null
        ? 'router-link-exact-active'
        : globalExactActiveClass

    // 获取当前组件定义的活动类和精确活动类，如果没有定义则使用全局的
    const activeClass =
      this.activeClass == null ? activeClassFallback : this.activeClass
    const exactActiveClass =
      this.exactActiveClass == null
        ? exactActiveClassFallback
        : this.exactActiveClass

    // 如果路由重定向过来，比较目标路由和重定向前的路由
    const compareTarget = route.redirectedFrom
      ? createRoute(null, normalizeLocation(route.redirectedFrom), null, router)
      : route

    // 检查是否应该添加精确活动类和活动类
    classes[exactActiveClass] = isSameRoute(current, compareTarget, this.exactPath)
    classes[activeClass] = this.exact || this.exactPath
      ? classes[exactActiveClass]
      : isIncludedRoute(current, compareTarget)

    // 根据是否存在精确活动类，决定是否添加 "aria-current" 属性
    const ariaCurrentValue = classes[exactActiveClass] ? this.ariaCurrentValue : null

    // 定义事件处理程序，当路由链接被点击时触发
    const handler = e => {
      if (guardEvent(e)) {
        if (this.replace) {
          router.replace(location, noop)
        } else {
          router.push(location, noop)
        }
      }
    }

    // 创建事件监听对象，其中 click 事件由 guardEvent 处理
    const on = { click: guardEvent }

    // 如果事件是一个数组，则为每个事件添加事件处理程序
    if (Array.isArray(this.event)) {
      this.event.forEach(e => {
        on[e] = handler
      })
    } else {
      // 如果事件是一个字符串，直接将事件处理程序与事件绑定
      on[this.event] = handler
    }

    // 创建组件的数据对象，主要包括 CSS 类
    const data: any = { class: classes }

    // 如果有作用域插槽，执行插槽函数
    const scopedSlot =
      !this.$scopedSlots.$hasNormal &&
      this.$scopedSlots.default &&
      this.$scopedSlots.default({
        href,
        route,
        navigate: handler,
        isActive: classes[activeClass],
        isExactActive: classes[exactActiveClass]
      })

    // 如果有作用域插槽内容
    if (scopedSlot) {
      if (process.env.NODE_ENV !== 'production' && !this.custom) {
        // 如果非生产环境且没有使用自定义设置，发出警告
        !warnedCustomSlot && warn(false, 'In Vue Router 4, the v-slot API will by default wrap its content with an <a> element. Use the custom prop to remove this warning:\n<router-link v-slot="{ navigate, href }" custom></router-link>\n')
        warnedCustomSlot = true
      }
      // 根据插槽内容的数量返回对应的内容
      if (scopedSlot.length === 1) {
        return scopedSlot[0]
      } else if (scopedSlot.length > 1 || !scopedSlot.length) {
        if (process.env.NODE_ENV !== 'production') {
          warn(
            false,
            `<router-link> with to="${
              this.to
            }" is trying to use a scoped slot but it didn't provide exactly one child. Wrapping the content with a span element.`
          )
        }
        return scopedSlot.length === 0 ? h() : h('span', {}, scopedSlot)
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      if ('tag' in this.$options.propsData && !warnedTagProp) {
        warn(
          false,
          `<router-link>'s tag prop is deprecated and has been removed in Vue Router 4. Use the v-slot API to remove this warning: https://next.router.vuejs.org/guide/migration/#removal-of-event-and-tag-props-in-router-link.`
        )
        warnedTagProp = true
      }
      if ('event' in this.$options.propsData && !warnedEventProp) {
        warn(
          false,
          `<router-link>'s event prop is deprecated and has been removed in Vue Router 4. Use the v-slot API to remove this warning: https://next.router.vuejs.org/guide/migration/#removal-of-event-and-tag-props-in-router-link.`
        )
        warnedEventProp = true
      }
    }

    // 如果标签是 'a'，直接设置事件监听和属性
    if (this.tag === 'a') {
      data.on = on // 设置事件监听
      data.attrs = { href, 'aria-current': ariaCurrentValue } // 设置属性
    } else {
      // 查找第一个 <a> 子元素并应用事件监听和 href
      const a = findAnchor(this.$slots.default)
      if (a) {
        // 如果 <a> 是一个静态节点，将其标记为非静态
        a.isStatic = false
        const aData = (a.data = extend({}, a.data))
        aData.on = aData.on || {}

        // 将已有事件转换为数组，以便后续添加事件处理程序
        for (const event in aData.on) {
          const handler = aData.on[event]
          if (event in on) {
            aData.on[event] = Array.isArray(handler) ? handler : [handler]
          }
        }

        // 为路由链接添加新的事件监听
        for (const event in on) {
          if (event in aData.on) {
            // on[event] 总是一个函数
            aData.on[event].push(on[event])
          } else {
            aData.on[event] = handler
          }
        }

        const aAttrs = (a.data.attrs = extend({}, a.data.attrs))
        aAttrs.href = href
        aAttrs['aria-current'] = ariaCurrentValue
      } else {
        // 如果没有子元素 <a>，将事件监听应用在自身
        data.on = on
      }
    }

    // 使用渲染函数创建最终的路由链接元素
    return h(this.tag, data, this.$slots.default)
  }
}
```

代码较为简单，可以看出，最终会监听点击事件或者其它可以通过 `prop` 传入的事件类型，执行 `hanlder` 函数，最终执行 `router.push` 或者 `router.replace` 函数，实现路由切换的功能

```js
// 定义事件处理程序，当路由链接被点击时触发
const handler = e => {
  if (guardEvent(e)) {
    if (this.replace) {
      router.replace(location, noop)
    } else {
      router.push(location, noop)
    }
  }
}
```

这里值得注意的是调用的`router.resolve`方法，用于解析给定的路由路径并返回相应的路由对象。这个方法通常用于在组件中动态生成路由链接或导航。

```js
// src/router.js
resolve (
  to: RawLocation,
  current?: Route,
  append?: boolean
): {
  location: Location,
  route: Route,
  href: string,
  // for backwards compat
  normalizedTo: Location,
  resolved: Route
} {
  // 如果 current 这个 route 不存在，则获取当前的路由 route 对象
  current = current || this.history.current
  // 将 to 对象转成标准的 { path:xxx, name:xxx, query:xxx, params:xxx } 的形式。
  const location = normalizeLocation(to, current, append, this)
  // 根据路径匹配相关配置，然后创建一个新的 route 对象
  const route = this.match(location, current)
  // 获取全路径（这个路径是替换完了动态参数的路径。）
  const fullPath = route.redirectedFrom || route.fullPath
  // 获取路由的基准路径
  const base = this.history.base
  // 完整的 url
  const href = createHref(base, fullPath, this.mode)
  return {
    location,
    route,
    href,
    // for backwards compat
    normalizedTo: location,
    resolved: route
  }
}
```
