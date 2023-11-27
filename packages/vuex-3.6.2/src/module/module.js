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
