# 初始化 Modules

我们先了解下`modules`的定义：

由于使用单一状态树，应用的所有状态会集中到一个比较大的对象。当应用变得非常复杂时，`store` 对象就有可能变得相当臃肿。

为了解决以上问题，Vuex 允许我们将 `store` 分割成模块（module）。每个模块拥有自己的 `state`、`mutation`、`action`、`getter`、甚至是嵌套子模块——从上至下进行同样方式的分割：

```js
const moduleA = {
  state: () => ({ ... }),
  mutations: { ... },
  actions: { ... },
  getters: { ... }
}

const moduleB = {
  state: () => ({ ... }),
  mutations: { ... },
  actions: { ... }
}

const store = new Vuex.Store({
  modules: {
    a: moduleA,
    b: moduleB
  }
})

store.state.a // -> moduleA 的状态
store.state.b // -> moduleB 的状态
```

从上述描述中，我们可以发现，`modules`的设计实际上就是一个树形结构，`store` 本身就是一个根节点，可以视作`root module`，它下面的 `modules` 就是子模块，Vuex 需要完成这颗树的构建，构建过程的入口就是：

```js
// src/store.js
this._modules = new ModuleCollection(options)
```

`ModuleCollection` 的定义在 `src/module/module-collection.js` 中：

```js
export default class ModuleCollection {
  constructor (rawRootModule) {
    // 注册根模块（对应 Vuex.Store 的选项）
    this.register([], rawRootModule, false)
  }

  // 根据路径获取模块
  get (path) {
    return path.reduce((module, key) => {
      return module.getChild(key)
    }, this.root)
  }

  // 根据路径获取模块的命名空间
  getNamespace (path) {
    let module = this.root
    return path.reduce((namespace, key) => {
      module = module.getChild(key)
      return namespace + (module.namespaced ? key + '/' : '')
    }, '')
  }

  // 更新根模块
  update (rawRootModule) {
    update([], this.root, rawRootModule)
  }

  // 注册模块
  register (path, rawModule, runtime = true) {
    if (__DEV__) {
      assertRawModule(path, rawModule)
    }

    const newModule = new Module(rawModule, runtime)
    if (path.length === 0) {
      this.root = newModule
    } else {
      const parent = this.get(path.slice(0, -1))
      parent.addChild(path[path.length - 1], newModule)
    }

    // 注册嵌套模块
    if (rawModule.modules) {
      forEachValue(rawModule.modules, (rawChildModule, key) => {
        this.register(path.concat(key), rawChildModule, runtime)
      })
    }
  }

  // 取消注册模块
  unregister (path) {
    const parent = this.get(path.slice(0, -1))
    const key = path[path.length - 1]
    const child = parent.getChild(key)

    if (!child) {
      if (__DEV__) {
        console.warn(
          `[vuex] trying to unregister module '${key}', which is ` +
          `not registered`
        )
      }
      return
    }

    if (!child.runtime) {
      return
    }

    parent.removeChild(key)
  }

  // 检查模块是否已注册
  isRegistered (path) {
    const parent = this.get(path.slice(0, -1))
    const key = path[path.length - 1]

    if (parent) {
      return parent.hasChild(key)
    }

    return false
  }
}
```

从上述代码中可以看出`ModuleCollection`的实例化的过程就是递归调用`register`的过程。

`register` 方法接受三个参数：`path`、`rawModule` 和 `runtime`。

- `path` 是一个数组，表示模块在状态树中的路径。
- `rawModule` 是一个原始的模块对象，包含了模块的状态、`mutations`、`actions` 等信息。
- `runtime` 是一个布尔值，默认为 `true`，表示是否在运行时注册模块。

`register` 通过 `new Module(rawModule, runtime)` 创建一个新的模块实例 `newModule`

我们接下来先去看`Module`类的定义

```js
// src/module/module.js
import { forEachValue } from '../util'

// Base data struct for store's module, package with some attribute and method
export default class Module {
  constructor (rawModule, runtime) {
    this.runtime = runtime
    // 存储子模块的容器
    this._children = Object.create(null)
    // 存储传入的程序员定义的原始模块对象
    this._rawModule = rawModule
    const rawState = rawModule.state

    // 存储原始模块的状态
    // 如果原始模块的 state 是一个函数，则调用该函数以获取初始状态，否则使用 state 的值或者一个空对象
    this.state = (typeof rawState === 'function' ? rawState() : rawState) || {}
  }

  // 获取是否启用命名空间
  get namespaced () {
    return !!this._rawModule.namespaced
  }

  // 添加子模块
  addChild (key, module) {
    this._children[key] = module
  }

  // 移除指定子模块
  removeChild (key) {
    delete this._children[key]
  }

  // 获取指定子模块
  getChild (key) {
    return this._children[key]
  }

  // 检查是否存在指定子模块
  hasChild (key) {
    return key in this._children
  }

  // 更新模块的信息
  update (rawModule) {
    this._rawModule.namespaced = rawModule.namespaced
    if (rawModule.actions) {
      this._rawModule.actions = rawModule.actions
    }
    if (rawModule.mutations) {
      this._rawModule.mutations = rawModule.mutations
    }
    if (rawModule.getters) {
      this._rawModule.getters = rawModule.getters
    }
  }

  // 遍历子模块，对每个子模块执行指定的回调函数
  forEachChild (fn) {
    forEachValue(this._children, fn)
  }

  // 遍历 getters，对每个 getter 执行指定的回调函数
  forEachGetter (fn) {
    if (this._rawModule.getters) {
      forEachValue(this._rawModule.getters, fn)
    }
  }

  // 遍历 actions，对每个 action 执行指定的回调函数
  forEachAction (fn) {
    if (this._rawModule.actions) {
      forEachValue(this._rawModule.actions, fn)
    }
  }

  // 遍历 mutations，对每个 mutation 执行指定的回调函数
  forEachMutation (fn) {
    if (this._rawModule.mutations) {
      forEachValue(this._rawModule.mutations, fn)
    }
  }
}
```

`Module` 类是用于表示 Vuex 模块的基础数据结构，其实例包含了模块的状态、`mutations`、`actions`、`getters`等信息。

在 `Module`的构造函数中， `constructor(rawModule, runtime)`接受两个参数，`rawModule` 是程序员定义的原始模块对象，`runtime` 是一个布尔值，表示是否在运行时创建模块。

由此可见创建一个新的模块实例时，会初始化一些属性：

- `this.runtime`：存储是否是运行时创建的标志。
- `this._children`：一个对象，用于存储子模块。
- `this._rawModule`：存储传入的程序员定义的原始模块对象。
- `this.state`：存储原始模块的状态。如果原始模块的 state 是一个函数，则调用该函数以获取初始状态，否则使用 state 的值或者一个空对象。

然后，`Module` 类还提供了一些方法，如 `addChild`、`getChild`、`hasChild`、`update`、`forEachChild`、`forEachGetter`、`forEachAction`、`forEachMutation`，用于操作模块的子模块、获取子模块、检查是否存在子模块、更新模块的信息、遍历子模块、遍历 `getters`、遍历 `actions`、遍历 `mutations`。

此时再回到`register` 方法，我们可以梳理出逻辑如下：

1. 通过 `new Module(rawModule, runtime)` 创建一个新的模块实例 `newModule`，该实例包含了模块的各种信息。

2. 如果 `path.length === 0`，说明是根模块，将 `this.root` 设置为新创建的模块实例，否则将新模块添加为父模块的子模块。

3. 接下来，如果 `rawModule.modules` 存在，表示该模块包含嵌套模块，通过 `forEachValue` 遍历 `rawModule.modules`，递归调用 `this.register` 方法注册嵌套模块。这样可以实现模块的嵌套注册，构建起完整的模块树。
