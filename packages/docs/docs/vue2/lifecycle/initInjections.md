# 初始化阶段(initInjections)

`initInjections` 函数用于初始化组件的注入属性，它通过解析组件配置中的 `inject` 选项，将注入的属性定义为响应式数据。

`inject` 和 `provide` 通常是成对出现的，它们的作用是：允许一个祖先组件向其所有子孙后代注入一个依赖，不论组件层次有多深，并在起上下游关系成立的时间里始终生效。

::: tip
`inject` 和 `provide` 主要为高阶插件/组件库提供用例，并不推荐直接用于业务代码中。
:::

`provide` 选项应该是一个对象或返回一个对象的函数。该对象包含可注入其子孙的属性。在该对象中你可以使用 `ES2015 Symbols` 作为 key，但是只在原生支持 `Symbol` 和 `Reflect.ownKeys` 的环境下可工作。

`inject` 选项应该是一个字符串数组或对象，其中对象的 key 是本地的绑定名。value 是个 key ( 字符串或 symbol) 或对象，用来在可用的注人内容中搜索。

如果是对象，那么它有如下两个属性

- from 属性是在可用的注入内容中搜索用的 key (字符串或 Symbol)
- default 属性是降级情况下使用的 value

::: tip
可用的注入内容指的是祖先组件通过 provide 注入了内容，子孙组件可以通过 inject 获取祖先组件注入的内容。
:::

虽然`inject`和`provide` 是成对出现的，但是二者在内部的实现是分开处理的，先处理 `inject`后处理 `provide`。从之前梳理的`_init`函数的逻辑中也可以看出，`inject` 在 `data/props` 之前初始化，而 `provide` 在 `data/props` 后面初始化。这样做的目的是让用户可以在 `data/props` 中使用 `inject` 所注人的内容。也就是说，可以让`data/props` 依赖 `inject`，所以需要将初始化 `inject`放在初始化`data/props`的前面。

```js
// _init函数片段

// 在data/props之前，注入inject
initInjections(vm) // resolve injections before data/props
// 初始化 props、methods、data、computed、watch
initState(vm)
// 数据初始化完成后，调用provide传递数据
initProvide(vm) // resolve provide after data/props
```

## initInjections

接下来我们看`initInjections`源码，代码在`src/core/instance/inject.js`

```js
export function initInjections (vm: Component) {
  const result = resolveInject(vm.$options.inject, vm)
  if (result) {
    // 禁用observe
    toggleObserving(false)
    Object.keys(result).forEach(key => {
      // 将解析出的inject绑定为当前组件的响应式数据
      defineReactive(vm, key, result[key])
    })
    // 开启
    toggleObserving(true)
  }
}
```

首先调用 `resolveInject` 函数来解析组件的注入属性。`resolveInject` 函数会根据组件的配置项 `$options.inject` 和当前组件实例 `vm` 来确定注入的属性。

如果存在解析结果 `result`，则会执行以下操作：

1. 禁用观测：调用 `toggleObserving(false)` 来禁用对属性的观测。
2. 遍历解析结果 `result` 的每个属性，使用 `Object.keys(result).forEach(key => { ... })`。
3. 在非生产环境下，使用 `defineReactive` 函数定义注入属性为响应式数据。该函数会为每个属性设置 getter 和 setter，并在修改属性值时发出警告，防止直接修改注入属性的值。
4. 在生产环境下，直接使用 `defineReactive` 函数定义注入属性为响应式数据。
5. 开启观测：调用 `toggleObserving(true)` 来开启对属性的观测。

## resolveInject

`resolveInject` 函数用于解析组件的注入属性配置，并根据提供的配置在组件的父级组件中查找提供的值。如果找到了提供的值，则将其存储在解析后的注入属性对象中。如果未找到提供的值，并且存在默认值，则将默认值赋给解析后的注入属性对象。最后，返回解析后的注入属性对象。

源码在`src/core/instance/inject.js`

```js
export function resolveInject (inject: any, vm: Component): ?Object {
  if (inject) {
    // inject is :any because flow is not smart enough to figure out cached
    const result = Object.create(null)
    // Reflect.ownKeys() 方法返回一个由所有键（包括符号键和非符号键）组成的数组，
    // 而 Object.keys() 方法只返回一个由字符串键组成的数组
    // 所以优先使用Reflect判断
    const keys = hasSymbol
      ? Reflect.ownKeys(inject).filter(key => {
        /* istanbul ignore next */
        return Object.getOwnPropertyDescriptor(inject, key).enumerable
      })
      : Object.keys(inject)

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const provideKey = inject[key].from
      let source = vm
      while (source) {
        // 根组件_provided为空，后续步骤初始化_provided
        if (source._provided && hasOwn(source._provided, provideKey)) {
          result[key] = source._provided[provideKey]
          break
        }
        // 如果在父级没找到，则向祖先查找，如果父级找到了，直接break出去，不需要祖先覆盖
        source = source.$parent
      }
      if (!source) {
        // 没获取值的时候，如果设置了默认值，default字段，取默认值
        if ('default' in inject[key]) {
          const provideDefault = inject[key].default
          // 如果获取到的值为function，则将this绑定到当前组件
          result[key] = typeof provideDefault === 'function'
            ? provideDefault.call(vm)
            : provideDefault
        } else if (process.env.NODE_ENV !== 'production') {
          warn(`Injection "${key}" not found`, vm)
        }
      }
    }
    return result
  }
}
```

函数内部首先判断 `inject` 是否存在。如果存在，则执行以下操作：

1. 创建一个空对象 `result`，用于存储解析后的注入属性。
2. 根据是否支持符号键（Symbol key），确定要遍历的键数组 `keys`。如果支持符号键，则使用 `Reflect.ownKeys(inject)`，否则使用 `Object.keys(inject)`。
3. 遍历键数组 `keys`，对于每个键 `key`，执行以下操作：

- 获取 `inject[key]` 的 `from` 属性值，即提供注入值的键名。
- 从当前组件实例 `vm` 开始向父级组件逐层查找，直到找到 `_provided` 属性，并且 `_provided` 对象中存在键为 `provideKey` 的属性。如果找到，则将该属性值存储在 `result[key]` 中，并终止循环。
- 如果在所有父级组件中都未找到提供的值，则判断是否存在 `default` 字段。如果存在，则将 `inject[key].default` 的值赋给 `result[key]`，如果 `default` 是一个函数，则绑定当前组件实例 `vm`，并调用该函数获取默认值。
- 如果既未找到提供的值，也不存在 `default` 字段，则在非生产环境下发出警告，提示注入属性未找到。

4. 返回解析后的注入属性对象 `result`。
