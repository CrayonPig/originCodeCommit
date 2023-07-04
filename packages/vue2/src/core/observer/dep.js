/* @flow */

import type Watcher from './watcher'
import { remove } from '../util/index'

let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
export default class Dep {
  static target: ?Watcher; // 当前正在计算的依赖项
  id: number; // 依赖项的唯一标识
  subs: Array<Watcher>; // 订阅该依赖项的 Watcher 实例数组

  constructor() {
    this.id = uid++; // 分配唯一的依赖项标识
    this.subs = []; // 初始化订阅数组
  }

  // 添加 Watcher 实例到订阅数组中
  addSub(sub: Watcher) {
    this.subs.push(sub); 
  }

  // 从订阅数组中移除指定的 Watcher 实例
  removeSub(sub: Watcher) {
    remove(this.subs, sub); 
  }

  depend() {
    if (Dep.target) {
      // 将当前依赖项添加到当前正在计算的 Watcher 实例的依赖项列表中
      Dep.target.addDep(this); 
    }
  }

  notify() {
    // 复制订阅数组
    const subs = this.subs.slice(); 
    // 循环遍历订阅数组，调用每个 Watcher 实例的 update 方法
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update();
    }
  }
}


// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
Dep.target = null
const targetStack = []

export function pushTarget (_target: ?Watcher) {
  if (Dep.target) targetStack.push(Dep.target)
  Dep.target = _target
}

export function popTarget () {
  Dep.target = targetStack.pop()
}
