# 初始化阶段(合并属性)

`_init`代码执行中，首先会对传入的`options` 进行操作

```js
if (options && options._isComponent) {
  initInternalComponent(vm, options)
} else {
  vm.$options = mergeOptions(
    resolveConstructorOptions(vm.constructor),
    options || {},
    vm
  )
}
```

首先判断 `options` 是否存在并且是否存在 `_isComponent` 属性，`_isComponent` 是Vue的私有属性，用于区分组件实例和根实例。所以在我们探究 `new Vue` 时，逻辑判断走的是else，这段代码相当于

```js
vm.$options = mergeOptions(
  resolveConstructorOptions(vm.constructor),
  options || {},
  vm
)
```

## resolveConstructorOptions

这里将`vm.constructor`，也就是`Vue.constructor`传入 `resolveConstructorOptions` 函数获取返回值，该代码同样位于 `src/core/instance/init.js`

```js
export function resolveConstructorOptions (Ctor: Class<Component>) {
  let options = Ctor.options
  if (Ctor.super) {
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      Ctor.superOptions = superOptions
      const modifiedOptions = resolveModifiedOptions(Ctor)
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}
```

`resolveConstructorOptions` 函数接受一个参数Ctor，表示构造函数。 并判断构造函数是否有super属性来确定该构造函数是否是一个Vue子类（继承自Vue），如果不是，则直接获取构造函数的原型上的options属性作为选项。很明显在`new Vue`时，`resolveConstructorOptions(vm.constructor)` 返回的就是 `Vue.options`。

那么 `Vue.options` 是什么呢，其实在 `src/core/index.js` 中的 `initGlobalAPI(Vue)` 我们就已经提前定义过这个值，`initGlobalAPI(Vue)`代码在
`src/core/global-api/index.js` 中

```js
export function initGlobalAPI (Vue: GlobalAPI) {
  // ...
  Vue.options = Object.create(null)

  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

  extend(Vue.options.components, builtInComponents)
  // ...
}
```

首先通过 `Vue.options = Object.create(null)` 创建一个空对象，然后遍历 `ASSET_TYPES`，`ASSET_TYPES` 的定义在 `src/shared/constants.js` 中：

```js
export const ASSET_TYPES = [
  'component',
  'directive',
  'filter'
]
```

所以上面遍历 ASSET_TYPES 后的代码相当于：

```js
Vue.options.components = {}
Vue.options.directives = {}
Vue.options.filters = {}
```

最后通过 `extend(Vue.options.components, builtInComponents)` 把一些内置组件扩展到 `Vue.options.components` 上，Vue 的内置组件目前 有`<keep-alive>`、`<transition>` 和`<transition-group>` 组件，这也就是为什么我们在其它组件中使用这些组件不需要注册的原因。

## mergeOptions

搞清楚`resolveConstructorOptions`后，我们再看之前的函数就可以转换为

```js
vm.$options = mergeOptions(
  Vue.options,
  options || {},
  vm
)
```

我们再去分析`mergeOptions`的实现，代码在 `src/core/util/options.js`

```js
/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 * @param {Object} parent - 父选项对象
 * @param {Object} child - 子选项对象
 * @param {Component} [vm] - 组件实例对象（可选）
 * @returns {Object} - 合并后的选项对象
 */

export function mergeOptions (
  parent: Object,
  child: Object,
  vm?: Component
): Object {
  if (typeof child === 'function') {
    child = child.options
  }

  // 规范化 props
  normalizeProps(child, vm)

  // 规范化 inject
  normalizeInject(child, vm)

  // 规范化 directives
  normalizeDirectives(child)

  // 处理继承
  const extendsFrom = child.extends
  if (extendsFrom) {
    parent = mergeOptions(parent, extendsFrom, vm)
  }

  // 处理混入
  if (child.mixins) {
    for (let i = 0, l = child.mixins.length; i < l; i++) {
      parent = mergeOptions(parent, child.mixins[i], vm)
    }
  }

  // 创建一个空对象，用于保存合并后的选项
  const options = {}

  // 遍历父选项的属性
  let key
  for (key in parent) {
    mergeField(key)
  }

  // 遍历子选项的属性
  for (key in child) {
    // 父属性中不存在再添加
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }

  // 使用策略模式合并字段
  function mergeField (key) {
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }

  // 返回合并后的选项对象
  return options
}
```

如果 `child`是函数，则获取其`options`，然后将`props`、`inject`, `directives`的写法统一转换，将其规范化，方便后续的使用。再递归把`extends`和`mixins`合并到`parent`上

```js
// 处理继承
const extendsFrom = child.extends
if (extendsFrom) {
  parent = mergeOptions(parent, extendsFrom, vm)
}

// 处理混入
if (child.mixins) {
  for (let i = 0, l = child.mixins.length; i < l; i++) {
    parent = mergeOptions(parent, child.mixins[i], vm)
  }
}
```

然后创建一个空对象`options`，遍历`parent`，把`parent`中的每一项通过调用 `mergeField`函数合并到空对象`options`里，最后返回`options`

```js
// 创建一个空对象，用于保存合并后的选项
const options = {}

// 遍历父选项的属性
let key
for (key in parent) {
  mergeField(key)
}

// 遍历子选项的属性
for (key in child) {
  // 父属性中不存在再添加
  if (!hasOwn(parent, key)) {
    mergeField(key)
  }
}

// 使用策略模式合并字段
function mergeField (key) {
  const strat = strats[key] || defaultStrat
  options[key] = strat(parent[key], child[key], vm, key)
}

// 返回合并后的选项对象
return options
```

了解完属性合并的整体逻辑后，接下来我们详细分析每个步骤具体都做了什么

### normalizeProps

代码路径在`src/core/util/options.js`

```js
function normalizeProps (options: Object, vm: ?Component) {
  // 输出props格式为propB: {
  //    type: String,
  //    ...
  //  }
  const props = options.props
  if (!props) return
  const res = {}
  let i, val, name
  // 对应props: ['propA', 'propB']
  if (Array.isArray(props)) {
    i = props.length
    while (i--) {
      val = props[i]
      if (typeof val === 'string') {
        // 将名字变为驼峰
        name = camelize(val)
        res[name] = { type: null }
      } else if (process.env.NODE_ENV !== 'production') {
        warn('props must be strings when using array syntax.')
      }
    }
  } else if (isPlainObject(props)) {
    // 对应写法：props: {
    //   propA: Number,
    //   propB: {
    //    type: String,
    //    required: true
    //  },
    //  propC: {
    //    type: [String, Number],
    //    default: 'default value'
    //  }
    // }
    for (const key in props) {
      val = props[key]
      name = camelize(key)
      res[name] = isPlainObject(val)
        ? val
        : { type: val }
    }
  } else if (process.env.NODE_ENV !== 'production') {
    warn(
      `Invalid value for option "props": expected an Array or an Object, ` +
      `but got ${toRawType(props)}.`,
      vm
    )
  }
  options.props = res
}
```

这段代码不难理解，就是将我们平时写props的多种写法

```js
// 数组语法
props: ['propA', 'propB'],
// 对象语法
props: {
  propA: Number,
  propB: {
    type: String,
    required: true
  },
  propC: {
    type: [String, Number],
    default: 'default value'
  }
},
```

转换为标准的对象写法

```js
propB: {
  type: String,
  // ...
}
```

### normalizeInject

代码路径在`src/core/util/options.js`

```js
/**
 * Normalize all injections into Object-based format
 */
function normalizeInject (options: Object, vm: ?Component) {
  // 输出格式 dependencyB: {
  //   from: 'propB',
  //   ...
  // }
  const inject = options.inject
  if (!inject) return
  const normalized = options.inject = {}
  if (Array.isArray(inject)) {
  // 对应写法 inject: ['sharedData'],
    for (let i = 0; i < inject.length; i++) {
      normalized[inject[i]] = { from: inject[i] }
    }
  } else if (isPlainObject(inject)) {
    // 对应对象写法 inject: {
    //   dependencyA: 'propA',
    //   dependencyB: {
    //    from: 'propA',
    //    default: 'default value'
    //  }
    // }
    for (const key in inject) {
      const val = inject[key]
      normalized[key] = isPlainObject(val)
        ? extend({ from: key }, val)
        : { from: val }
    }
  } else if (process.env.NODE_ENV !== 'production') {
    warn(
      `Invalid value for option "inject": expected an Array or an Object, ` +
      `but got ${toRawType(inject)}.`,
      vm
    )
  }
}
```

同样的，`inject` 也将多种写法进行转换

```js
// 字符串写法
inject: ['dependencyA', 'dependencyB']

// 对象写法
inject: {
  dependencyA: 'propA',
  dependencyB: 'propB'
}

// 带有默认值的对象写法：
inject: {
  dependencyA: {
    from: 'propA',
    default: 'default value'
  },
  dependencyB: {
    from: 'propB',
    default: () => 'default value'
  }
}
```

转换为标准的对象写法

```js
dependencyB: {
  from: 'propB',
  // ...
}
```

### normalizeDirectives

代码路径在`src/core/util/options.js`

```js
/**
 * Normalize raw function directives into object format.
 * 将指令格式  Vue.directive('directiveName', function(el, binding, vnode, oldVnode) {
 *      // 指令的操作
 *    });
 * 转为 Vue.directive('directiveName', {
 *      bind(el, binding, vnode) {
 *       // 指令绑定时的操作
 *      },
 *      update(el, binding, vnode) {
 *       // 指令绑定时的操作
 *      },
 *    });
 */
function normalizeDirectives (options: Object) {
  const dirs = options.directives
  if (dirs) {
    for (const key in dirs) {
      const def = dirs[key]
      if (typeof def === 'function') {
        dirs[key] = { bind: def, update: def }
      }
    }
  }
}
```

这个代码较简单，如果指令直接定义了一个函数，就将其转换为`{ bind: def, update: def }`形式，默认`bind`和`update`都执行一个方法

```js
Vue.directive('directiveName', function(el, binding, vnode, oldVnode) {
  // 指令的操作
});

// 转换为
Vue.directive('directiveName', {
  bind(el, binding, vnode) {
    // 指令绑定时的操作
  },
  update(el, binding, vnode) {
    // 指令绑定时的操作
  },
});
```

## mergeField

`mergeField` 函数非常有意思，它不是简单的合并了两个对象，而是根据不同的选项有不同的合并策略

```js
// 使用策略模式合并字段
function mergeField (key) {
  const strat = strats[key] || defaultStrat
  options[key] = strat(parent[key], child[key], vm, key)
}
```

我们可以先找到对于`strats`的定义，代码仍然在`src/core/util/options.js`

```js
const strats = config.optionMergeStrategies
```

先使用`Object.create(null)` 定义了一个空对象，这是 Vue 常用的定义方式

::: tip 为什么Vue中使用`Object.create(null)` 定义空对象？
使用 `Object.create(null)` 可以创建一个没有原型链的对象，它不会继承 `Object.prototype` 上的属性或方法，也不会继承其他原型链上的属性和方法。减少潜在问题的发生，例如在遍历对象属性时需要额外的判断或处理，或者在使用对象作为 Map 的键时可能发生意外的键冲突。
:::

### data 合并策略

`data`的合并策略比较简单，只是利用`vm`判断是否在组件定义阶段合并，并且`childVal`不是函数，返回`parentVal`否则，将`parentVal`和`childVal`合并。`mergeDataOrFn`函数后续单独介绍（`provide`合并策略）

```js
strats.data = function (
  parentVal: any,
  childVal: any,
  vm?: Component
): ?Function {
  if (!vm) {
    // 如果不存在 vm，则表示在组件定义阶段进行合并
    if (childVal && typeof childVal !== 'function') {
      return parentVal
    }
    // 合并parentVal和childVal
    return mergeDataOrFn(parentVal, childVal)
  }

  // 合并parentVal和childVal
  return mergeDataOrFn(parentVal, childVal, vm)
}
```

### 生命周期钩子函数的合并策略

生命周期钩子函数的合并策略是将子组件的钩子函数或钩子函数数组与父组件的钩子函数数组合并，并返回合并后的数组

```js
/**
 * 合并钩子函数
 * @param {?Array<Function>} parentVal 父组件的钩子函数数组
 * @param {?Function|?Array<Function>} childVal 子组件的钩子函数或钩子函数数组
 * @returns {?Array<Function>} 合并后的钩子函数数组
 */
function mergeHook (
  parentVal: ?Array<Function>,
  childVal: ?Function | ?Array<Function>
): ?Array<Function> {
  return childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : Array.isArray(childVal)
        ? childVal
        : [childVal]
    : parentVal
}

LIFECYCLE_HOOKS.forEach(hook => {
  strats[hook] = mergeHook
})
```

这其中的 `LIFECYCLE_HOOKS` 的定义在 `src/shared/constants.js` 中：

```js
export const LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
  'activated',
  'deactivated',
  'errorCaptured'
]
```

这里定义了所有钩子函数名称，所以对于钩子函数的合并策略都是 `mergeHook` 函数。`mergeHook` 函数的实现用了一个多层嵌套的三元运算符，如果嵌套太深不好理解的话我们可以将其展开，如下：

```js
function mergeHook (parentVal, childVal):  {
 if (childVal) {
   if (parentVal) {
     return parentVal.concat(childVal)
   } else {
     if (Array.isArray(childVal)) {
       return childVal
     } else {
       return [childVal]
     }
   }
 } else {
   return parentVal
 }
}
```

合并策略如下：

- 如果子组件的钩子函数 childVal 存在：
  - 如果父组件的钩子函数数组 parentVal 存在，则将子组件的钩子函数或钩子函数数组与父组件的钩子函数数组合并，并返回合并后的数组。
  - 如果父组件的钩子函数数组 parentVal 不存在：
    - 如果子组件的钩子函数 childVal 是一个数组，则直接返回子组件的钩子函数数组。
    - 如果子组件的钩子函数 childVal 不是一个数组，则将其放入一个新数组中，并返回该数组。
- 如果子组件的钩子函数 childVal 不存在，则返回父组件的钩子函数数组 parentVal。
  
最后，通过遍历生命周期钩子数组 `LIFECYCLE_HOOKS`，将 `mergeHook` 函数作为合并策略函数应用于每个生命周期钩子，并存储在 `strats` 对象中。

::: tip 为什么要把相同的钩子函数转换成数组呢？
这是因为Vue允许用户使用`Vue.mixin`方法向实例混入自定义行为，Vue的一些插件通常都是这么做的。所以当`Vue.mixin`和用户在实例化Vue时，如果设置了同一个钩子函数，那么在触发钩子函数时，就需要同时触发这个两个函数，所以转换成数组就是为了能在同一个生命周期钩子列表中保存多个钩子函数。
:::

### 合并资源对象

在 Vue 中，`component`、`directive` 和 `filter` 都是被称为资源。合并策略是`childVal`合并到`parentVal`，相同则覆盖

```js
/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 * 合并资源对象
 * @param {?Object} parentVal 父组件的资源对象
 * @param {?Object} childVal 子组件的资源对象
 * @param {Component} vm 组件实例
 * @param {string} key 资源类型键名
 * @returns {Object} 合并后的资源对象
 */
function mergeAssets (
  parentVal: ?Object,
  childVal: ?Object,
  vm?: Component,
  key: string
): Object {
  const res = Object.create(parentVal || null)
  if (childVal) {
    return extend(res, childVal)
  } else {
    return res
  }
}

ASSET_TYPES.forEach(function (type) {
  strats[type + 's'] = mergeAssets
})
```

这其中的 `ASSET_TYPES` 的定义在 `src/shared/constants.js` 中：

```js
export const ASSET_TYPES = [
  'component',
  'directive',
  'filter'
]
```


- 首先，使用 `Object.create(parentVal || null)` 创建一个新的对象 `res`，该对象的原型是父组件的资源对象 `parentVal`，如果 `parentVal` 不存在，则原型为 `null`。
- 如果子组件的资源对象 `childVal` 存在：
  - 使用 `extend` 函数将子组件的资源对象 `childVal` 合并到 `res` 中，并返回合并后的结果。
- 如果子组件的资源对象 `childVal` 不存在，则直接返回 `res`。

### watcher合并策略

`watcher` 合并策略是将父子组件的`watch`对象合并为一个数组，互相不覆盖

```js
/**
 * Watchers.
 *
 * Watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 * Watchers 不能被覆盖，所以合并为数组
 * @param {?Object} parentVal 父组件的 watch 对象
 * @param {?Object} childVal 子组件的 watch 对象
 * @param {Component} vm 组件实例
 * @param {string} key watch 对象的键名
 * @returns {?Object} 合并后的 watch 对象
 */
strats.watch = function (
  parentVal: ?Object,
  childVal: ?Object,
  vm?: Component,
  key: string
): ?Object {
  if (!childVal) return Object.create(parentVal || null)

  if (!parentVal) return childVal

  const ret = {}

  extend(ret, parentVal)

  for (const key in childVal) {
    let parent = ret[key]
    const child = childVal[key]
    if (parent && !Array.isArray(parent)) {
      parent = [parent]
    }
    ret[key] = parent
      ? parent.concat(child)
      : Array.isArray(child) ? child : [child]
  }
  return ret
}
```

- 创建一个新的对象 `ret`，并将父组件的 watch 对象 `parentVal` 扩展到 `ret` 中。
- 遍历子组件的 watch 对象 `childVal` 中的每个键，对于每个键，将父组件的值和子组件的值合并为一个数组，然后将该数组赋值给 `ret[key]`。
- 最后，返回合并后的 watch 对象 `ret`。

### props、methods、inject 和 computed 合并策略

`props`、`methods`、`inject` 和 `computed` 它们的合并策略都是将`childVal`合并到`parentVal`，相同则覆盖

```js
/**
 * 合并 props、methods、inject 和 computed 对象
 * @param {?Object} parentVal 父组件的对象
 * @param {?Object} childVal 子组件的对象
 * @param {Component} vm 组件实例
 * @param {string} key 对象的键名
 * @returns {?Object} 合并后的对象
 */
strats.props =
strats.methods =
strats.inject =
strats.computed = function (
  parentVal: ?Object,
  childVal: ?Object,
  vm?: Component,
  key: string
): ?Object {
  if (!parentVal) return childVal
  const ret = Object.create(null)
  extend(ret, parentVal)
  if (childVal) extend(ret, childVal)
  return ret
}
```

### provide 合并策略

`provide` 根据是否存在组件实例 `vm` 的情况，进行不同的合并方式。

```js
strats.provide = mergeDataOrFn
/**
 * 合并数据或函数
 * @param {*} parentVal 父值
 * @param {*} childVal 子值
 * @param {Component} vm 组件实例
 * @returns {?Function} 合并后的函数
 */
export function mergeDataOrFn (
  parentVal: any,
  childVal: any,
  vm?: Component
): ?Function {
  if (!vm) {
    // 当 vm 不存在时，表示在 Vue.extend 合并中进行合并，此时两个都应该是函数
    if (!childVal) {
      return parentVal
    }
    if (!parentVal) {
      return childVal
    }
    // 当父值和子值都存在时，
    // 我们需要返回一个函数，该函数返回
    // 两个函数的合并结果...这里不需要检查 parentVal 是否为函数
    // 因为它必须是一个函数才能通过之前的合并
    return function mergedDataFn () {
      return mergeData(
        typeof childVal === 'function' ? childVal.call(this, this) : childVal,
        typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal
      )
    }
  } else {
    // 当 vm 存在时，表示在组件实例化阶段进行合并。
    return function mergedInstanceDataFn () {
      // instance merge
      // 获取 childVal 的实例数据，如果 childVal 是一个函数，则调用它，并传入组件实例 vm。
      const instanceData = typeof childVal === 'function'
        ? childVal.call(vm, vm)
        : childVal
      // 获取 parentVal 的默认数据，如果 parentVal 是一个函数，则调用它，并传入组件实例 vm
      const defaultData = typeof parentVal === 'function'
        ? parentVal.call(vm, vm)
        : parentVal
      // 如果实例数据存在，则返回实例数据和默认数据的合并结果；否则，返回默认数据
      if (instanceData) {
        return mergeData(instanceData, defaultData)
      } else {
        return defaultData
      }
    }
  }
}
```

- 当 `vm` 不存在时，表示在 Vue.extend 合并中进行合并，此时 `parentVal` 和 `childVal` 都应该是函数。
  - 如果 `childVal` 不存在，则直接返回 `parentVal`。
  - 如果 `parentVal` 不存在，则直接返回 `childVal`。
  - 当父值和子值都存在时，返回一个函数 `mergedDataFn`，该函数在调用时会执行子值函数和父值函数，并返回它们的合并结果。
- 当 `vm` 存在时，表示在组件实例化阶段进行合并。
  - 返回一个函数 `mergedInstanceDataFn`，该函数在调用时会获取子值 `childVal` 的实例数据，如果 `childVal` 是一个函数，则调用它，并传入组件实例 `vm`。
  - 同样地，它也会获取父值 `parentVal` 的默认数据，如果 `parentVal` 是一个函数，则调用它，并传入组件实例 `vm`。
  - 最后，如果实例数据存在，则返回实例数据和默认数据的合并结果；否则，返回默认数据。

