/* @flow */

import config from '../config'
import Watcher from '../observer/watcher'
import { pushTarget, popTarget } from '../observer/dep'
import { isUpdatingChildComponent } from './lifecycle'

import {
  set,
  del,
  observe,
  defineReactive,
  toggleObserving
} from '../observer/index'

import {
  warn,
  bind,
  noop,
  hasOwn,
  hyphenate,
  isReserved,
  handleError,
  nativeWatch,
  validateProp,
  isPlainObject,
  isServerRendering,
  isReservedAttribute
} from '../util/index'

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

export function proxy (target: Object, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

export function initState (vm: Component) {
  vm._watchers = []
  const opts = vm.$options
  // 初始化props
  if (opts.props) initProps(vm, opts.props)
  // 初始化methods
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    // data存在，则解析并创建观察者
    initData(vm)
  } else {
    // 不存在直接为空创建观察者
    observe(vm._data = {}, true /* asRootData */)
  }
  // 初始化computed
  if (opts.computed) initComputed(vm, opts.computed)

  // 初始化watch
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}

function initProps (vm: Component, propsOptions: Object) {
  const propsData = vm.$options.propsData || {}
  const props = vm._props = {}
  // cache prop keys so that future props updates can iterate using Array
  // instead of dynamic object key enumeration.
  // 创建一个数组 keys，用于缓存属性的键，以便后续的属性更新可以使用数组迭代而不是动态对象键枚举。
  const keys = vm.$options._propKeys = []
  const isRoot = !vm.$parent
  // root instance props should be converted
  if (!isRoot) {
    // 非根组件时为子组件，它的属性通常由父组件传递而来。由于父组件已经负责观测这些属性的变化并进行相应的更新，因此在子组件中再次观测这些属性可能会导致重复的触发和更新。
    toggleObserving(false)
  }
  for (const key in propsOptions) {
    keys.push(key)
    const value = validateProp(key, propsOptions, propsData, vm)
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      const hyphenatedKey = hyphenate(key)
      if (isReservedAttribute(hyphenatedKey) ||
          config.isReservedAttr(hyphenatedKey)) {
        warn(
          `"${hyphenatedKey}" is a reserved attribute and cannot be used as component prop.`,
          vm
        )
      }
      defineReactive(props, key, value, () => {
        if (vm.$parent && !isUpdatingChildComponent) {
          warn(
            `Avoid mutating a prop directly since the value will be ` +
            `overwritten whenever the parent component re-renders. ` +
            `Instead, use a data or computed property based on the prop's ` +
            `value. Prop being mutated: "${key}"`,
            vm
          )
        }
      })
    } else {
      // 定义响应式
      defineReactive(props, key, value)
    }
    // static props are already proxied on the component's prototype
    // during Vue.extend(). We only need to proxy props defined at
    // instantiation here.
    // 检查属性名称 key 是否存在于组件实例 vm 中，
    // 如果不存在，则通过 proxy 函数将该属性代理到组件实例的 _props 对象上。
    if (!(key in vm)) {
      proxy(vm, `_props`, key)
    }
  }
  toggleObserving(true)
}

function initData (vm: Component) {
  let data = vm.$options.data
  data = vm._data = typeof data === 'function'
    // 如果是function，则绑定this，获取实际的数据对象
    ? getData(data, vm)
    : data || {}
  if (!isPlainObject(data)) {
    // 如果data是普通对象
    data = {}
    process.env.NODE_ENV !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    )
  }
  // proxy data on instance
  const keys = Object.keys(data)
  const props = vm.$options.props
  const methods = vm.$options.methods
  let i = keys.length
  while (i--) {
    const key = keys[i]
    if (process.env.NODE_ENV !== 'production') {
      if (methods && hasOwn(methods, key)) {
        warn(
          `Method "${key}" has already been defined as a data property.`,
          vm
        )
      }
    }
    if (props && hasOwn(props, key)) {
      // data 字段跟props字段重复
      process.env.NODE_ENV !== 'production' && warn(
        `The data property "${key}" is already declared as a prop. ` +
        `Use prop default value instead.`,
        vm
      )
    } else if (!isReserved(key)) {
      // 避免使用以 $ 或 _ 开头的变量名。避免与 Vue 内部的属性或方法发生命名冲突
      proxy(vm, `_data`, key)
    }
  }
  // observe data
  // 为data创建观察者
  observe(data, true /* asRootData */)
}

export function getData (data: Function, vm: Component): any {
  // #7573 disable dep collection when invoking data getters
  // 取消依赖收集，防止重复收集
  pushTarget()
  try {
    // 绑定this，并获取真正的数据对象
    return data.call(vm, vm)
  } catch (e) {
    handleError(e, vm, `data()`)
    return {}
  } finally {
    // 恢复依赖收集
    popTarget()
  }
}

const computedWatcherOptions = { computed: true }

function initComputed (vm: Component, computed: Object) {
  // $flow-disable-line
  const watchers = vm._computedWatchers = Object.create(null)
  // computed properties are just getters during SSR
  const isSSR = isServerRendering()

  for (const key in computed) {
    const userDef = computed[key]
    // 如果是函数，说明是函数形式的计算逻辑
    // 如果不是函数，则可能是{get,set}的形式， get 方法表示计算属性的获取逻辑，而 set 方法表示计算属性的设置逻辑。
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    if (process.env.NODE_ENV !== 'production' && getter == null) {
      warn(
        `Getter is missing for computed property "${key}".`,
        vm
      )
    }

    if (!isSSR) {
      // create internal watcher for the computed property.
      // 在非服务器端渲染环境下，它会为每个计算属性创建一个内部的观察者对象，并将其存储在 watchers 对象中。这个观察者对象会监听计算属性的依赖变化，并在需要时重新计算计算属性的值。
      watchers[key] = new Watcher(
        vm,
        getter || noop,
        noop,
        computedWatcherOptions
      )
    }

    // 组件定义的计算属性已经在组件原型。我们只需要在这里实例化已定义的计算属性。
    if (!(key in vm)) {
      // 将component 每项由 函数形式改为{get,set}形式，并进行双向绑定
      defineComputed(vm, key, userDef)
    } else if (process.env.NODE_ENV !== 'production') {
      if (key in vm.$data) {
        warn(`The computed property "${key}" is already defined in data.`, vm)
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(`The computed property "${key}" is already defined as a prop.`, vm)
      }
    }
  }
}

export function defineComputed (
  target: any,
  key: string,
  userDef: Object | Function
) {
  const shouldCache = !isServerRendering()
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = shouldCache
      ? createComputedGetter(key)
      : userDef
    sharedPropertyDefinition.set = noop
  } else {
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false
        ? createComputedGetter(key)
        : userDef.get
      : noop
    sharedPropertyDefinition.set = userDef.set
      ? userDef.set
      : noop
  }
  if (process.env.NODE_ENV !== 'production' &&
      sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function () {
      warn(
        `Computed property "${key}" was assigned to but it has no setter.`,
        this
      )
    }
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

function createComputedGetter (key) {
  return function computedGetter () {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      watcher.depend()
      return watcher.evaluate()
    }
  }
}

function initMethods (vm: Component, methods: Object) {
  const props = vm.$options.props
  for (const key in methods) {
    if (process.env.NODE_ENV !== 'production') {
      if (methods[key] == null) {
        warn(
          `Method "${key}" has an undefined value in the component definition. ` +
          `Did you reference the function correctly?`,
          vm
        )
      }
      if (props && hasOwn(props, key)) {
        warn(
          `Method "${key}" has already been defined as a prop.`,
          vm
        )
      }
      if ((key in vm) && isReserved(key)) {
        warn(
          `Method "${key}" conflicts with an existing Vue instance method. ` +
          `Avoid defining component methods that start with _ or $.`
        )
      }
    }
    vm[key] = methods[key] == null ? noop : bind(methods[key], vm)
  }
}

function initWatch (vm: Component, watch: Object) {
  for (const key in watch) {
    const handler = watch[key]
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
}

function createWatcher (
  vm: Component,
  expOrFn: string | Function,
  handler: any,
  options?: Object
) {
  // 如果是个对象，则把handler提出来
  if (isPlainObject(handler)) {
    options = handler
    handler = handler.handler
  }
  // 回调使用的是this上挂载的方法
  if (typeof handler === 'string') {
    handler = vm[handler]
  }
  return vm.$watch(expOrFn, handler, options)
}

export function stateMixin (Vue: Class<Component>) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  const dataDef = {}
  dataDef.get = function () { return this._data }
  const propsDef = {}
  propsDef.get = function () { return this._props }
  if (process.env.NODE_ENV !== 'production') {
    dataDef.set = function (newData: Object) {
      warn(
        'Avoid replacing instance root $data. ' +
        'Use nested data properties instead.',
        this
      )
    }
    propsDef.set = function () {
      warn(`$props is readonly.`, this)
    }
  }
  Object.defineProperty(Vue.prototype, '$data', dataDef)
  Object.defineProperty(Vue.prototype, '$props', propsDef)

  Vue.prototype.$set = set
  Vue.prototype.$delete = del

  Vue.prototype.$watch = function (
    expOrFn: string | Function,
    cb: any,
    options?: Object
  ): Function {
    const vm: Component = this
    // 如果cb是个对象，说明格式是
    // {
    //   handler: function (val, oldVal) { /* ... */ },
    //   deep: true
    // }
    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options)
    }
    options = options || {}
    // 区分用户创建的watcher实例和Vue内部创建的watcher实例
    options.user = true
    const watcher = new Watcher(vm, expOrFn, cb, options)
    // immediate 立即触发
    if (options.immediate) {
      cb.call(vm, watcher.value)
    }
    return function unwatchFn () {
      watcher.teardown()
    }
  }
}
