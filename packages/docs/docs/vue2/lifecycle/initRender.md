# 初始化阶段(initRender)

`initRender` 用于初始化组件实例的渲染相关属性和方法。源码在 `src/core/instance/render.js`

```js
export function initRender (vm: Component) {
  // 用于存储组件自身实例的虚拟节点，表示组件在虚拟DOM树中的位置。
  vm._vnode = null 
  //缓存 v-once 指令生成的静态树
  vm._staticTrees = null 

  const options = vm.$options
  // 父组件创建的占位节点
  const parentVnode = vm.$vnode = options._parentVnode 
  const renderContext = parentVnode && parentVnode.context
  
  // 插槽内容的集合
  vm.$slots = resolveSlots(options._renderChildren, renderContext)

  // 包含了具名插槽的作用域插槽函数的对象
  vm.$scopedSlots = emptyObject

  // _c 方法的参数顺序是：标签名、数据对象、子节点数组、规范化类型、是否总是规范化。
  // 在组件中创建虚拟节点的辅助函数，实际上就是调用 $createElement。
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)

  // 用于创建虚拟节点，即用于渲染组件的模板。
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)

  // 获取父组件的虚拟节点
  const parentData = parentVnode && parentVnode.data

  // 将 $attrs 添加到组件实例，并指定其初始值为父虚拟节点的 attrs 属性或空对象（emptyObject）
  // 将 $listeners 添加到组件实例，并指定其初始值为选项对象中的 _parentListeners 属性或空对象（emptyObject）。
  defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, null, true)
  defineReactive(vm, '$listeners', options._parentListeners || emptyObject, null, true)
}
```

函数内部的逻辑如下：

1. 初始化 `_vnode` 属性为 `null`，该属性表示组件实例的根虚拟节点。
2. 初始化 `_staticTrees` 属性为 `null`，用于缓存 `v-once` 指令生成的静态树。
3. 获取组件实例的选项对象 `$options`，并将选项对象中的 `_parentVnode` 赋值给 `$vnode` 属性，表示组件实例在父树中的占位节点。
4. 获取父树的渲染上下文 `renderContext`。
5. 使用 `resolveSlots` 函数解析渲染选项对象的 `_renderChildren` 属性，将结果赋值给 `$slots` 属性，用于处理插槽相关的内容。
6. 初始化 `$scopedSlots` 属性为一个空对象，表示作用域插槽。
7. 将 `_c` 方法绑定到组件实例上，该方法用于创建虚拟节点，并在创建时获取正确的渲染上下文。`_c` 方法的参数顺序是：标签名、数据对象、子节点数组、规范化类型、是否总是规范化。
8. 将 `$createElement` 方法绑定到组件实例上，该方法用于创建虚拟节点，其中规范化是始终应用的。`$createElement` 方法与 `_c` 方法类似，但在用户编写的渲染函数中使用。
9. 使用 `defineReactive` 函数定义 `$attrs` 和 `$listeners` 两个响应式属性，它们被暴露出来，方便高阶组件的创建和使用。

## _vnode 和 $vnode

乍一看，这两个属性好像差不多，只是前缀符号有区别。很容易让人迷惑。

- 两个对象都是vnode类型对象
- `_vnode` 是组件实例的私有属性，表示组件的根虚拟节点，用于组件内部的渲染过程。
- `$vnode` 是组件实例的公共属性，表示组件在父组件中的占位虚拟节点，用于获取组件在父组件中的位置和上下文信息。

从源码的角度来讲 `_parentVnode` 首先赋值给了 `$vnode` ，然后又赋值给了`vnode.parent`。
然而在后续渲染的`_update`函数内`vnode`又赋值给了`_vnode`，所以`_vnode`其实是`$vnode`的子集

## resolveSlots

`resolveSlots` 函数的作用是解析组件实例的插槽内容，并返回一个对象，其中包含了解析后的插槽内容。源码在`src/core/instance/render-helpers/resolve-slots.js`

```js
export function resolveSlots (
  children: ?Array<VNode>,
  context: ?Component
): { [key: string]: Array<VNode> } {
  const slots = {}

  // 如果没有子节点，返回一个空的插槽对象。
  if (!children) {
    return slots
  }

  // 遍历每个子节点以解析插槽。
  for (let i = 0, l = children.length; i < l; i++) {
    const child = children[i]
    const data = child.data

    // 如果节点被解析为Vue插槽节点，则删除插槽属性。以确保在后续的处理中不会将其误解为普通的属性
    if (data && data.attrs && data.attrs.slot) {
      delete data.attrs.slot
    }
    // 相同上下文表明是一个具名插槽
    if ((child.context === context || child.fnContext === context) &&
      data && data.slot != null
    ) {
      const name = data.slot
      const slot = (slots[name] || (slots[name] = []))
      if (child.tag === 'template') {
        slot.push.apply(slot, child.children || [])
      } else {
        slot.push(child)
      }
    } else {
      // 非具名插槽直接存入
      (slots.default || (slots.default = [])).push(child)
    }
  }
  // 忽略只包含空格的插槽
  for (const name in slots) {
    if (slots[name].every(isWhitespace)) {
      delete slots[name]
    }
  }
  return slots
}
```

## $createElement 和 _c

`$createElement` 和 `_c` 都是用于创建虚拟节点的方法，但在使用方式和用途上有一些区别。

1. `$createElement` 方法：
   - 用途：`$createElement` 方法是 Vue 实例的方法，用于在用户编写的渲染函数中创建虚拟节点。用户在编写组件的 `render` 函数时，可以使用 `$createElement` 方法来手动创建虚拟节点。
   - 参数顺序：`$createElement` 方法的参数顺序是标签名、数据对象、子节点数组、规范化类型。
   - 规范化：`$createElement` 方法的规范化是始终应用的，即会对子节点进行规范化处理。
   - 示例使用：`$createElement('div', { class: 'my-class' }, [ $createElement('span', 'Hello World') ])`

2. `_c` 方法：
   - 用途：`_c` 方法是 Vue 内部使用的方法，用于在模板编译阶段创建虚拟节点。模板编译将模板转换为渲染函数，而在渲染函数中会使用 `_c` 方法来创建虚拟节点。
   - 参数顺序：`_c` 方法的参数顺序是标签名、数据对象、子节点数组、规范化类型、是否总是规范化。
   - 规范化：在使用 `_c` 方法创建虚拟节点时，是否进行规范化处理取决于最后一个参数，即是否总是规范化。
   - 示例使用：`_c('div', { class: 'my-class' }, [ _c('span', 'Hello World') ], 0, false)`

总体来说`$createElement` 方法是供用户在编写组件的渲染函数时使用的，而 `_c` 方法是在 Vue 内部的模板编译过程中使用的。它们在参数顺序和规范化处理上略有不同，以满足不同的使用场景和需求。