/* @flow */

import { mergeOptions } from '../util/index'

export function initMixin (Vue: GlobalAPI) {
  Vue.mixin = function (mixin: Object) {
    // 修改`Vue.options`属性进而影响之后的所有`Vue`实例
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}
