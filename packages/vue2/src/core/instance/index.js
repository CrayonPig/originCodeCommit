import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'
// 为什么使用构造函数
// 因为只有通过实例化this才指向实例，this instanceof Vue 才会为真，否则this将指向window

// 为什么构造函数不使用Class？
// 1. Vue2最早开始时浏览器对Class支持不完善，需兼容
// 2. class关键字创建的函数不能通过call,bind,apply改变this指向，function可以
// 3. function 可以使用prototype拓展
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 调用原型上的_init方法
  this._init(options)
}
// 初始化
initMixin(Vue)
// 挂载$data、$props、$set、$delete、$watch方法
stateMixin(Vue)
// vue内部实现发布订阅模式
eventsMixin(Vue)
// 挂载$forceUpdate、$destroy、_update方法
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
