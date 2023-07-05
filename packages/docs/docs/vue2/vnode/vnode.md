# Vue中的虚拟DOM

上一节中，我们介绍了`虚拟DOM`，本节我们一起来看看，在Vue源码中，是如何使用`虚拟DOM`的。

## 基础VNode类

在Vue内部，定义了多种`VNode`类型，这些类型都是在基础`VNode`类的基础上通过不同属性描述的。我们先来研究基础`VNode`类，源码在`src/core/vdom/vnode.js`

```js
export default class VNode {
  tag: string | void; // 节点标签名，可以是字符串或undefined
  data: VNodeData | void; // 节点数据，可以是VNodeData对象或undefined
  children: ?Array<VNode>; // 子节点数组，可以是VNode数组或undefined
  text: string | void; // 文本内容，可以是字符串或undefined
  elm: Node | void; // DOM元素，可以是Node对象或undefined
  ns: string | void; // 命名空间，可以是字符串或undefined
  context: Component | void; // 渲染该节点所在的组件实例，可以是Component对象或undefined
  key: string | number | void; // 节点的唯一标识，可以是字符串、数字或undefined
  componentOptions: VNodeComponentOptions | void; // 组件选项，可以是VNodeComponentOptions对象或undefined
  componentInstance: Component | void; // 组件实例，可以是Component对象或undefined
  parent: VNode | void; // 父节点，可以是VNode对象或undefined（组件占位符节点）

  // 严格内部使用
  raw: boolean; // 是否包含原始的HTML代码？（仅限服务器端）
  isStatic: boolean; // 是否是静态节点
  isRootInsert: boolean; // 是否是根插入节点，用于进入过渡检查
  isComment: boolean; // 是否是空注释占位符
  isCloned: boolean; // 是否是克隆节点
  isOnce: boolean; // 是否是v-once节点
  asyncFactory: Function | void; // 异步组件工厂函数
  asyncMeta: Object | void; // 异步组件元信息
  isAsyncPlaceholder: boolean; // 是否是异步占位符节点
  ssrContext: Object | void; // 服务器端渲染上下文
  fnContext: Component | void; // 函数式组件节点的真实上下文vm
  fnOptions: ?ComponentOptions; // 用于SSR缓存的组件选项
  fnScopeId: ?string; // 函数式作用域ID支持

  constructor(
    tag?: string,
    data?: VNodeData,
    children?: ?Array<VNode>,
    text?: string,
    elm?: Node,
    context?: Component,
    componentOptions?: VNodeComponentOptions,
    asyncFactory?: Function
  ) {
    this.tag = tag;
    this.data = data;
    this.children = children;
    this.text = text;
    this.elm = elm;
    this.ns = undefined;
    this.context = context;
    this.fnContext = undefined;
    this.fnOptions = undefined;
    this.fnScopeId = undefined;
    this.key = data && data.key;
    this.componentOptions = componentOptions;
    this.componentInstance = undefined;
    this.parent = undefined;
    this.raw = false;
    this.isStatic = false;
    this.isRootInsert = true;
    this.isComment = false;
    this.isCloned = false;
    this.isOnce = false;
    this.asyncFactory = asyncFactory;
    this.asyncMeta = undefined;
    this.isAsyncPlaceholder = false;
  }

  // 已弃用：为了向后兼容而定义的componentInstance别名
  /* istanbul ignore next */
  get child(): Component | void {
    return this.componentInstance;
  }
}
```

从上面的代码中可以看出：`VNode类`中包含了描述一个真实DOM节点所需要的一系列属性，如`tag`表示节点的标签名，`text`表示节点中包含的文本，`children`表示该节点包含的子节点等。通过属性之间不同的搭配，就可以描述出如下类型的真实DOM节点

- 注释节点
- 文本节点
- 克隆节点
- 元素节点
- 组件节点
- 函数式组件节点

接下来我们挨个分析这些真实DOM节点

## 注释节点

注释节点的实现非常简单，直接看源码

```js
export const createEmptyVNode = (text: string = '') => {
  const node = new VNode()
  node.text = text
  node.isComment = true
  return node
}
```

可以看出，注释节点只定义了两个属性，一个是`isComment`，另一个是`text`，其余属性都是默认值。

所以一个真实的注释节点

```html
<!-- 注释节点 -->
```

所对应的`vnode`的数据结构如下所示

```js
{
  text: '注释节点',
  isComment: true
}
```

## 文本节点

文本节点的代码也很简单

```js
export function createTextVNode (val: string | number) {
  return new VNode(undefined, undefined, undefined, String(val))
}
```

可以看出，创建文本节点时，只初始化了一个`text`属性。

所以一个真实的文本节点，所对应的`vnode`的数据结构如下所示

```js
{
  text: '文本节点'
}
```

## 克隆节点

克隆节点是将现有节点的属性复制到新节点中，让新创建的节点和被克隆的节点的属性保持一致。它的作用是优化静态节点和插槽节点，我们后续介绍。

```js
export function cloneVNode (vnode: VNode): VNode {
  const cloned = new VNode(
    vnode.tag,
    vnode.data,
    vnode.children,
    vnode.text,
    vnode.elm,
    vnode.context,
    vnode.componentOptions,
    vnode.asyncFactory
  )
  cloned.ns = vnode.ns
  cloned.isStatic = vnode.isStatic
  cloned.key = vnode.key
  cloned.isComment = vnode.isComment
  cloned.fnContext = vnode.fnContext
  cloned.fnOptions = vnode.fnOptions
  cloned.fnScopeId = vnode.fnScopeId
  cloned.asyncMeta = vnode.asyncMeta
  cloned.isCloned = true
  return cloned
}
```

可以看出，克隆现有节点时，就是将现有节点的属性全部复制到新节点主中。

现有节点和克隆节点的唯一区别就是`isCloned`属性，后续使用中可以用来区分是否为克隆节点。

## 元素节点

元素节点在Vue中用来表示真实DOM节点，通常具有以下特性：

- 有描述节点标签名词的tag属性
- 可以拥有描述节点属性（如id、class、style等）的data属性。
- 可以包含其他元素节点、文本节点、注释节点等作为其子节点的children属性。

由于元素节点所包含的情况相比而言比较复杂，源码中并没有直接预设，我们举个简单的例子说明下：

```html
<div id="myDiv" class="container">
  <p>Hello, World!</p>
</div>
```

上述真实的元素节点对应vnode如下

```js
{
  tag: 'div',
  data: {
    attrs: {
      id: 'myDiv',
      class: 'container'
    }
  },
  children: [
    {
      tag: 'p',
      children: [
        {
          text: 'Hello, World!'
        }
      ]
    }
  ]
}
```

在上述vnode描述中，使用了两个嵌套的元素节点。外层的元素节点是`<div>`，具有id属性为"myDiv"和class属性为"container"。它的子节点是一个`<p>`元素节点，其中包含文本节点 "Hello, World!"。

## 组件节点

组件节点和元素节点类似，区别在于有以下两个独有的属性

- `componentOptions`：顾名思义，就是组件节点的选项参数，其中包含 propsData、tag和 children 等信息
- `componentInstance`：组件的实例，也是Vue的实例。事实上，在Vue中，每个组件 componentInstance 都是一个 Vue 实例

一个组件节点:

```html
<child></child>
```

所对应的 vnode 是下面的样子

```js
{
  tag: 'vue-component-1-child',
  componentInstance: {...},
  componentOptions: {...},
  context: {...},
  data: {...},
  ...
}
```

## 函数式组件节点

函数式组件节点跟组件节点类似，区别在于有以下两个独有的属性

- `fnContext`：函数式组件节点的真实上下文vm
- `fnOptions`：用于SSR缓存的组件选项

## 静态节点

严格意义上来讲，静态节点可以是上述任意节点类型之一。因为静态节点的定义是渲染到界面上后，就不会随着状态发生变化的节点。

举个简单的例子：

```html
<p>这是一个静态节点</p>
```

上面这个元素节点就属于静态节点，它不会随着vue实例中状态变化而发生变化，一旦被渲染到界面上后，除非被删除，否则永远都不许要重新渲染。

## 总结

为了方便描述`虚拟DOM`，Vue 封装了`VNode`基类，可以在此基础上，生成不同类型的`vnode`实例，代表不同类型的真实DOM元素。
