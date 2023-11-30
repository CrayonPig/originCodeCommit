# 语法糖

我们知道 `store` 是 `Store` 对象的一个实例，它是一个原生的 Javascript 对象，我们可以在任意地方使用它们。但大部分的使用场景还是在组件中使用，那么我们之前介绍过，在 Vuex 安装阶段，它会往每一个组件实例上混入 `beforeCreate` 钩子函数，然后往组件实例上添加一个 `$store` 的实例，它指向的就是我们实例化的 `store`，因此我们可以在组件中访问到 `store` 的任何属性和方法。

比如我们在组件中访问 `state`：

```js
const Counter = {
  template: `<div>{{ count }}</div>`,
  computed: {
    count () {
      return this.$store.state.count
    }
  }
}
```

但是当一个组件需要获取多个状态时候，将这些状态都声明为计算属性会有些重复和冗余。同样这些问题也在存于 `getter`、`mutation` 和 `action`。

为了解决这个问题，Vuex 提供了一系列 `mapXXX` 辅助函数帮助我们实现在组件中可以很方便的注入 `store` 的属性和方法。

## `mapState`

我们先来看一下 `mapState` 的用法：

```js
// 在单独构建的版本中辅助函数为 Vuex.mapState
import { mapState } from 'vuex'

export default {
  // ...
  computed: mapState({
    // 箭头函数可使代码更简练
    count: state => state.count,

    // 传字符串参数 'count' 等同于 `state => state.count`
    countAlias: 'count',

    // 为了能够使用 `this` 获取局部状态，必须使用常规函数
    countPlusLocalState (state) {
      return state.count + this.localCount
    }
  })
}
```

再来看一下 `mapState` 方法的定义，在 `src/helpers.js` 中：

```js
export const mapState = normalizeNamespace((namespace, states) => {
  const res = {}
  normalizeMap(states).forEach(({ key, val }) => {
    res[key] = function mappedState () {
      let state = this.$store.state
      let getters = this.$store.getters
      if (namespace) {
        const module = getModuleByNamespace(this.$store, 'mapState', namespace)
        if (!module) {
          return
        }
        state = module.context.state
        getters = module.context.getters
      }
      return typeof val === 'function'
        ? val.call(this, state, getters)
        : state[val]
    }
    // mark vuex getter for devtools
    res[key].vuex = true
  })
  return res
})

function normalizeNamespace (fn) {
  return (namespace, map) => {
    if (typeof namespace !== 'string') {
      map = namespace
      namespace = ''
    } else if (namespace.charAt(namespace.length - 1) !== '/') {
      namespace += '/'
    }
    return fn(namespace, map)
  }
}

function normalizeMap (map) {
  return Array.isArray(map)
    ? map.map(key => ({ key, val: key }))
    : Object.keys(map).map(key => ({ key, val: map[key] }))
}
```

首先 `mapState` 是通过执行 `normalizeNamespace` 返回的函数，它接收 2 个参数，其中 `namespace` 表示命名空间，`map` 表示具体的对象，`namespace` 可不传，稍后我们来介绍 `namespace` 的作用。

当执行 `mapState(map)` 函数的时候，实际上就是执行 `normalizeNamespace` 包裹的函数，然后把 `map` 作为参数 `states` 传入。

`mapState` 最终是要构造一个对象，每个对象的元素都是一个方法，因为这个对象是要扩展到组件的 `computed` 计算属性中的。函数首先执行 `normalizeMap` 方法，把这个 `states` 变成一个数组，数组的每个元素都是 `{key, val}` 的形式。接着再遍历这个数组，以 `key` 作为对象的 `key`，值为一个 `mappedState` 的函数，在这个函数的内部，获取到 `$store.getters` 和 `$store.state`，然后再判断数组的 `val` 如果是一个函数，执行该函数，传入 `state` 和 `getters`，否则直接访问 `state[val]`。

比起一个个手动声明计算属性，`mapState` 确实要方便许多，下面我们来看一下 `namespace` 的作用。

当我们想访问一个子模块的 `state` 的时候，我们可能需要这样访问：

```js
computed: {
  mapState({
    a: state => state.some.nested.module.a,
    b: state => state.some.nested.module.b
  })
},
```

这样从写法上就很不友好，`mapState` 支持传入 `namespace`， 因此我们可以这么写：

```js
computed: {
  mapState('some/nested/module', {
    a: state => state.a,
    b: state => state.b
  })
},
```

这样看起来就清爽许多。在 `mapState` 的实现中，如果有 `namespace`，则尝试去通过 `getModuleByNamespace(this.$store, 'mapState', namespace)` 对应的 `module`，然后把 `state` 和 `getters` 修改为 `module` 对应的 `state` 和 `getters`。

```js
function getModuleByNamespace (store, helper, namespace) {
  const module = store._modulesNamespaceMap[namespace]
  if (process.env.NODE_ENV !== 'production' && !module) {
    console.error(`[vuex] module namespace not found in ${helper}(): ${namespace}`)
  }
  return module
}
```

我们在 Vuex 初始化执行 `installModule` 的过程中，初始化了这个映射表：

```js
function installModule (store, rootState, path, module, hot) {
  // ...
  const namespace = store._modules.getNamespace(path)

  // register in namespace map
  if (module.namespaced) {
    store._modulesNamespaceMap[namespace] = module
  }

  // ...
}
```

## `mapGetters`

我们先来看一下 `mapGetters` 的用法：

```js
import { mapGetters } from 'vuex'

export default {
  // ...
  computed: {
    // 使用对象展开运算符将 getter 混入 computed 对象中
    mapGetters([
      'doneTodosCount',
      'anotherGetter',
      // ...
    ])
  }
}
```

和 `mapState` 类似，`mapGetters` 是将 `store` 中的 `getter` 映射到局部计算属性，来看一下它的定义：

```js
export const mapGetters = normalizeNamespace((namespace, getters) => {
  const res = {}
  normalizeMap(getters).forEach(({ key, val }) => {
    // thie namespace has been mutate by normalizeNamespace
    val = namespace + val
    res[key] = function mappedGetter () {
      if (namespace && !getModuleByNamespace(this.$store, 'mapGetters', namespace)) {
        return
      }
      if (process.env.NODE_ENV !== 'production' && !(val in this.$store.getters)) {
        console.error(`[vuex] unknown getter: ${val}`)
        return
      }
      return this.$store.getters[val]
    }
    // mark vuex getter for devtools
    res[key].vuex = true
  })
  return res
})
```

`mapGetters` 也同样支持 `namespace`，如果不写 `namespace` ，访问一个子 `module` 的属性需要写很长的 `key`，一旦我们使用了 `namespace`，就可以方便我们的书写，每个 `mappedGetter` 的实现实际上就是取 `this.$store.getters[val]`。

## `mapMutations`

我们可以在组件中使用 `this.$store.commit('xxx')` 提交 `mutation`，或者使用 `mapMutations` 辅助函数将组件中的 `methods` 映射为 `store.commit` 的调用。

我们先来看一下 `mapMutations` 的用法：

```js
import { mapMutations } from 'vuex'

export default {
  // ...
  methods: {
    ...mapMutations([
      'increment', // 将 `this.increment()` 映射为 `this.$store.commit('increment')`

      // `mapMutations` 也支持载荷：
      'incrementBy' // 将 `this.incrementBy(amount)` 映射为 `this.$store.commit('incrementBy', amount)`
    ]),
    ...mapMutations({
      add: 'increment' // 将 `this.add()` 映射为 `this.$store.commit('increment')`
    })
  }
}
```

`mapMutations` 支持传入一个数组或者一个对象，目标都是组件中对应的 `methods` 映射为 `store.commit` 的调用。来看一下它的定义：

```js
export const mapMutations = normalizeNamespace((namespace, mutations) => {
  const res = {}
  normalizeMap(mutations).forEach(({ key, val }) => {
    res[key] = function mappedMutation (...args) {
      // Get the commit method from store
      let commit = this.$store.commit
      if (namespace) {
        const module = getModuleByNamespace(this.$store, 'mapMutations', namespace)
        if (!module) {
          return
        }
        commit = module.context.commit
      }
      return typeof val === 'function'
        ? val.apply(this, [commit].concat(args))
        : commit.apply(this.$store, [val].concat(args))
    }
  })
  return res
})
```

可以看到 `mappedMutation` 同样支持了 `namespace`，并且支持了传入额外的参数 `args`，作为提交 `mutation` 的 `payload`，最终就是执行了 `store.commit` 方法，并且这个 `commit` 会根据传入的 `namespace` 映射到对应 `module` 的 `commit` 上。

## `mapActions`

我们可以在组件中使用 `this.$store.dispatch('xxx')` 提交 `action`，或者使用 `mapActions` 辅助函数将组件中的 `methods` 映射为 `store.dispatch` 的调用。

`mapActions` 在用法上和 `mapMutations` 几乎一样，实现也很类似：

```js
export const mapActions = normalizeNamespace((namespace, actions) => {
  const res = {}
  normalizeMap(actions).forEach(({ key, val }) => {
    res[key] = function mappedAction (...args) {
      // get dispatch function from store
      let dispatch = this.$store.dispatch
      if (namespace) {
        const module = getModuleByNamespace(this.$store, 'mapActions', namespace)
        if (!module) {
          return
        }
        dispatch = module.context.dispatch
      }
      return typeof val === 'function'
        ? val.apply(this, [dispatch].concat(args))
        : dispatch.apply(this.$store, [val].concat(args))
    }
  })
  return res
})
```

和 `mapMutations` 的实现几乎一样，不同的是把 `commit` 方法换成了 `dispatch`。
