/* @flow */

import { isRegExp, remove } from 'shared/util'
import { getFirstComponentChild } from 'core/vdom/helpers/index'

type VNodeCache = { [key: string]: ?VNode };

function getComponentName (opts: ?VNodeComponentOptions): ?string {
  return opts && (opts.Ctor.options.name || opts.tag)
}

function matches (pattern: string | RegExp | Array<string>, name: string): boolean {
  if (Array.isArray(pattern)) {
    return pattern.indexOf(name) > -1
  } else if (typeof pattern === 'string') {
    return pattern.split(',').indexOf(name) > -1
  } else if (isRegExp(pattern)) {
    return pattern.test(name)
  }
  /* istanbul ignore next */
  return false
}

function pruneCache (keepAliveInstance: any, filter: Function) {
  const { cache, keys, _vnode } = keepAliveInstance
  // 遍历缓存对象
  for (const key in cache) {
    const cachedNode: ?VNode = cache[key]
    if (cachedNode) {
      // 获取节点name
      const name: ?string = getComponentName(cachedNode.componentOptions)
      if (name && !filter(name)) {
        // 规则更新后，不需要缓存的组件被销毁
        pruneCacheEntry(cache, key, keys, _vnode)
      }
    }
  }
}

function pruneCacheEntry (
  cache: VNodeCache,
  key: string,
  keys: Array<string>,
  current?: VNode
) {
  const cached = cache[key]
  // 判断当前没有处于被渲染状态的组件，将其销毁
  if (cached && (!current || cached.tag !== current.tag)) {
    cached.componentInstance.$destroy()
  }
  // 清空缓存
  cache[key] = null
  remove(keys, key)
}

const patternTypes: Array<Function> = [String, RegExp, Array]

export default {
  name: 'keep-alive',
  abstract: true,

  props: {
    // include 表示只有匹配到的组件会被缓存
    include: patternTypes,
    // exclude 表示任何匹配到的组件都不会被缓存
    exclude: patternTypes,
    // 缓存组件的数量
    max: [String, Number]
  },

  created () {
    // 初始化缓存对象
    this.cache = Object.create(null)
    // 初始化节点key集合，就是this.cache的键值
    this.keys = []
  },

  destroyed () {
    // 遍历缓存对象，挨个销毁
    for (const key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys)
    }
  },

  mounted () {
    // 监听include和exclude，如果发生变化则调用pruneCache
    this.$watch('include', val => {
      pruneCache(this, name => matches(val, name))
    })
    this.$watch('exclude', val => {
      pruneCache(this, name => !matches(val, name))
    })
  },

  render () {
    // 获取插槽中第一个节点
    const slot = this.$slots.default
    const vnode: VNode = getFirstComponentChild(slot)

    const componentOptions: ?VNodeComponentOptions = vnode && vnode.componentOptions
    if (componentOptions) {
      // 获取节点的名称，优先获取节点的name字段，如果name不存在则获取节点的tag
      const name: ?string = getComponentName(componentOptions)
      const { include, exclude } = this
      if (
        // 如果name不在include中
        (include && (!name || !matches(include, name))) ||
        // 如果name存在于exclude中
        (exclude && name && matches(exclude, name))
      ) {
        // 不缓存，直接返回
        return vnode
      }

      const { cache, keys } = this
      // 获取当前节点的key
      const key: ?string = vnode.key == null
        // same constructor may get registered as different local components
        // so cid alone is not enough (#3269)
        ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
        : vnode.key
      // 如果缓存中存在组件
      if (cache[key]) {
        // 从缓存中读取各种选项信息赋值给当前的节点
        vnode.componentInstance = cache[key].componentInstance
        // 通过删除和重新添加key，将key放在缓存最后
        // 防止超出最大缓存条数被删除
        remove(keys, key)
        keys.push(key)
      } else {
        // 当前vnode存入缓存中
        cache[key] = vnode
        keys.push(key)
        // 如果超出最大缓存条数，则删除存储的第一条，也就是最早存储的一条
        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode)
        }
      }

      vnode.data.keepAlive = true
    }
    return vnode || (slot && slot[0])
  }
}
