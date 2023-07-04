/* @flow */

import {
  warn,
  remove,
  isObject,
  parsePath,
  _Set as Set,
  handleError
} from '../util/index'

import { traverse } from './traverse'
import { queueWatcher } from './scheduler'
import Dep, { pushTarget, popTarget } from './dep'

import type { SimpleSet } from '../util/index'

let uid = 0

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */
export default class Watcher {
  vm: Component; // Vue 实例
  expression: string; // 监听的表达式
  cb: Function; // 回调函数
  id: number; // Watcher 的唯一标识
  deep: boolean; // 是否深度监听
  user: boolean; // 是否为用户定义的 Watcher
  computed: boolean; // 是否为计算属性的 Watcher
  sync: boolean; // 是否同步执行回调函数
  dirty: boolean; // 计算属性的值是否已过期
  active: boolean; // Watcher 是否处于活动状态
  dep: Dep; // 依赖项的 Dep 实例
  deps: Array<Dep>; // Watcher 订阅的 Dep 实例数组
  newDeps: Array<Dep>; // 最新的 Watcher 订阅的 Dep 实例数组
  depIds: SimpleSet; // Watcher 订阅的 Dep 实例的唯一标识集合
  newDepIds: SimpleSet; // 最新的 Watcher 订阅的 Dep 实例的唯一标识集合
  before: ?Function; // 在更新之前执行的钩子函数
  getter: Function; // 表达式的 getter 函数
  value: any; // Watcher 的值

  constructor(
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: ?Object,
    isRenderWatcher?: boolean
  ) {
    this.vm = vm; // Vue 实例
    if (isRenderWatcher) {
      vm._watcher = this; // 设置渲染 Watcher
    }
    vm._watchers.push(this); // 将 Watcher 添加到 Vue 实例的 Watcher 数组中

    // options
    if (options) {
      this.deep = !!options.deep; // 是否深度监听
      this.user = !!options.user; // 是否为用户定义的 Watcher
      this.computed = !!options.computed; // 是否为计算属性的 Watcher
      this.sync = !!options.sync; // 是否同步执行回调函数
      this.before = options.before; // 在更新之前执行的钩子函数
    } else {
      this.deep = this.user = this.computed = this.sync = false;
    }

    this.cb = cb; // 回调函数
    this.id = ++uid; // Watcher 的唯一标识
    this.active = true; // Watcher 是否处于活动状态
    this.dirty = this.computed; // 计算属性的值是否已过期
    this.deps = []; // Watcher 订阅的 Dep 实例数组
    this.newDeps = []; // 最新的 Watcher 订阅的 Dep 实例数组
    this.depIds = new Set(); // Watcher 订阅的 Dep 实例的唯一标识集合
    this.newDepIds = new Set(); // 最新的 Watcher 订阅的 Dep 实例的唯一标识集合
    this.expression =
      process.env.NODE_ENV !== 'production' ? expOrFn.toString() : ''; // 监听的表达式的字符串表示

    // 解析表达式，获取 getter 函数
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn;
    } else {
      this.getter = parsePath(expOrFn); // 解析路径表达式，获取对应的 getter 函数
      if (!this.getter) {
        // 如果解析失败，设置一个空的 getter 函数，并发出警告
        this.getter = function () {};
        process.env.NODE_ENV !== 'production' &&
          warn(
            `Failed watching path: "${expOrFn}" ` +
              'Watcher only accepts simple dot-delimited paths. ' +
              'For full control, use a function instead.',
            vm
          );
      }
    }

    if (this.computed) {
      this.value = undefined; // 计算属性的值
      this.dep = new Dep(); // 依赖项的 Dep 实例
    } else {
      this.value = this.get(); // 获取 Watcher 的初始值
    }
  }

  /**
   * Evaluate the getter, and re-collect dependencies.
   */
  get() {
    pushTarget(this); // 设置当前正在计算的 Watcher 实例
    let value;
    const vm = this.vm;
    try {
      value = this.getter.call(vm, vm); // 调用 getter 函数获取值
    } catch (e) {
      if (this.user) {
        handleError(e, vm, `getter for watcher "${this.expression}"`);
      } else {
        throw e;
      }
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value); // 深度遍历值，触发属性的 getter 以收集依赖
      }
      popTarget(); // 恢复之前的 Watcher 实例
      this.cleanupDeps(); // 清理无效的依赖项
    }
    return value; // 返回 Watcher 的值
  }

  /**
   * Add a dependency to this directive.
   */
  addDep(dep: Dep) {
    const id = dep.id;
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      this.newDeps.push(dep);
      if (!this.depIds.has(id)) {
        dep.addSub(this);
      }
    }
  }

  /**
   * Clean up for dependency collection.
   */
  cleanupDeps() {
    let i = this.deps.length;
    while (i--) {
      const dep = this.deps[i];
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this);
      }
    }
    let tmp = this.depIds;
    this.depIds = this.newDepIds;
    this.newDepIds = tmp;
    this.newDepIds.clear();
    tmp = this.deps;
    this.deps = this.newDeps;
    this.newDeps = tmp;
    this.newDeps.length = 0;
  }

  /**
   * Subscriber interface.
   * Will be called when a dependency changes.
   */
  update() {
    /* istanbul ignore else */
    if (this.computed) {
      // 计算属性的 Watcher 有两种模式：lazy 和 activated。
      // 默认情况下，它是以 lazy 模式初始化的，只有在至少有一个订阅者依赖于它时，才会变为 activated 模式。
      if (this.dep.subs.length === 0) {
        // 在 lazy 模式下，我们不希望在必要时执行计算，所以只需将 Watcher 标记为 dirty 即可。
        // 当访问计算属性时，实际的计算将在 this.evaluate() 中进行，这是一种即时计算。
        this.dirty = true;
      } else {
        // 在 activated 模式下，我们希望主动执行计算，但只有在值确实发生变化时才通知订阅者。
        this.getAndInvoke(() => {
          this.dep.notify();
        });
      }
    } else if (this.sync) {
      this.run(); // 同步执行回调函数
    } else {
      queueWatcher(this); // 将 Watcher 推入异步更新队列
    }
  }

  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
  run() {
    if (this.active) {
      this.getAndInvoke(this.cb); // 执行回调函数
    }
  }

  getAndInvoke(cb: Function) {
    const value = this.get(); // 获取 Watcher 的值
    if (
      value !== this.value ||
      // Deep watchers and watchers on Object/Arrays should fire even
      // when the value is the same, because the value may
      // have mutated.
      isObject(value) ||
      this.deep
    ) {
      // 设置新值
      const oldValue = this.value;
      this.value = value;
      this.dirty = false;
      if (this.user) {
        try {
          cb.call(this.vm, value, oldValue); // 执行回调函数
        } catch (e) {
          handleError(e, this.vm, `callback for watcher "${this.expression}"`);
        }
      } else {
        cb.call(this.vm, value, oldValue); // 执行回调函数
      }
    }
  }

  /**
   * Evaluate and return the value of the watcher.
   * This only gets called for computed property watchers.
   */
  evaluate() {
    if (this.dirty) {
      this.value = this.get(); // 重新获取 Watcher 的值
      this.dirty = false;
    }
    return this.value; // 返回 Watcher 的值
  }

  /**
   * Depend on this watcher. Only for computed property watchers.
   */
  depend() {
    if (this.dep && Dep.target) {
      this.dep.depend(); // 添加依赖项
    }
  }

  /**
   * Remove self from all dependencies' subscriber list.
   */
  teardown() {
    if (this.active) {
      // 从 Vue 实例的 Watcher 数组中移除自身
      // 如果 Vue 实例正在销毁，这是一个相对昂贵的操作，因此我们跳过它。
      if (!this.vm._isBeingDestroyed) {
        remove(this.vm._watchers, this);
      }
      let i = this.deps.length;
      while (i--) {
        this.deps[i].removeSub(this); // 从依赖项的订阅者列表中移除自身
      }
      this.active = false; // Watcher 不再活跃
    }
  }
}

