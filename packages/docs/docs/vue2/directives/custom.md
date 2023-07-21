# 自定义指令

之前我们介绍过，除了Vue提供的一些内置指令之外，Vue还支持用户自定义指令。

用户自定义指令有两种实现方式：

1. 用全局API——`Vue.directive`来定义全局指令，这种方式定义的指令会被存放在`Vue.options['directives']`中；
2. 在组件内的`directive`选项中定义专为该组件使用的局部指令，这种方式定义的指令会被存放在`vm.$options['directives']`中。

可以看到，自定义指令被定义后，都会将指令存放在某个位置。那么指令是如何生效的呢，或者说什么时候会生效呢？本小节我们一起探究自定义指令如何生效的内部原理

## 何时生效

我们知道在虚拟`DOM`渲染更新时，除了更新节点的内容之外，还会触发一些钩子函数。这是因为节点上的一些指令、事件等内容也需要被更新。因此事件、指令、属性等相关处理逻辑只需要监听钩子函数，在钩子函数触发时执行相关处理逻辑即可实现功能。

下面列举了虚拟`DOM`在渲染更新的不同阶段所触发的不同的钩子函数及其触发时机：

| 钩子函数名称 | 触发时机                                                     | 回调参数              |
| ------------ | ------------------------------------------------------------ | --------------------- |
| init         | 已创建VNode，在patch期间发现新的虚拟节点时被触发             | VNode                 |
| create       | 已基于VNode创建了DOM元素                                     | emptyNode和VNode      |
| activate     | keep-alive组件被创建                                         | emptyNode和innerNode  |
| insert       | VNode对应的DOM元素被插入到父节点中时被触发                   | VNode                 |
| prepatch     | 一个VNode即将被patch之前触发                                 | oldVNode和VNode       |
| update       | 一个VNode更新时触发                                          | oldVNode和VNode       |
| postpatch    | 一个VNode被patch完毕时触发                                   | oldVNode和VNode       |
| destroy      | 一个VNode对应的DOM元素从DOM中移除时或者它的父元素从DOM中移除时触发 | VNode                 |
| remove       | 一个VNode对应的DOM元素从DOM中移除时触发。与destroy不同的是，如果是直接将该VNode的父元素从DOM中移除导致该元素被移除，那么不会触发 | VNode和removeCallback |

所以我们想要让指令生效，可以监听恰当的钩子函数来处理相关的逻辑，那么这么多钩子函数，我们应该监听哪些呢？

我们先思考一个问题，指令是用来干嘛的？答案很简单，影响真实DOM。所以我们可以得到以下结论

1. 需要监听DOM的生成和销毁，也就是对应的`create`和`destroy`钩子函数
2. 既然DOM生成和销毁也有了，那我更新不能忘记啊，多加一个更新钩子函数`update`

好了，那我们明白了我们需要监听虚拟`DOM`渲染更新的`create`、`update`、`destory`这三个钩子函数来处理指令逻辑。实际上Vue内部也是这么处理的

```js
// src/core/vdom/modules/directives.js

export default {
  create: updateDirectives,
  update: updateDirectives,
  destroy: function unbindDirectives (vnode: VNodeWithData) {
    updateDirectives(vnode, emptyNode)
  }
}
```

虚拟DOM在触发钩子函数时，上面代码中对应的函数会被执行。但无论哪个钩子函数被触发，最终都会执行一个叫作 `updateDirectives` 的函数。从代码中可以得知，指令相关的处理逻辑都在 `updateDirectives` 函数中实现，下面我们就一起分析该函数是如何处理指令逻辑的。

## 指令钩子函数

`Vue`对于自定义指令定义对象提供了几个钩子函数，这几个钩子函数分别对应着指令的几种状态，一个指令从第一次被绑定到元素上到最终与被绑定的元素解绑，它会经过以下几种状态：

- bind：只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置。
- inserted：被绑定元素插入父节点时调用 (仅保证父节点存在，但不一定已被插入文档中)。
- update：所在组件的 VNode 更新时调用，**但是可能发生在其子 VNode 更新之前**。
- componentUpdated：指令所在组件的 VNode **及其子 VNode** 全部更新后调用。
- unbind：只调用一次，指令与元素解绑时调用。

有了每个状态的钩子函数，这样我们就可以让指令在不同状态下做不同的事情。

例如，我们想让指令所绑定的输入框一插入到 DOM 中，输入框就获得焦点，那么，我们就可以这样定义指令:

```javascript
// 注册一个全局自定义指令 `v-focus`
Vue.directive('focus', {
  // 当被绑定的元素插入到 DOM 中时……
  inserted: function (el) {
    // 聚焦元素
    el.focus()
  }
})
```

在模板中使用该指令，如下：

```html
<input v-focus>
```

可以看到，我们在定义该指令的时候，我们将获取焦点的逻辑写在了`inserted`钩子函数里面，这样就保证了当被绑定的元素插入到父节点时，获取焦点的逻辑就会被执行。

同理，我们也可以在一个指令中设置多个钩子函数，从而让一个指令在不同状态下做不同的事。

OK，有了这个概念之后，接下来我们就来分析指令是如何生效的。

## 如何生效

在上文中，我们讲到，指令相关的处理逻辑都在 `updateDirectives` 函数中实现，我们这里一起分析该函数

```js
// src/core/vdom/modules/directives.js

function updateDirectives (oldVnode: VNodeWithData, vnode: VNodeWithData) {
  if (oldVnode.data.directives || vnode.data.directives) {
    _update(oldVnode, vnode)
  }
}
```

可以看到，判断逻辑是只要新旧`VNode`有一方涉及到了指令，那就调用`_update`方法去处理指令逻辑。

继续查看`_update`方法

```js
// src/core/vdom/modules/directives.js

function _update (oldVnode, vnode) {
  // 判断当前节点`vnode`对应的旧节点`oldVnode`是不是一个空节点，如果是的话，表明当前节点是一个新创建的节点
  const isCreate = oldVnode === emptyNode
  // 判断当前节点`vnode`是不是一个空节点，如果是的话，表明当前节点对应的旧节点将要被销毁
  const isDestroy = vnode === emptyNode
  // 旧的指令集合，即`oldVnode`中保存的指令
  const oldDirs = normalizeDirectives(oldVnode.data.directives, oldVnode.context)
  // 新的指令集合，即`vnode`中保存的指令
  const newDirs = normalizeDirectives(vnode.data.directives, vnode.context)
  // 保存需要触发`inserted`指令钩子函数的指令列表
  const dirsWithInsert = []
  // 保存需要触发`componentUpdated`指令钩子函数的指令列表
  const dirsWithPostpatch = []

  let key, oldDir, dir
  for (key in newDirs) {
    oldDir = oldDirs[key]
    dir = newDirs[key]
    // 判断当前循环到的指令名`key`在旧的指令列表`oldDirs`中是否存在，如果不存在，那么说明这是一个新的指令
    if (!oldDir) {
      // 新的指令触发钩子函数bind
      callHook(dir, 'bind', vnode, oldVnode)
      // 如果定义了inserted 时的钩子函数 那么将该指令添加到dirsWithInsert中
      if (dir.def && dir.def.inserted) {
        dirsWithInsert.push(dir)
      }
    } else {
      // 新旧指令同时存在，说明是更新操作
      dir.oldValue = oldDir.value
      // 触发钩子函数update
      callHook(dir, 'update', vnode, oldVnode)
      // 如果定义了componentUpdated 时的钩子函数 那么将该指令添加到dirsWithPostpatch中
      if (dir.def && dir.def.componentUpdated) {
        dirsWithPostpatch.push(dir)
      }
    }
  }

  // 循环结束后，如果有需要触发`inserted`指令钩子函数的指令列表
  if (dirsWithInsert.length) {
    const callInsert = () => {
      // 循环列表触发 inserted钩子函数
      for (let i = 0; i < dirsWithInsert.length; i++) {
        callHook(dirsWithInsert[i], 'inserted', vnode, oldVnode)
      }
    }
    if (isCreate) {
      // 新创建的节点，虚拟DOM渲染更新的insert钩子函数和指令的inserted钩子函数都要被触发，进行合并
      // 确保后续触发时元素已经被插入到父节点中
      mergeVNodeHook(vnode, 'insert', callInsert)
    } else {
      callInsert()
    }
  }

  // 循环结束后，如果有需要触发`componentUpdated`指令钩子函数的指令列表
  if (dirsWithPostpatch.length) {
    // 将虚拟DOM渲染更新的postpatch钩子函数和指令的componentUpdated钩子函数进行合并触发
    // 保证触发时，指令所在的组件的VNode及其子VNode已经全部更新完
    mergeVNodeHook(vnode, 'postpatch', () => {
      for (let i = 0; i < dirsWithPostpatch.length; i++) {
        callHook(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode)
      }
    })
  }

  if (!isCreate) {
    // 如果某个指令在旧的指令列表，但不在新的指令列表中，说明指令被删除了，需要触发unbind钩子函数
    for (key in oldDirs) {
      if (!newDirs[key]) {
        // no longer present, unbind
        callHook(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy)
      }
    }
  }
}
```

上述代码逻辑不复杂，主要实现了几个判断

1. 首先判断指令是新创建的还是将要被销毁的，并获取新旧指令集合。
2. 遍历新指令集合，如果指令在旧指令集合中不存在，触发`bind`钩子函数，执行一次性的初始化设置。
3. 如果指令在新旧指令集合中同时存在，触发`update`钩子函数，处理更新操作。
4. 将需要触发`inserted`钩子函数的指令和`componentUpdated`钩子函数的指令分别保存到两个列表中。
5. 在虚拟DOM渲染更新后，触发`inserted`钩子函数列表中的指令的`inserted`钩子函数。
6. 在虚拟DOM渲染更新完毕后，触发`componentUpdated`钩子函数列表中的指令的`componentUpdated`钩子函数。
7. 如果某个指令在旧指令集合中存在，但不在新指令集合中，说明指令被删除了，触发`unbind`钩子函数。

有些同学可能看源码的时候，对`normalizeDirectives`函数有疑问

```js
// src/core/vdom/modules/directives.js

function normalizeDirectives (
  dirs: ?Array<VNodeDirective>,
  vm: Component
): { [key: string]: VNodeDirective } {
  const res = Object.create(null)
  if (!dirs) {
    // $flow-disable-line
    return res
  }
  let i, dir
  for (i = 0; i < dirs.length; i++) {
    dir = dirs[i]
    if (!dir.modifiers) {
      // $flow-disable-line
      dir.modifiers = emptyModifiers
    }
    res[getRawDirName(dir)] = dir
    dir.def = resolveAsset(vm.$options, 'directives', dir.name, true)
  }
  // $flow-disable-line
  return res
}
```

实际上，`normalizeDirectives`是将我们写的指令做了一层封装，使其能够被更好的调用。

以`v-focus`为例

```javascript
// 注册一个全局自定义指令 `v-focus`
Vue.directive('focus', {
  // 当被绑定的元素插入到 DOM 中时……
  inserted: function (el) {
    // 聚焦元素
    el.focus()
  }
})
```

经过`normalizeDirectives`会被转换成如下的格式

```js
{
  'v-focus':{
    name : 'focus' ,  // 指令的名称
    value : '',       // 指令的值
    arg:'',           // 指令的参数
    modifiers:{},     // 指令的修饰符
    def:{
      inserted:fn
    }
  }
}
```

以上就是指令生效的全部逻辑。所谓让指令生效，其实就是在合适的时机执行定义指令时所设置的钩子函数。

## 总结

本小节介绍了Vue中的自定义指令及其生效原理。

首先介绍了自定义指令的两种实现方式：使用全局API `Vue.directive`定义全局指令，或在组件内部的`directive`选项中定义局部指令。全局指令存放在`Vue.options['directives']`中，局部指令存放在`vm.$options['directives']`中。

接着，解释了指令生效的原理。在虚拟DOM渲染更新时，会触发一系列钩子函数，例如`init`、`create`、`update`等。为了让指令生效，需要监听合适的钩子函数，在触发时执行指令的相关逻辑。常用的钩子函数包括`inserted`、`update`、`componentUpdated`等。
