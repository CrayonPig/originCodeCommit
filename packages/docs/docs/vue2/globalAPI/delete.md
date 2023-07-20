# Vue.delete

## 用法回顾

其用法如下：

```javascript
Vue.delete( target, propertyName/index )
```

- **参数**：

  - `{Object | Array} target`
  - `{string | number} propertyName/index`

  > 仅在 2.2.0+ 版本中支持 Array + index 用法。

- **作用**：

  删除对象的属性。如果对象是响应式的，确保删除能触发更新视图。这个方法主要用于避开 Vue 不能检测到属性被删除的限制，但是你应该很少会使用它。

  > 在 2.2.0+ 中同样支持在数组上工作。

## 原理分析

该API的原理同实例方法 `$delete`原理一样，此处不再重复。
