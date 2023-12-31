/* @flow */

import { ASSET_TYPES } from 'shared/constants'
import { defineComputed, proxy } from '../instance/state'
import { extend, mergeOptions, validateComponentName } from '../util/index'

export function initExtend (Vue: GlobalAPI) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  Vue.cid = 0
  let cid = 1

  /**
   * Class inheritance
   */
  Vue.extend = function (extendOptions: Object): Function {
    // 初始化用户传入的参数
    extendOptions = extendOptions || {}
    // 指向父类
    const Super = this
    // 父类cid
    const SuperId = Super.cid
    // 获取缓存项
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
    // 如果父类已经创建过子类，直接使用缓存
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }
    // 获取name，初始化没设置，就使用父类的
    const name = extendOptions.name || Super.options.name
    if (process.env.NODE_ENV !== 'production' && name) {
      validateComponentName(name)
    }

    // 创建子类Sub
    const Sub = function VueComponent (options) {
      // 调用原型上的_init
      this._init(options)
    }
    // 继承父类原型方法
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub
    // 添加子类唯一标识
    Sub.cid = cid++
    // 合并父类和子类选项并设置为子类选项
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    )
    // 将父类存到子类的super字段中
    Sub['super'] = Super

    // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.
    // 初始化props
    if (Sub.options.props) {
      initProps(Sub)
    }
    // 初始化computed
    if (Sub.options.computed) {
      initComputed(Sub)
    }

    // allow further extension/mixin/plugin usage
    // 复制父类的extend/mixin/use
    Sub.extend = Super.extend
    Sub.mixin = Super.mixin
    Sub.use = Super.use

    // create asset registers, so extended classes
    // can have their private assets too.
    // 复制父类的'component','directive', 'filter'
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type]
    })
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub
    }

    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    // 定义子类特殊的属性
    Sub.superOptions = Super.options
    Sub.extendOptions = extendOptions
    Sub.sealedOptions = extend({}, Sub.options)

    // cache constructor
    // 将初始化完毕的子类加入到缓存中
    cachedCtors[SuperId] = Sub
    return Sub
  }
}

function initProps (Comp) {
  const props = Comp.options.props
  // 将key代理到_props
  for (const key in props) {
    proxy(Comp.prototype, `_props`, key)
  }
}

function initComputed (Comp) {
  const computed = Comp.options.computed
  // 遍历computed，重新定义一遍
  for (const key in computed) {
    defineComputed(Comp.prototype, key, computed[key])
  }
}
