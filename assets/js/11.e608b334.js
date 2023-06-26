(window.webpackJsonp=window.webpackJsonp||[]).push([[11],{285:function(t,s,a){"use strict";a.r(s);var n=a(14),e=Object(n.a)({},(function(){var t=this,s=t._self._c;return s("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[s("h1",{attrs:{id:"初始化阶段-initlifecycle"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#初始化阶段-initlifecycle"}},[t._v("#")]),t._v(" 初始化阶段(initLifecycle)")]),t._v(" "),s("p",[t._v("本小结介绍生命周期初始化阶段的第二个步骤，也是第一个初始化函数 "),s("code",[t._v("initLifecycle")]),t._v("。顾名思义，初始化生命周期函数。代码位于 "),s("code",[t._v("src/core/instance/lifecycle.js")]),t._v("。")]),t._v(" "),s("div",{staticClass:"language-js line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-js"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("export")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("initLifecycle")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token parameter"}},[s("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("vm")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" Component")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" options "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$options\n\n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// locate first non-abstract parent")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" parent "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" options"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("parent\n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 如果存在父组件实例并且当前组件实例不是抽象组件（abstract为false）")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("parent "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("&&")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("!")]),t._v("options"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("abstract"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 当父组件实例是抽象组件且父组件实例的父组件存在时，执行循环体。保证最后找到的父组件不是抽象组件")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("while")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("parent"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$options"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("abstract "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("&&")]),t._v(" parent"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$parent"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n      parent "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" parent"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$parent\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 将当前组件加入到父组件中的列表中")]),t._v("\n    parent"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$children"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("push")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 父组件实例")]),t._v("\n  vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$parent "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" parent\n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 根组件实例")]),t._v("\n  vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$root "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" parent "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("?")]),t._v(" parent"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$root "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" vm\n\n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 子组件实例数组")]),t._v("\n  vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$children "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// ref 引用对象")]),t._v("\n  vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$refs "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n  vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("_watcher "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("null")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 渲染 watcher 实例")]),t._v("\n  vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("_inactive "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("null")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 是否处于非激活状态")]),t._v("\n  vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("_directInactive "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("false")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 是否直接处于非激活状态")]),t._v("\n  vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("_isMounted "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("false")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 是否已挂载")]),t._v("\n  vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("_isDestroyed "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("false")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 是否已销毁")]),t._v("\n  vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("_isBeingDestroyed "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("false")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 是否正在销毁")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])]),t._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[t._v("1")]),s("br"),s("span",{staticClass:"line-number"},[t._v("2")]),s("br"),s("span",{staticClass:"line-number"},[t._v("3")]),s("br"),s("span",{staticClass:"line-number"},[t._v("4")]),s("br"),s("span",{staticClass:"line-number"},[t._v("5")]),s("br"),s("span",{staticClass:"line-number"},[t._v("6")]),s("br"),s("span",{staticClass:"line-number"},[t._v("7")]),s("br"),s("span",{staticClass:"line-number"},[t._v("8")]),s("br"),s("span",{staticClass:"line-number"},[t._v("9")]),s("br"),s("span",{staticClass:"line-number"},[t._v("10")]),s("br"),s("span",{staticClass:"line-number"},[t._v("11")]),s("br"),s("span",{staticClass:"line-number"},[t._v("12")]),s("br"),s("span",{staticClass:"line-number"},[t._v("13")]),s("br"),s("span",{staticClass:"line-number"},[t._v("14")]),s("br"),s("span",{staticClass:"line-number"},[t._v("15")]),s("br"),s("span",{staticClass:"line-number"},[t._v("16")]),s("br"),s("span",{staticClass:"line-number"},[t._v("17")]),s("br"),s("span",{staticClass:"line-number"},[t._v("18")]),s("br"),s("span",{staticClass:"line-number"},[t._v("19")]),s("br"),s("span",{staticClass:"line-number"},[t._v("20")]),s("br"),s("span",{staticClass:"line-number"},[t._v("21")]),s("br"),s("span",{staticClass:"line-number"},[t._v("22")]),s("br"),s("span",{staticClass:"line-number"},[t._v("23")]),s("br"),s("span",{staticClass:"line-number"},[t._v("24")]),s("br"),s("span",{staticClass:"line-number"},[t._v("25")]),s("br"),s("span",{staticClass:"line-number"},[t._v("26")]),s("br"),s("span",{staticClass:"line-number"},[t._v("27")]),s("br"),s("span",{staticClass:"line-number"},[t._v("28")]),s("br"),s("span",{staticClass:"line-number"},[t._v("29")]),s("br"),s("span",{staticClass:"line-number"},[t._v("30")]),s("br"),s("span",{staticClass:"line-number"},[t._v("31")]),s("br"),s("span",{staticClass:"line-number"},[t._v("32")]),s("br")])]),s("div",{staticClass:"custom-block tip"},[s("p",{staticClass:"custom-block-title"},[t._v("TIP")]),t._v(" "),s("p",[t._v("以 "),s("code",[t._v("$")]),t._v(" 开头的属性是提供给用户使用的外部属性，以 "),s("code",[t._v("_")]),t._v(" 开头的是提供给内部使用的内部属性。")])]),t._v(" "),s("p",[t._v("我们可以看到 "),s("code",[t._v("initLifecycle")]),t._v(" 的代码并不复杂，只是在 Vue 实例上设置一些属性并提供默认值。")]),t._v(" "),s("p",[t._v("有意思的是挂载"),s("code",[t._v("$parent")]),t._v(" 属性和 "),s("code",[t._v("$root")]),t._v(" 属性，我们下面逐个分析")]),t._v(" "),s("h2",{attrs:{id:"parent"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#parent"}},[t._v("#")]),t._v(" $parent")]),t._v(" "),s("div",{staticClass:"language-js line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-js"}},[s("code",[s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// locate first non-abstract parent")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" parent "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" options"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("parent\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 如果存在父组件实例并且当前组件实例不是抽象组件（abstract为false）")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("parent "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("&&")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("!")]),t._v("options"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("abstract"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 当父组件实例是抽象组件且父组件实例的父组件存在时，执行循环体。保证最后找到的父组件不是抽象组件")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("while")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("parent"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$options"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("abstract "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("&&")]),t._v(" parent"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$parent"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    parent "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" parent"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$parent\n  "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 将当前组件加入到父组件中的列表中")]),t._v("\n  parent"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$children"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("push")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 父组件实例")]),t._v("\nvm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$parent "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" parent\n")])]),t._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[t._v("1")]),s("br"),s("span",{staticClass:"line-number"},[t._v("2")]),s("br"),s("span",{staticClass:"line-number"},[t._v("3")]),s("br"),s("span",{staticClass:"line-number"},[t._v("4")]),s("br"),s("span",{staticClass:"line-number"},[t._v("5")]),s("br"),s("span",{staticClass:"line-number"},[t._v("6")]),s("br"),s("span",{staticClass:"line-number"},[t._v("7")]),s("br"),s("span",{staticClass:"line-number"},[t._v("8")]),s("br"),s("span",{staticClass:"line-number"},[t._v("9")]),s("br"),s("span",{staticClass:"line-number"},[t._v("10")]),s("br"),s("span",{staticClass:"line-number"},[t._v("11")]),s("br"),s("span",{staticClass:"line-number"},[t._v("12")]),s("br"),s("span",{staticClass:"line-number"},[t._v("13")]),s("br"),s("span",{staticClass:"line-number"},[t._v("14")]),s("br")])]),s("div",{staticClass:"custom-block tip"},[s("p",{staticClass:"custom-block-title"},[t._v("什么是抽象组件？")]),t._v(" "),s("p",[t._v("在 Vue 中，抽象组件是一种特殊的组件，它们不会被渲染成真实的 DOM 元素，而是作为功能性的包装组件存在，用于提供一些可复用的逻辑或行为。")])]),t._v(" "),s("p",[t._v("首先如果存在父组件实例并且当前组件实例不是抽象组件时，执行"),s("code",[t._v("while")]),t._v("，直到找到父组件不是抽象组件或者没有父组件为止。然后将其赋值给"),s("code",[t._v("vm.$parent")]),t._v("。这样确保在子组件中，可以通过"),s("code",[t._v("$parent")]),t._v("找到父组件。")]),t._v(" "),s("p",[t._v("将当前组件加入到父组件的列表中，后续在父组件中，就可以通过"),s("code",[t._v("$children")]),t._v("找到子组件。")]),t._v(" "),s("h2",{attrs:{id:"root"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#root"}},[t._v("#")]),t._v(" $root")]),t._v(" "),s("p",[t._v("挂载"),s("code",[t._v("$root")]),t._v("的方法很简单，只有一行代码")]),t._v(" "),s("div",{staticClass:"language-js line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-js"}},[s("code",[s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 根组件实例")]),t._v("\nvm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$root "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" parent "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("?")]),t._v(" parent"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$root "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" vm\n")])]),t._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[t._v("1")]),s("br"),s("span",{staticClass:"line-number"},[t._v("2")]),s("br")])]),s("p",[t._v("如果当前组件没有父组件，那么它自己就是根组件，它的"),s("code",[t._v("$root")]),t._v("属性还是它自己。而它的子组件的"),s("code",[t._v("$root")]),t._v("用的是"),s("code",[t._v("parent.$root")]),t._v("，相当于还是它自己，其孙组件的"),s("code",[t._v("$root")]),t._v("属性沿用其子组件的"),s("code",[t._v("$root")]),t._v("，一次类推。")]),t._v(" "),s("p",[t._v("我们可以发现，这其实就是一个自顶向下将根组件的"),s("code",[t._v("$root")]),t._v("依次传递给每一个子组件的过程。")]),t._v(" "),s("h2",{attrs:{id:"总结"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#总结"}},[t._v("#")]),t._v(" 总结")]),t._v(" "),s("p",[s("code",[t._v("initLifecycle")]),t._v(" 函数功能并不复杂，只是对 Vue 实例进行一些属性的初始化。其中，最主要的是挂载 "),s("code",[t._v("$parent")]),t._v(" 和 "),s("code",[t._v("$root")]),t._v(" 属性，使得组件树中的每一个组件都可以通过 "),s("code",[t._v("$parent")]),t._v(" 和 "),s("code",[t._v("$root")]),t._v(" 访问到其相关的父组件和根组件。通过这些初始化，为 Vue 的生命周期的后续流程铺设了基础。")])])}),[],!1,null,null,null);s.default=e.exports}}]);