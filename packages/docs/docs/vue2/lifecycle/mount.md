# 挂载阶段

模板编译阶段完成后，就进入到了挂载阶段，从官方的生命周期中，我们可以发现此阶段涉及到的生命周期比较多，有`beforeMount`、`mounted`、`beforeUpdate`、`updated`四个。覆盖了我们日常开发中的大部分生命周期。在这个期间，Vue主要做了两件事：

- 挂载DOM：创建Vue实例并用其替换`el`选项对应的DOM元素，再将模板内容渲染到视图中
- 数据监控：开启对模板中数据（状态）的监控，当数据（状态）发生变化时通知其依赖进行视图更新

![lifecycle-mount](@assets/vue2/lifecycle-mount.png)

回顾上节我们讲的模板编译阶段，完整版`$mount`最终调用了运行时的`$mount`，而运行时的`$mount`最后调用的是`mountComponent`函数。

```js
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}
```

在Vue中，调用`mountComponent`就标志着正式进入了挂载阶段，本节我们一起来探讨`mountComponent`究竟做了什么。源码在`src/core/instance/lifecycle.js`

## 挂载DOM

![lifecycle-mount](@assets/vue2/lifecycle-mount1.png)

挂载DOM是挂载阶段的第一件事，创建Vue实例并用其替换`el`选项对应的DOM元素，再将模板内容渲染到视图中。具体代码如下：

```js
export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  // 将组件实例$el设置为挂载的dom
  vm.$el = el
  // 如果没有render，则创建一个空的VNode作为render
  // 确保在挂载过程中至少有一个渲染函数可用
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode
  }
  // 调用生命周期 beforeMount
  callHook(vm, 'beforeMount')

  let updateComponent

  updateComponent = () => {
    // 执行渲染函数vm._render()得到一份最新的VNode节点树
    // vm._update()方法对最新的VNode节点树与上一次渲染的旧VNode节点树进行对比并更新DOM节点(即patch操作)，完成一次渲染。
    // hydrating 是一个布尔值，用于指示是否是服务端渲染（hydration）的过程。
    vm._update(vm._render(), hydrating)
  }
}
```

1. `vm.$el = el`：将组件实例的 `$el` 属性设置为传入的 `el`，即组件要挂载的目标元素。
2. 检查是否存在渲染函数：
   - 如果组件的配置项 `vm.$options.render` 不存在，即没有显式定义渲染函数，则将 `vm.$options.render` 设置为一个空的 VNode（虚拟节点）。
   - 这是为了确保在挂载过程中至少有一个渲染函数可用。
3. 调用 `beforeMount` 生命周期钩子
4. 定义 `updateComponent` 函数：
   - `updateComponent` 函数是一个渲染函数，负责执行组件的渲染逻辑。
   - 在后续步骤中会被调用来执行初始的渲染和后续的更新。
5. 调用 `vm._update(vm._render(), hydrating)`：
   - `vm._render()` 执行渲染函数，生成最新的 VNode 节点树。
   - `vm._update()` 方法将最新的 VNode 节点树与上一次渲染的旧 VNode 节点树进行对比，并根据差异更新 DOM 节点（执行 patch 操作），完成一次渲染。
   - 第二个参数 `hydrating` 是一个布尔值，用于指示是否是服务端渲染（hydration）的过程。

从上述代码可以看出，挂载DOM阶段主要做的事情为设置目标元素、检查渲染函数、执行 `beforeMount` 生命周期钩子以及执行渲染函数和更新 DOM。上述代码执行完毕后，我们就可以将模板内容渲染到视图中。

## 数据监控

将模板内容渲染到视图后，我们就进入了挂载阶段的第二件事，数据监控，开启对模板中数据（状态）的监控，当数据（状态）发生变化时通知其依赖进行视图更新

```js
new Watcher(vm, updateComponent, noop, {
  before () {
    if (vm._isMounted) {
      callHook(vm, 'beforeUpdate')
    }
  }
}, true /* isRenderWatcher */)
hydrating = false

// $vnode 组件实例的占位节点，用于表示组件在父组件中的位置
// $vnode 为null，表示组件初次挂载
if (vm.$vnode == null) {
  vm._isMounted = true
  callHook(vm, 'mounted')
}
return vm
```

`Watcher` 构造函数在其他部分有讲，这里就简单介绍下。`Watcher`类构造函数的第二个参数支持两种类型：函数和数据路径（如`a.b.c`）。如果是数据路径，会根据路径去读取这个数据；如果是函数，会执行这个函数。一旦读取了数据或者执行了函数，就会触发数据或者函数内数据的`getter`方法，而在`getter`方法中会将`Watcher`实例添加到该数据的依赖列表中，当该数据发生变化时就会通知依赖列表中所有的依赖，依赖接收到通知后就会调用第四个参数回调函数去更新视图。

在这个函数中，将`updateComponent`作为`Watcher`第二个参数传入，创建一个`watcher`实例。并且会立即执行`updateComponent`, 完成渲染。

再执行后续代码，使用`$vnode`判断是否为初次渲染，如果是，则将私有属性`_isMounted`改为`true`，表示已经初始化过。此时再调用 `mounted` 生命周期钩子。

`Watcher`实例化后，`updateComponent`函数中使用到的所有数据都将被`watcher`监听，一但发生改变，就执行第四个参数，也就是这里的`before`, 又通过私有属性`_isMounted`判断是否渲染完成后，再次调用`beforeUpdate`生命周期钩子。

`Watcher`内部会在更新完成后调用`updated`生命周期钩子，从而完成整个挂载阶段的流程。

## 总结

挂载阶段是Vue组件的生命周期的第三部分。在挂载阶段，Vue完成了两件主要的事情：挂载DOM和数据监控。

1. 挂载DOM：
   - 首先，将组件实例的 `$el` 属性设置为要挂载的目标DOM元素。
   - 然后，检查是否存在渲染函数，如果不存在，则将 `vm.$options.render` 设置为一个空的虚拟节点（VNode）。
   - 接下来，调用 `beforeMount` 生命周期钩子。
   - 定义 `updateComponent` 函数，该函数负责执行组件的渲染逻辑。
   - 最后，调用 `vm._update(vm._render(), hydrating)` 来执行渲染函数并更新DOM。

2. 数据监控：
   - 创建一个 `Watcher` 实例，将 `updateComponent` 函数作为其第二个参数。
   - `Watcher` 实例会立即执行 `updateComponent` 函数，完成初始的渲染。
   - 在 `updateComponent` 函数中使用的所有数据将被 `Watcher` 监听，一旦数据发生变化，会触发回调函数进行视图更新。
   - 如果是初次渲染，通过 `$vnode` 判断，将 `_isMounted` 属性设置为 `true`，并调用 `mounted` 生命周期钩子。
   - 在更新完成后，`Watcher` 实例会调用 `updated` 生命周期钩子。

整个挂载阶段的流程包括设置目标元素、检查渲染函数、执行 `beforeMount` 生命周期钩子、执行渲染函数和更新 DOM，以及创建 `Watcher` 实例进行数据监控和相应的生命周期钩子调用。