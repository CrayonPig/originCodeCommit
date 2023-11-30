(window.webpackJsonp=window.webpackJsonp||[]).push([[69],{375:function(t,s,n){"use strict";n.r(s);var a=n(14),e=Object(a.a)({},(function(){var t=this,s=t._self._c;return s("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[s("h1",{attrs:{id:"初始化阶段-initrender"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#初始化阶段-initrender"}},[t._v("#")]),t._v(" 初始化阶段(initRender)")]),t._v(" "),s("p",[s("code",[t._v("initRender")]),t._v(" 用于初始化组件实例的渲染相关属性和方法。源码在 "),s("code",[t._v("src/core/instance/render.js")])]),t._v(" "),s("div",{staticClass:"language-js line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-js"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("export")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("initRender")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token parameter"}},[s("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("vm")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" Component")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 用于存储组件自身实例的虚拟节点，表示组件在虚拟DOM树中的位置。")]),t._v("\n  vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("_vnode "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("null")]),t._v(" \n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//缓存 v-once 指令生成的静态树")]),t._v("\n  vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("_staticTrees "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("null")]),t._v(" \n\n  "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" options "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$options\n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 父组件创建的占位节点")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" parentVnode "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$vnode "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" options"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("_parentVnode \n  "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" renderContext "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" parentVnode "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("&&")]),t._v(" parentVnode"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("context\n  \n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 插槽内容的集合")]),t._v("\n  vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$slots "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("resolveSlots")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("options"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("_renderChildren"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" renderContext"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 包含了具名插槽的作用域插槽函数的对象")]),t._v("\n  vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$scopedSlots "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" emptyObject\n\n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// _c 方法的参数顺序是：标签名、数据对象、子节点数组、规范化类型、是否总是规范化。")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 在组件中创建虚拟节点的辅助函数，实际上就是调用 $createElement。")]),t._v("\n  vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function-variable function"}},[t._v("_c")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("a"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" b"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" c"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" d")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("createElement")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" a"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" b"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" c"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" d"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("false")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 用于创建虚拟节点，即用于渲染组件的模板。")]),t._v("\n  vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function-variable function"}},[t._v("$createElement")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("a"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" b"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" c"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" d")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("createElement")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" a"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" b"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" c"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" d"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("true")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 获取父组件的虚拟节点")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" parentData "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" parentVnode "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("&&")]),t._v(" parentVnode"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("data\n\n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 将 $attrs 添加到组件实例，并指定其初始值为父虚拟节点的 attrs 属性或空对象（emptyObject）")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 将 $listeners 添加到组件实例，并指定其初始值为选项对象中的 _parentListeners 属性或空对象（emptyObject）。")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("defineReactive")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'$attrs'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" parentData "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("&&")]),t._v(" parentData"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("attrs "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("||")]),t._v(" emptyObject"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("null")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("true")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("defineReactive")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'$listeners'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" options"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("_parentListeners "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("||")]),t._v(" emptyObject"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("null")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("true")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")]),s("div",{pre:!0,attrs:{class:"m-mdic-copy-wrapper"}},[s("div",{pre:!0,attrs:{class:"u-mdic-copy-notify",id:"j-notify-1701341399711-63498"}},[t._v("成功")]),s("button",{pre:!0,attrs:{class:"u-mdic-copy-btn j-mdic-copy-btn","data-mdic-content":"export function initRender (vm: Component) {\n  // 用于存储组件自身实例的虚拟节点，表示组件在虚拟DOM树中的位置。\n  vm._vnode = null \n  //缓存 v-once 指令生成的静态树\n  vm._staticTrees = null \n\n  const options = vm.$options\n  // 父组件创建的占位节点\n  const parentVnode = vm.$vnode = options._parentVnode \n  const renderContext = parentVnode && parentVnode.context\n  \n  // 插槽内容的集合\n  vm.$slots = resolveSlots(options._renderChildren, renderContext)\n\n  // 包含了具名插槽的作用域插槽函数的对象\n  vm.$scopedSlots = emptyObject\n\n  // _c 方法的参数顺序是：标签名、数据对象、子节点数组、规范化类型、是否总是规范化。\n  // 在组件中创建虚拟节点的辅助函数，实际上就是调用 $createElement。\n  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)\n\n  // 用于创建虚拟节点，即用于渲染组件的模板。\n  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)\n\n  // 获取父组件的虚拟节点\n  const parentData = parentVnode && parentVnode.data\n\n  // 将 $attrs 添加到组件实例，并指定其初始值为父虚拟节点的 attrs 属性或空对象（emptyObject）\n  // 将 $listeners 添加到组件实例，并指定其初始值为选项对象中的 _parentListeners 属性或空对象（emptyObject）。\n  defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, null, true)\n  defineReactive(vm, '$listeners', options._parentListeners || emptyObject, null, true)\n}\n","data-mdic-attach-content":"","data-mdic-notify-id":"j-notify-1701341399711-63498","data-mdic-notify-delay":"2000","data-mdic-copy-fail-text":"copy fail",onclick:"!function(t){const e={copy:(t='',e='')=>new Promise((c,o)=>{const n=document.createElement('textarea'),d=e?`\\n\\n${e}`:e;n.value=`${t}${d}`,document.body.appendChild(n),n.select();try{const t=document.execCommand('copy');document.body.removeChild(n),t?c():o()}catch(t){document.body.removeChild(n),o()}}),btnClick(t){const c=t&&t.dataset?t.dataset:{},o=c.mdicNotifyId,n=document.getElementById(o),d=c.mdicNotifyDelay,i=c.mdicCopyFailText;e.copy(c.mdicContent,c.mdicAttachContent).then(()=>{n.style.display='block',setTimeout(()=>{n.style.display='none'},d)}).catch(()=>{alert(i)})}};e.btnClick(t)}(this);"}},[t._v("复制代码")])])]),t._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[t._v("1")]),s("br"),s("span",{staticClass:"line-number"},[t._v("2")]),s("br"),s("span",{staticClass:"line-number"},[t._v("3")]),s("br"),s("span",{staticClass:"line-number"},[t._v("4")]),s("br"),s("span",{staticClass:"line-number"},[t._v("5")]),s("br"),s("span",{staticClass:"line-number"},[t._v("6")]),s("br"),s("span",{staticClass:"line-number"},[t._v("7")]),s("br"),s("span",{staticClass:"line-number"},[t._v("8")]),s("br"),s("span",{staticClass:"line-number"},[t._v("9")]),s("br"),s("span",{staticClass:"line-number"},[t._v("10")]),s("br"),s("span",{staticClass:"line-number"},[t._v("11")]),s("br"),s("span",{staticClass:"line-number"},[t._v("12")]),s("br"),s("span",{staticClass:"line-number"},[t._v("13")]),s("br"),s("span",{staticClass:"line-number"},[t._v("14")]),s("br"),s("span",{staticClass:"line-number"},[t._v("15")]),s("br"),s("span",{staticClass:"line-number"},[t._v("16")]),s("br"),s("span",{staticClass:"line-number"},[t._v("17")]),s("br"),s("span",{staticClass:"line-number"},[t._v("18")]),s("br"),s("span",{staticClass:"line-number"},[t._v("19")]),s("br"),s("span",{staticClass:"line-number"},[t._v("20")]),s("br"),s("span",{staticClass:"line-number"},[t._v("21")]),s("br"),s("span",{staticClass:"line-number"},[t._v("22")]),s("br"),s("span",{staticClass:"line-number"},[t._v("23")]),s("br"),s("span",{staticClass:"line-number"},[t._v("24")]),s("br"),s("span",{staticClass:"line-number"},[t._v("25")]),s("br"),s("span",{staticClass:"line-number"},[t._v("26")]),s("br"),s("span",{staticClass:"line-number"},[t._v("27")]),s("br"),s("span",{staticClass:"line-number"},[t._v("28")]),s("br"),s("span",{staticClass:"line-number"},[t._v("29")]),s("br"),s("span",{staticClass:"line-number"},[t._v("30")]),s("br"),s("span",{staticClass:"line-number"},[t._v("31")]),s("br"),s("span",{staticClass:"line-number"},[t._v("32")]),s("br")])]),s("p",[t._v("函数内部的逻辑如下：")]),t._v(" "),s("ol",[s("li",[t._v("初始化 "),s("code",[t._v("_vnode")]),t._v(" 属性为 "),s("code",[t._v("null")]),t._v("，该属性表示组件实例的根虚拟节点。")]),t._v(" "),s("li",[t._v("初始化 "),s("code",[t._v("_staticTrees")]),t._v(" 属性为 "),s("code",[t._v("null")]),t._v("，用于缓存 "),s("code",[t._v("v-once")]),t._v(" 指令生成的静态树。")]),t._v(" "),s("li",[t._v("获取组件实例的选项对象 "),s("code",[t._v("$options")]),t._v("，并将选项对象中的 "),s("code",[t._v("_parentVnode")]),t._v(" 赋值给 "),s("code",[t._v("$vnode")]),t._v(" 属性，表示组件实例在父树中的占位节点。")]),t._v(" "),s("li",[t._v("获取父树的渲染上下文 "),s("code",[t._v("renderContext")]),t._v("。")]),t._v(" "),s("li",[t._v("使用 "),s("code",[t._v("resolveSlots")]),t._v(" 函数解析渲染选项对象的 "),s("code",[t._v("_renderChildren")]),t._v(" 属性，将结果赋值给 "),s("code",[t._v("$slots")]),t._v(" 属性，用于处理插槽相关的内容。")]),t._v(" "),s("li",[t._v("初始化 "),s("code",[t._v("$scopedSlots")]),t._v(" 属性为一个空对象，表示作用域插槽。")]),t._v(" "),s("li",[t._v("将 "),s("code",[t._v("_c")]),t._v(" 方法绑定到组件实例上，该方法用于创建虚拟节点，并在创建时获取正确的渲染上下文。"),s("code",[t._v("_c")]),t._v(" 方法的参数顺序是：标签名、数据对象、子节点数组、规范化类型、是否总是规范化。")]),t._v(" "),s("li",[t._v("将 "),s("code",[t._v("$createElement")]),t._v(" 方法绑定到组件实例上，该方法用于创建虚拟节点，其中规范化是始终应用的。"),s("code",[t._v("$createElement")]),t._v(" 方法与 "),s("code",[t._v("_c")]),t._v(" 方法类似，但在用户编写的渲染函数中使用。")]),t._v(" "),s("li",[t._v("使用 "),s("code",[t._v("defineReactive")]),t._v(" 函数定义 "),s("code",[t._v("$attrs")]),t._v(" 和 "),s("code",[t._v("$listeners")]),t._v(" 两个响应式属性，它们被暴露出来，方便高阶组件的创建和使用。")])]),t._v(" "),s("h2",{attrs:{id:"vnode-和-vnode"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#vnode-和-vnode"}},[t._v("#")]),t._v(" _vnode 和 $vnode")]),t._v(" "),s("p",[t._v("乍一看，这两个属性好像差不多，只是前缀符号有区别。很容易让人迷惑。")]),t._v(" "),s("ul",[s("li",[t._v("两个对象都是vnode类型对象")]),t._v(" "),s("li",[s("code",[t._v("_vnode")]),t._v(" 是组件实例的私有属性，表示组件的根虚拟节点，用于组件内部的渲染过程。")]),t._v(" "),s("li",[s("code",[t._v("$vnode")]),t._v(" 是组件实例的公共属性，表示组件在父组件中的占位虚拟节点，用于获取组件在父组件中的位置和上下文信息。")])]),t._v(" "),s("p",[t._v("从源码的角度来讲 "),s("code",[t._v("_parentVnode")]),t._v(" 首先赋值给了 "),s("code",[t._v("$vnode")]),t._v(" ，然后又赋值给了"),s("code",[t._v("vnode.parent")]),t._v("。\n然而在后续渲染的"),s("code",[t._v("_update")]),t._v("函数内"),s("code",[t._v("vnode")]),t._v("又赋值给了"),s("code",[t._v("_vnode")]),t._v("，所以"),s("code",[t._v("_vnode")]),t._v("其实是"),s("code",[t._v("$vnode")]),t._v("的子集")]),t._v(" "),s("h2",{attrs:{id:"resolveslots"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#resolveslots"}},[t._v("#")]),t._v(" resolveSlots")]),t._v(" "),s("p",[s("code",[t._v("resolveSlots")]),t._v(" 函数的作用是解析组件实例的插槽内容，并返回一个对象，其中包含了解析后的插槽内容。源码在"),s("code",[t._v("src/core/instance/render-helpers/resolve-slots.js")])]),t._v(" "),s("div",{staticClass:"language-js line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-js"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("export")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("resolveSlots")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token parameter"}},[s("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("children")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("?")]),t._v("Array"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("<")]),t._v("VNode"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(">")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("context")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("?")]),t._v("Component")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("key"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" string"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" Array"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("<")]),t._v("VNode"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(">")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" slots "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 如果没有子节点，返回一个空的插槽对象。")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("!")]),t._v("children"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" slots\n  "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 遍历每个子节点以解析插槽。")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("for")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" i "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" l "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" children"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("length"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" i "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("<")]),t._v(" l"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" i"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("++")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" child "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" children"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("i"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" data "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" child"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("data\n\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 如果节点被解析为Vue插槽节点，则删除插槽属性。以确保在后续的处理中不会将其误解为普通的属性")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("data "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("&&")]),t._v(" data"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("attrs "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("&&")]),t._v(" data"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("attrs"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("slot"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("delete")]),t._v(" data"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("attrs"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("slot\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 相同上下文表明是一个具名插槽")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("child"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("context "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("===")]),t._v(" context "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("||")]),t._v(" child"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("fnContext "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("===")]),t._v(" context"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("&&")]),t._v("\n      data "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("&&")]),t._v(" data"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("slot "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("!=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("null")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" name "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" data"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("slot\n      "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" slot "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("slots"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("name"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("||")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("slots"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("name"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("child"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("tag "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("===")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'template'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        slot"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("push")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("apply")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("slot"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" child"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("children "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("||")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("else")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        slot"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("push")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("child"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("else")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 非具名插槽直接存入")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("slots"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("default "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("||")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("slots"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("default "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("push")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("child"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 忽略只包含空格的插槽")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("for")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" name "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("in")]),t._v(" slots"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("slots"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("name"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("every")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("isWhitespace"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("delete")]),t._v(" slots"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("name"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" slots\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")]),s("div",{pre:!0,attrs:{class:"m-mdic-copy-wrapper"}},[s("div",{pre:!0,attrs:{class:"u-mdic-copy-notify",id:"j-notify-1701341399712-43510"}},[t._v("成功")]),s("button",{pre:!0,attrs:{class:"u-mdic-copy-btn j-mdic-copy-btn","data-mdic-content":"export function resolveSlots (\n  children: ?Array<VNode>,\n  context: ?Component\n): { [key: string]: Array<VNode> } {\n  const slots = {}\n\n  // 如果没有子节点，返回一个空的插槽对象。\n  if (!children) {\n    return slots\n  }\n\n  // 遍历每个子节点以解析插槽。\n  for (let i = 0, l = children.length; i < l; i++) {\n    const child = children[i]\n    const data = child.data\n\n    // 如果节点被解析为Vue插槽节点，则删除插槽属性。以确保在后续的处理中不会将其误解为普通的属性\n    if (data && data.attrs && data.attrs.slot) {\n      delete data.attrs.slot\n    }\n    // 相同上下文表明是一个具名插槽\n    if ((child.context === context || child.fnContext === context) &&\n      data && data.slot != null\n    ) {\n      const name = data.slot\n      const slot = (slots[name] || (slots[name] = []))\n      if (child.tag === 'template') {\n        slot.push.apply(slot, child.children || [])\n      } else {\n        slot.push(child)\n      }\n    } else {\n      // 非具名插槽直接存入\n      (slots.default || (slots.default = [])).push(child)\n    }\n  }\n  // 忽略只包含空格的插槽\n  for (const name in slots) {\n    if (slots[name].every(isWhitespace)) {\n      delete slots[name]\n    }\n  }\n  return slots\n}\n","data-mdic-attach-content":"","data-mdic-notify-id":"j-notify-1701341399712-43510","data-mdic-notify-delay":"2000","data-mdic-copy-fail-text":"copy fail",onclick:"!function(t){const e={copy:(t='',e='')=>new Promise((c,o)=>{const n=document.createElement('textarea'),d=e?`\\n\\n${e}`:e;n.value=`${t}${d}`,document.body.appendChild(n),n.select();try{const t=document.execCommand('copy');document.body.removeChild(n),t?c():o()}catch(t){document.body.removeChild(n),o()}}),btnClick(t){const c=t&&t.dataset?t.dataset:{},o=c.mdicNotifyId,n=document.getElementById(o),d=c.mdicNotifyDelay,i=c.mdicCopyFailText;e.copy(c.mdicContent,c.mdicAttachContent).then(()=>{n.style.display='block',setTimeout(()=>{n.style.display='none'},d)}).catch(()=>{alert(i)})}};e.btnClick(t)}(this);"}},[t._v("复制代码")])])]),t._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[t._v("1")]),s("br"),s("span",{staticClass:"line-number"},[t._v("2")]),s("br"),s("span",{staticClass:"line-number"},[t._v("3")]),s("br"),s("span",{staticClass:"line-number"},[t._v("4")]),s("br"),s("span",{staticClass:"line-number"},[t._v("5")]),s("br"),s("span",{staticClass:"line-number"},[t._v("6")]),s("br"),s("span",{staticClass:"line-number"},[t._v("7")]),s("br"),s("span",{staticClass:"line-number"},[t._v("8")]),s("br"),s("span",{staticClass:"line-number"},[t._v("9")]),s("br"),s("span",{staticClass:"line-number"},[t._v("10")]),s("br"),s("span",{staticClass:"line-number"},[t._v("11")]),s("br"),s("span",{staticClass:"line-number"},[t._v("12")]),s("br"),s("span",{staticClass:"line-number"},[t._v("13")]),s("br"),s("span",{staticClass:"line-number"},[t._v("14")]),s("br"),s("span",{staticClass:"line-number"},[t._v("15")]),s("br"),s("span",{staticClass:"line-number"},[t._v("16")]),s("br"),s("span",{staticClass:"line-number"},[t._v("17")]),s("br"),s("span",{staticClass:"line-number"},[t._v("18")]),s("br"),s("span",{staticClass:"line-number"},[t._v("19")]),s("br"),s("span",{staticClass:"line-number"},[t._v("20")]),s("br"),s("span",{staticClass:"line-number"},[t._v("21")]),s("br"),s("span",{staticClass:"line-number"},[t._v("22")]),s("br"),s("span",{staticClass:"line-number"},[t._v("23")]),s("br"),s("span",{staticClass:"line-number"},[t._v("24")]),s("br"),s("span",{staticClass:"line-number"},[t._v("25")]),s("br"),s("span",{staticClass:"line-number"},[t._v("26")]),s("br"),s("span",{staticClass:"line-number"},[t._v("27")]),s("br"),s("span",{staticClass:"line-number"},[t._v("28")]),s("br"),s("span",{staticClass:"line-number"},[t._v("29")]),s("br"),s("span",{staticClass:"line-number"},[t._v("30")]),s("br"),s("span",{staticClass:"line-number"},[t._v("31")]),s("br"),s("span",{staticClass:"line-number"},[t._v("32")]),s("br"),s("span",{staticClass:"line-number"},[t._v("33")]),s("br"),s("span",{staticClass:"line-number"},[t._v("34")]),s("br"),s("span",{staticClass:"line-number"},[t._v("35")]),s("br"),s("span",{staticClass:"line-number"},[t._v("36")]),s("br"),s("span",{staticClass:"line-number"},[t._v("37")]),s("br"),s("span",{staticClass:"line-number"},[t._v("38")]),s("br"),s("span",{staticClass:"line-number"},[t._v("39")]),s("br"),s("span",{staticClass:"line-number"},[t._v("40")]),s("br"),s("span",{staticClass:"line-number"},[t._v("41")]),s("br"),s("span",{staticClass:"line-number"},[t._v("42")]),s("br"),s("span",{staticClass:"line-number"},[t._v("43")]),s("br"),s("span",{staticClass:"line-number"},[t._v("44")]),s("br")])]),s("h2",{attrs:{id:"createelement-和-c"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#createelement-和-c"}},[t._v("#")]),t._v(" $createElement 和 _c")]),t._v(" "),s("p",[s("code",[t._v("$createElement")]),t._v(" 和 "),s("code",[t._v("_c")]),t._v(" 都是用于创建虚拟节点的方法，但在使用方式和用途上有一些区别。")]),t._v(" "),s("ol",[s("li",[s("p",[s("code",[t._v("$createElement")]),t._v(" 方法：")]),t._v(" "),s("ul",[s("li",[t._v("用途："),s("code",[t._v("$createElement")]),t._v(" 方法是 Vue 实例的方法，用于在用户编写的渲染函数中创建虚拟节点。用户在编写组件的 "),s("code",[t._v("render")]),t._v(" 函数时，可以使用 "),s("code",[t._v("$createElement")]),t._v(" 方法来手动创建虚拟节点。")]),t._v(" "),s("li",[t._v("参数顺序："),s("code",[t._v("$createElement")]),t._v(" 方法的参数顺序是标签名、数据对象、子节点数组、规范化类型。")]),t._v(" "),s("li",[t._v("规范化："),s("code",[t._v("$createElement")]),t._v(" 方法的规范化是始终应用的，即会对子节点进行规范化处理。")]),t._v(" "),s("li",[t._v("示例使用："),s("code",[t._v("$createElement('div', { class: 'my-class' }, [ $createElement('span', 'Hello World') ])")])])])]),t._v(" "),s("li",[s("p",[s("code",[t._v("_c")]),t._v(" 方法：")]),t._v(" "),s("ul",[s("li",[t._v("用途："),s("code",[t._v("_c")]),t._v(" 方法是 Vue 内部使用的方法，用于在模板编译阶段创建虚拟节点。模板编译将模板转换为渲染函数，而在渲染函数中会使用 "),s("code",[t._v("_c")]),t._v(" 方法来创建虚拟节点。")]),t._v(" "),s("li",[t._v("参数顺序："),s("code",[t._v("_c")]),t._v(" 方法的参数顺序是标签名、数据对象、子节点数组、规范化类型、是否总是规范化。")]),t._v(" "),s("li",[t._v("规范化：在使用 "),s("code",[t._v("_c")]),t._v(" 方法创建虚拟节点时，是否进行规范化处理取决于最后一个参数，即是否总是规范化。")]),t._v(" "),s("li",[t._v("示例使用："),s("code",[t._v("_c('div', { class: 'my-class' }, [ _c('span', 'Hello World') ], 0, false)")])])])])]),t._v(" "),s("p",[t._v("总体来说"),s("code",[t._v("$createElement")]),t._v(" 方法是供用户在编写组件的渲染函数时使用的，而 "),s("code",[t._v("_c")]),t._v(" 方法是在 Vue 内部的模板编译过程中使用的。它们在参数顺序和规范化处理上略有不同，以满足不同的使用场景和需求。")])])}),[],!1,null,null,null);s.default=e.exports}}]);