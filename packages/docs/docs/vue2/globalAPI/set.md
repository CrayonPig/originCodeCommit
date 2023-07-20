# Vue.set

## 用法回顾

其用法如下：

```javascript
Vue.set( target, propertyName/index, value )
```

- **参数**：

  - `{Object | Array} target`
  - `{string | number} propertyName/index`
  - `{any} value`

- **返回值**：设置的值。

- **作用**：

  向响应式对象中添加一个属性，并确保这个新属性同样是响应式的，且触发视图更新。它必须用于向响应式对象上添加新属性，因为 Vue 无法探测普通的新增属性 (比如 `this.myObject.newProperty = 'hi'`)

## 原理分析

该API的原理同实例方法 `$set`原理一样，此处不再重复。
