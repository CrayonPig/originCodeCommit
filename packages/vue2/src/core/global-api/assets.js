/* @flow */

import { ASSET_TYPES } from 'shared/constants'
import { isPlainObject, validateComponentName } from '../util/index'

export function initAssetRegisters (Vue: GlobalAPI) {
  /**
   * Create asset registration methods.
   */
  ASSET_TYPES.forEach(type => {
    Vue[type] = function (
      id: string,
      definition: Function | Object
    ): Function | Object | void {
      // 不传入定义，则为getter，返回存储的定义
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production' && type === 'component') {
          validateComponentName(id)
        }
        // 如果是component，并且definition是个对象，则调用Vue.extend初始化为Vue子类
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = definition.name || id
          definition = this.options._base.extend(definition)
        }
        // 如果是directive，并且definition是个函数
        if (type === 'directive' && typeof definition === 'function') {
          // 默认监听bind和update事件
          definition = { bind: definition, update: definition }
        }
        // 存储定义
        this.options[type + 's'][id] = definition
        return definition
      }
    }
  })
}
