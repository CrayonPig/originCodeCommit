# 安装

上文中，我们提到，按照是调用的`install`方法，我们找到Vuex的入口文件`src/index.js`

``` js
import { Store, install } from './store'
import { mapState, mapMutations, mapGetters, mapActions, createNamespacedHelpers } from './helpers'
import createLogger from './plugins/logger'

export default {
  Store,
  install,
  version: '__VERSION__',
  mapState,
  mapMutations,
  mapGetters,
  mapActions,
  createNamespacedHelpers,
  createLogger
}

export {
  Store,
  install,
  mapState,
  mapMutations,
  mapGetters,
  mapActions,
  createNamespacedHelpers,
  createLogger
}
```

可以发现，`install`方法是在`src/store.js`中

```js
let Vue // bind on install

export function install (_Vue) {
  // 判断是否已经初始化过
  if (Vue && _Vue === Vue) {
    if (__DEV__) {
      console.error(
        '[vuex] already installed. Vue.use(Vuex) should be called only once.'
      )
    }
    return
  }
  Vue = _Vue
  applyMixin(Vue)
}
```

`install`方法的逻辑比较简单，将传入的`_Vue`赋值给空变量`Vue`中，防止重复渲染，然后执行`applyMixin`方法

`applyMixin`方法在`src/mixin.js`中，针对Vue2以上版本代码，简化如下

```js
export default function (Vue) {
  Vue.mixin({ beforeCreate: vuexInit })

  function vuexInit () {
    const options = this.$options
    // store injection
    if (options.store) {
      this.$store = typeof options.store === 'function'
        ? options.store()
        : options.store
    } else if (options.parent && options.parent.$store) {
      this.$store = options.parent.$store
    }
  }
}
```

简化后的代码调用了`Vue.mixin`方法，全局混入了一个 `beforeCreate` 钩子函数

`vuexInit`的逻辑较为简单，把 `options.store` 保存在所有组件的 `this.$store` 中，这个 `options.store` 就是我们在实例化 `Store` 对象的实例，我们下节去分析。

