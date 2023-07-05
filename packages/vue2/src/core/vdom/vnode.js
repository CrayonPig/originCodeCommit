/* @flow */

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

// 注释节点
export const createEmptyVNode = (text: string = '') => {
  const node = new VNode()
  node.text = text
  node.isComment = true
  return node
}

// 文本节点
export function createTextVNode (val: string | number) {
  return new VNode(undefined, undefined, undefined, String(val))
}

// optimized shallow clone
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.
// 克隆节点
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
