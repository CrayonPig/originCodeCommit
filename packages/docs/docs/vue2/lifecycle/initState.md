# 初始化阶段(initState)

`initState` 函数用于初始化组件的状态，包括 props、methods、data、computed 和 watch。它会根据组件的配置项逐个进行初始化，并在必要的情况下创建观察者对象来实现响应式。这个函数在 Vue 组件的初始化过程中被调用，确保组件状态的正确初始化和响应式特性。

源码在`src/core/instance/state.js`

```js
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
```

函数内部首先初始化一个空数组 `_watchers`，用于存储组件的观察者对象。

然后获取组件的配置项 `$options`。

接下来，根据配置项的不同字段，依次执行以下操作：

1. 如果配置项中存在 `props`，则调用 `initProps` 函数初始化组件的 props。
2. 如果配置项中存在 `methods`，则调用 `initMethods` 函数初始化组件的 methods。
3. 如果配置项中存在 `data`，则调用 `initData` 函数解析并创建组件的观察者对象。

- `initData` 函数会在组件实例上创建 `_data` 属性，并将其初始化为一个空对象。然后使用 `observe` 函数创建该对象的观察者对象。

4. 如果配置项中存在 `computed`，则调用 `initComputed` 函数初始化组件的 computed 属性。
5. 如果配置项中存在 `watch` 并且不等于原生的 `nativeWatch`，则调用 `initWatch` 函数初始化组件的 watch 属性。

## initProps

`initProps` 函数用于初始化组件的 props。它解析和验证组件的 props 配置，并将其定义为响应式属性。同时，如果组件不是根组件，则禁止观察属性的变化，以避免重复的触发和更新。

```js
function initProps (vm: Component, propsOptions: Object) {
  const propsData = vm.$options.propsData || {}
  const props = vm._props = {}

  // 创建一个数组 keys，用于缓存属性的键，以便后续的属性更新可以使用数组迭代而不是动态对象键枚举。
  const keys = vm.$options._propKeys = []
  const isRoot = !vm.$parent

  if (!isRoot) {
    // 非根组件时为子组件，它的属性通常由父组件传递而来。
    // 由于父组件已经负责观测这些属性的变化并进行相应的更新，因此在子组件中再次观测这些属性可能会导致重复的触发和更新。
    toggleObserving(false)
  }
  for (const key in propsOptions) {
    keys.push(key)
    const value = validateProp(key, propsOptions, propsData, vm)

    // 定义响应式
    defineReactive(props, key, value)
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
```

首先获取组件的 `propsData`，这是通过 `vm.$options.propsData` 获取的，用于存储传递给组件的 props 数据。

然后创建一个空对象 `props`，并将其赋值给 `vm._props` 属性，用于存储解析后的 props 数据。

接着创建一个空数组 `keys`，用于缓存属性的键，以便后续的属性更新可以使用数组迭代而不是动态对象键枚举。同时，将 `keys` 数组赋值给 `vm.$options._propKeys` 属性，以便在后续操作中可以访问这些属性键。

然后判断当前组件是否为根组件，如果不是根组件，则通过 `toggleObserving(false)` 禁止观察属性的变化。这是因为非根组件的属性通常由父组件传递而来，并且父组件已经负责观测这些属性的变化，所以在子组件中再次观测这些属性可能会导致重复的触发和更新。

接下来，使用 `for...in` 循环遍历 `propsOptions` 对象的属性，即组件的 props 配置。

对于每个属性，将其键存入 `keys` 数组中，并使用 `validateProp` 函数解析属性的值。然后，使用 `defineReactive` 函数将属性定义为响应式属性，使其能够触发依赖更新。

最后，通过 `proxy` 函数将属性代理到组件实例的 `_props` 对象上，这样就可以通过组件实例直接访问和修改 props 数据。

最后，通过 `toggleObserving(true)` 开启属性观察，确保在根组件中可以观察和更新属性的变化。

## initMethods

`initMethods` 用于初始化组件的 methods。

```js
function initMethods (vm: Component, methods: Object) {
  const props = vm.$options.props
  for (const key in methods) {
    vm[key] = methods[key] == null ? noop : bind(methods[key], vm)
  }
}
```

可以看到实现非常简单，首先获取组件的 `props`，这是通过 `vm.$options.props` 获取的，用于判断是否存在同名的方法与 props 冲突。

然后，使用 `for...in` 循环遍历 `methods` 对象的属性，即组件的方法。

对于每个方法，判断其值是否为 `null` 或 `undefined`。如果是，则将方法赋值为 `noop`，否则使用 `bind` 函数将方法绑定到组件实例 `vm` 上，确保方法在调用时具有正确的上下文（`this` 指向组件实例）。

最后，将方法赋值给组件实例的相应属性名，使其在组件中可以直接使用。

## initData

`initData` 用于初始化组件的数据对象 `data`。它处理 `data` 的获取和验证，将属性代理到组件实例上，并为数据对象创建观察者，使其成为响应式对象。

```js
function initData (vm: Component) {
  let data = vm.$options.data
  data = vm._data = typeof data === 'function'
    // 如果是function，则绑定this，获取实际的数据对象
    ? getData(data, vm)
    : data || {}
  if (!isPlainObject(data)) {
    // 如果data是普通对象
    data = {}
  }
  // proxy data on instance
  const keys = Object.keys(data)
  let i = keys.length
  while (i--) {
    const key = keys[i]
    if (!isReserved(key)) {
      // 避免使用以 $ 或 _ 开头的变量名。避免与 Vue 内部的属性或方法发生命名冲突
      proxy(vm, `_data`, key)
    }
  }
  // observe data
  // 为data创建观察者
  observe(data, true /* asRootData */)
}
```

首先，从组件的配置项 `vm.$options.data` 中获取数据对象 `data`。如果 `data` 是一个函数，则调用 `getData` 函数并将组件实例作为参数传入，获取实际的数据对象。如果 `data` 不是函数，则直接使用它，或者如果不存在则赋值为空对象 `{}`。

接下来，检查 `data` 是否为一个普通对象，如果不是，则将其赋值为空对象 `{}`，以确保 `data` 是一个纯粹的对象。

然后，使用 `Object.keys` 获取 `data` 对象的所有属性名，并通过 `while` 循环遍历这些属性名。

对于每个属性名 `key`，首先检查它是否不是 Vue 内部保留的属性名，即不是以 `$` 或 `_` 开头的属性名。如果不是保留属性名，则使用 `proxy` 函数将属性代理到组件实例的 `_data` 对象上，实现对数据的访问代理。

最后，调用 `observe` 函数为 `data` 对象创建观察者，将其转化为响应式对象。传入参数 `true` 表示将其标记为根数据对象。

## initComputed

`initComputed` 函数用于初始化组件的计算属性。它遍历计算属性对象，提取计算属性的 getter 函数，并调用 `defineComputed` 函数进行计算属性的定义和双向绑定。

```js
function initComputed (vm: Component, computed: Object) {
  const watchers = vm._computedWatchers = Object.create(null)

  for (const key in computed) {
    const userDef = computed[key]
    // 如果是函数，说明是函数形式的计算逻辑
    // 如果不是函数，则可能是{get,set}的形式， get 方法表示计算属性的获取逻辑，而 set 方法表示计算属性的设置逻辑。
    const getter = typeof userDef === 'function' ? userDef : userDef.get

    // 组件定义的计算属性已经在组件原型。我们只需要在这里实例化已定义的计算属性。
    if (!(key in vm)) {
      // 将component 每项由 函数形式改为{get,set}形式，并进行双向绑定
      defineComputed(vm, key, userDef)
    }
  }
}
```

首先，创建一个空对象 `watchers`，用于存储计算属性的观察者对象。

然后，通过 `for...in` 循环遍历 `computed` 对象的属性。对于每个属性 `key`，获取对应的用户定义对象 `userDef`。

如果 `userDef` 是一个函数，则将其作为计算属性的 getter 函数。

接下来，检查属性名 `key` 是否存在于组件实例 `vm` 中。如果不存在，则调用 `defineComputed` 函数，将计算属性的相关定义传入，进行计算属性的定义和双向绑定。

## initWatch

`initWatch` 函数用于初始化组件的观察者。它遍历观察者对象，根据处理函数的类型创建相应的观察者，并将其添加到组件实例的观察者列表中。

```js
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
```

对于每个属性 `key`，获取对应的处理函数（handler）。如果处理函数是一个数组，则表示存在多个观察者，需要遍历数组，并为每个处理函数创建一个观察者。

调用 `createWatcher` 函数，传入组件实例 `vm`、属性名 `key` 和处理函数 `handler`，用于创建观察者。

## 总结

`initState` 是初始化组件props、methods、data、computed 和 watch状态的函数。

用户在实例化 Vue.is 时使用了哪些状态，哪些状态就需要被初始化，没有用到的状态则不用初始化。例如，用户只使用了 data，那么只需要初始化 data 即可。

初始化的顺序也是有考量的。先初始化 props，后初始化data，这样就可以在 data 中使用 props 中的数据了。在 watch 中既可以观察 props，也可以观察 data，因为它是最后被初始化的。
