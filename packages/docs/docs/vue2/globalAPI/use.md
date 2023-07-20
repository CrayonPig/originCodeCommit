# Vue.use

## 用法回顾

其用法如下：

```javascript
Vue.use( plugin )
```

- **参数**：

  - `{Object | Function} plugin`

- **作用**：

  安装 Vue.js 插件。如果插件是一个对象，必须提供 `install` 方法。如果插件是一个函数，它会被作为 install 方法。install 方法调用时，会将 `Vue` 作为参数传入。

  该方法需要在调用 `new Vue()` 之前被调用。

  当 `install` 方法被同一个插件多次调用，插件将只会被安装一次。

## 原理分析

从用法回顾中可以知道，该API是用来安装`Vue.js`插件的。并且我们知道了，该API内部会调用插件提供的`install` 方法，同时将`Vue` 作为参数传入。另外，由于插件只会被安装一次，所以该API内部还应该防止 `install` 方法被同一个插件多次调用。下面我们就来看一下该API的内部实现原理。

```js
// src/core/global-api/use.js

export function initUse (Vue: GlobalAPI) {
  Vue.use = function (plugin: Function | Object) {
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    // 如果当前插件被注册过，不重复注册
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters
    const args = toArray(arguments, 1)
    // 将Vue实例放在数组第一位，后续install第一个参数必须是Vue实例
    args.unshift(this)
    // 如果插件提供了install方法，则调用install初始化
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    // 如果插件没提供install方法，并且插件本身是一个function，则调用插件本身初始化
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args)
    }
    // 缓存plugin
    installedPlugins.push(plugin)
    return this
  }
}
```

代码如上，这里需要提一下的是，如果插件提供了`install`方法，则调用`install`初始化，如果插件没提供`install`方法，并且插件本身是一个`function`，则调用插件本身初始化。
