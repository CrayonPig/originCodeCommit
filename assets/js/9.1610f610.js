(window.webpackJsonp=window.webpackJsonp||[]).push([[9],{288:function(t,n,e){t.exports=e.p+"assets/img/lifecycle-mount.6a76bb54.png"},289:function(t,n,e){t.exports=e.p+"assets/img/lifecycle-mount1.e43324ab.png"},355:function(t,n,e){"use strict";e.r(n);var a=e(14),s=Object(a.a)({},(function(){var t=this,n=t._self._c;return n("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[n("h1",{attrs:{id:"挂载阶段"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#挂载阶段"}},[t._v("#")]),t._v(" 挂载阶段")]),t._v(" "),n("p",[t._v("模板编译阶段完成后，就进入到了挂载阶段，从官方的生命周期中，我们可以发现此阶段涉及到的生命周期比较多，有"),n("code",[t._v("beforeMount")]),t._v("、"),n("code",[t._v("mounted")]),t._v("、"),n("code",[t._v("beforeUpdate")]),t._v("、"),n("code",[t._v("updated")]),t._v("四个。覆盖了我们日常开发中的大部分生命周期。在这个期间，Vue主要做了两件事：")]),t._v(" "),n("ul",[n("li",[t._v("挂载DOM：创建Vue实例并用其替换"),n("code",[t._v("el")]),t._v("选项对应的DOM元素，再将模板内容渲染到视图中")]),t._v(" "),n("li",[t._v("数据监控：开启对模板中数据（状态）的监控，当数据（状态）发生变化时通知其依赖进行视图更新")])]),t._v(" "),n("p",[n("img",{attrs:{src:e(288),alt:"lifecycle-mount"}})]),t._v(" "),n("p",[t._v("回顾上节我们讲的模板编译阶段，完整版"),n("code",[t._v("$mount")]),t._v("最终调用了运行时的"),n("code",[t._v("$mount")]),t._v("，而运行时的"),n("code",[t._v("$mount")]),t._v("最后调用的是"),n("code",[t._v("mountComponent")]),t._v("函数。")]),t._v(" "),n("div",{staticClass:"language-js line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-js"}},[n("code",[n("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Vue")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("prototype"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function-variable function"}},[t._v("$mount")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("el"),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("?")]),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" string "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("|")]),t._v(" Element"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  hydrating"),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("?")]),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" boolean")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" Component "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  el "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" el "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("&&")]),t._v(" inBrowser "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("?")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("query")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("el"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("undefined")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("mountComponent")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("this")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" el"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" hydrating"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")]),n("div",{pre:!0,attrs:{class:"m-mdic-copy-wrapper"}},[n("div",{pre:!0,attrs:{class:"u-mdic-copy-notify",id:"j-notify-1691069914944-63537"}},[t._v("成功")]),n("button",{pre:!0,attrs:{class:"u-mdic-copy-btn j-mdic-copy-btn","data-mdic-content":"Vue.prototype.$mount = function (\n  el?: string | Element,\n  hydrating?: boolean\n): Component {\n  el = el && inBrowser ? query(el) : undefined\n  return mountComponent(this, el, hydrating)\n}\n","data-mdic-attach-content":"","data-mdic-notify-id":"j-notify-1691069914944-63537","data-mdic-notify-delay":"2000","data-mdic-copy-fail-text":"copy fail",onclick:"!function(t){const e={copy:(t='',e='')=>new Promise((c,o)=>{const n=document.createElement('textarea'),d=e?`\\n\\n${e}`:e;n.value=`${t}${d}`,document.body.appendChild(n),n.select();try{const t=document.execCommand('copy');document.body.removeChild(n),t?c():o()}catch(t){document.body.removeChild(n),o()}}),btnClick(t){const c=t&&t.dataset?t.dataset:{},o=c.mdicNotifyId,n=document.getElementById(o),d=c.mdicNotifyDelay,i=c.mdicCopyFailText;e.copy(c.mdicContent,c.mdicAttachContent).then(()=>{n.style.display='block',setTimeout(()=>{n.style.display='none'},d)}).catch(()=>{alert(i)})}};e.btnClick(t)}(this);"}},[t._v("复制代码")])])]),t._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[t._v("1")]),n("br"),n("span",{staticClass:"line-number"},[t._v("2")]),n("br"),n("span",{staticClass:"line-number"},[t._v("3")]),n("br"),n("span",{staticClass:"line-number"},[t._v("4")]),n("br"),n("span",{staticClass:"line-number"},[t._v("5")]),n("br"),n("span",{staticClass:"line-number"},[t._v("6")]),n("br"),n("span",{staticClass:"line-number"},[t._v("7")]),n("br")])]),n("p",[t._v("在Vue中，调用"),n("code",[t._v("mountComponent")]),t._v("就标志着正式进入了挂载阶段，本节我们一起来探讨"),n("code",[t._v("mountComponent")]),t._v("究竟做了什么。源码在"),n("code",[t._v("src/core/instance/lifecycle.js")])]),t._v(" "),n("h2",{attrs:{id:"挂载dom"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#挂载dom"}},[t._v("#")]),t._v(" 挂载DOM")]),t._v(" "),n("p",[n("img",{attrs:{src:e(289),alt:"lifecycle-mount"}})]),t._v(" "),n("p",[t._v("挂载DOM是挂载阶段的第一件事，创建Vue实例并用其替换"),n("code",[t._v("el")]),t._v("选项对应的DOM元素，再将模板内容渲染到视图中。具体代码如下：")]),t._v(" "),n("div",{staticClass:"language-js line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-js"}},[n("code",[n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("export")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("mountComponent")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token parameter"}},[n("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("vm")]),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" Component"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("el")]),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("?")]),t._v("Element"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  hydrating"),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("?")]),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" boolean")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" Component "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 将组件实例$el设置为挂载的dom")]),t._v("\n  vm"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$el "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" el\n  "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 如果没有render，则创建一个空的VNode作为render")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 确保在挂载过程中至少有一个渲染函数可用")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("!")]),t._v("vm"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$options"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("render"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    vm"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$options"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("render "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" createEmptyVNode\n  "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 调用生命周期 beforeMount")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("callHook")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("vm"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'beforeMount'")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\n  "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" updateComponent\n\n  "),n("span",{pre:!0,attrs:{class:"token function-variable function"}},[t._v("updateComponent")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 执行渲染函数vm._render()得到一份最新的VNode节点树")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// vm._update()方法对最新的VNode节点树与上一次渲染的旧VNode节点树进行对比并更新DOM节点(即patch操作)，完成一次渲染。")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// hydrating 是一个布尔值，用于指示是否是服务端渲染（hydration）的过程。")]),t._v("\n    vm"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("_update")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("vm"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("_render")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" hydrating"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")]),n("div",{pre:!0,attrs:{class:"m-mdic-copy-wrapper"}},[n("div",{pre:!0,attrs:{class:"u-mdic-copy-notify",id:"j-notify-1691069914944-1193"}},[t._v("成功")]),n("button",{pre:!0,attrs:{class:"u-mdic-copy-btn j-mdic-copy-btn","data-mdic-content":"export function mountComponent (\n  vm: Component,\n  el: ?Element,\n  hydrating?: boolean\n): Component {\n  // 将组件实例$el设置为挂载的dom\n  vm.$el = el\n  // 如果没有render，则创建一个空的VNode作为render\n  // 确保在挂载过程中至少有一个渲染函数可用\n  if (!vm.$options.render) {\n    vm.$options.render = createEmptyVNode\n  }\n  // 调用生命周期 beforeMount\n  callHook(vm, 'beforeMount')\n\n  let updateComponent\n\n  updateComponent = () => {\n    // 执行渲染函数vm._render()得到一份最新的VNode节点树\n    // vm._update()方法对最新的VNode节点树与上一次渲染的旧VNode节点树进行对比并更新DOM节点(即patch操作)，完成一次渲染。\n    // hydrating 是一个布尔值，用于指示是否是服务端渲染（hydration）的过程。\n    vm._update(vm._render(), hydrating)\n  }\n}\n","data-mdic-attach-content":"","data-mdic-notify-id":"j-notify-1691069914944-1193","data-mdic-notify-delay":"2000","data-mdic-copy-fail-text":"copy fail",onclick:"!function(t){const e={copy:(t='',e='')=>new Promise((c,o)=>{const n=document.createElement('textarea'),d=e?`\\n\\n${e}`:e;n.value=`${t}${d}`,document.body.appendChild(n),n.select();try{const t=document.execCommand('copy');document.body.removeChild(n),t?c():o()}catch(t){document.body.removeChild(n),o()}}),btnClick(t){const c=t&&t.dataset?t.dataset:{},o=c.mdicNotifyId,n=document.getElementById(o),d=c.mdicNotifyDelay,i=c.mdicCopyFailText;e.copy(c.mdicContent,c.mdicAttachContent).then(()=>{n.style.display='block',setTimeout(()=>{n.style.display='none'},d)}).catch(()=>{alert(i)})}};e.btnClick(t)}(this);"}},[t._v("复制代码")])])]),t._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[t._v("1")]),n("br"),n("span",{staticClass:"line-number"},[t._v("2")]),n("br"),n("span",{staticClass:"line-number"},[t._v("3")]),n("br"),n("span",{staticClass:"line-number"},[t._v("4")]),n("br"),n("span",{staticClass:"line-number"},[t._v("5")]),n("br"),n("span",{staticClass:"line-number"},[t._v("6")]),n("br"),n("span",{staticClass:"line-number"},[t._v("7")]),n("br"),n("span",{staticClass:"line-number"},[t._v("8")]),n("br"),n("span",{staticClass:"line-number"},[t._v("9")]),n("br"),n("span",{staticClass:"line-number"},[t._v("10")]),n("br"),n("span",{staticClass:"line-number"},[t._v("11")]),n("br"),n("span",{staticClass:"line-number"},[t._v("12")]),n("br"),n("span",{staticClass:"line-number"},[t._v("13")]),n("br"),n("span",{staticClass:"line-number"},[t._v("14")]),n("br"),n("span",{staticClass:"line-number"},[t._v("15")]),n("br"),n("span",{staticClass:"line-number"},[t._v("16")]),n("br"),n("span",{staticClass:"line-number"},[t._v("17")]),n("br"),n("span",{staticClass:"line-number"},[t._v("18")]),n("br"),n("span",{staticClass:"line-number"},[t._v("19")]),n("br"),n("span",{staticClass:"line-number"},[t._v("20")]),n("br"),n("span",{staticClass:"line-number"},[t._v("21")]),n("br"),n("span",{staticClass:"line-number"},[t._v("22")]),n("br"),n("span",{staticClass:"line-number"},[t._v("23")]),n("br"),n("span",{staticClass:"line-number"},[t._v("24")]),n("br")])]),n("ol",[n("li",[n("code",[t._v("vm.$el = el")]),t._v("：将组件实例的 "),n("code",[t._v("$el")]),t._v(" 属性设置为传入的 "),n("code",[t._v("el")]),t._v("，即组件要挂载的目标元素。")]),t._v(" "),n("li",[t._v("检查是否存在渲染函数：\n"),n("ul",[n("li",[t._v("如果组件的配置项 "),n("code",[t._v("vm.$options.render")]),t._v(" 不存在，即没有显式定义渲染函数，则将 "),n("code",[t._v("vm.$options.render")]),t._v(" 设置为一个空的 VNode（虚拟节点）。")]),t._v(" "),n("li",[t._v("这是为了确保在挂载过程中至少有一个渲染函数可用。")])])]),t._v(" "),n("li",[t._v("调用 "),n("code",[t._v("beforeMount")]),t._v(" 生命周期钩子")]),t._v(" "),n("li",[t._v("定义 "),n("code",[t._v("updateComponent")]),t._v(" 函数：\n"),n("ul",[n("li",[n("code",[t._v("updateComponent")]),t._v(" 函数是一个渲染函数，负责执行组件的渲染逻辑。")]),t._v(" "),n("li",[t._v("在后续步骤中会被调用来执行初始的渲染和后续的更新。")])])]),t._v(" "),n("li",[t._v("调用 "),n("code",[t._v("vm._update(vm._render(), hydrating)")]),t._v("：\n"),n("ul",[n("li",[n("code",[t._v("vm._render()")]),t._v(" 执行渲染函数，生成最新的 VNode 节点树。")]),t._v(" "),n("li",[n("code",[t._v("vm._update()")]),t._v(" 方法将最新的 VNode 节点树与上一次渲染的旧 VNode 节点树进行对比，并根据差异更新 DOM 节点（执行 patch 操作），完成一次渲染。")]),t._v(" "),n("li",[t._v("第二个参数 "),n("code",[t._v("hydrating")]),t._v(" 是一个布尔值，用于指示是否是服务端渲染（hydration）的过程。")])])])]),t._v(" "),n("p",[t._v("从上述代码可以看出，挂载DOM阶段主要做的事情为设置目标元素、检查渲染函数、执行 "),n("code",[t._v("beforeMount")]),t._v(" 生命周期钩子以及执行渲染函数和更新 DOM。上述代码执行完毕后，我们就可以将模板内容渲染到视图中。")]),t._v(" "),n("h2",{attrs:{id:"数据监控"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#数据监控"}},[t._v("#")]),t._v(" 数据监控")]),t._v(" "),n("p",[t._v("将模板内容渲染到视图后，我们就进入了挂载阶段的第二件事，数据监控，开启对模板中数据（状态）的监控，当数据（状态）发生变化时通知其依赖进行视图更新")]),t._v(" "),n("div",{staticClass:"language-js line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-js"}},[n("code",[n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Watcher")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("vm"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" updateComponent"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" noop"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("before")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("vm"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("_isMounted"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n      "),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("callHook")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("vm"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'beforeUpdate'")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("true")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("/* isRenderWatcher */")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\nhydrating "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("false")]),t._v("\n\n"),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// $vnode 组件实例的占位节点，用于表示组件在父组件中的位置")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// $vnode 为null，表示组件初次挂载")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("vm"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$vnode "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("==")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("null")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  vm"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("_isMounted "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("true")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("callHook")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("vm"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'mounted'")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" vm\n")]),n("div",{pre:!0,attrs:{class:"m-mdic-copy-wrapper"}},[n("div",{pre:!0,attrs:{class:"u-mdic-copy-notify",id:"j-notify-1691069914944-38620"}},[t._v("成功")]),n("button",{pre:!0,attrs:{class:"u-mdic-copy-btn j-mdic-copy-btn","data-mdic-content":"new Watcher(vm, updateComponent, noop, {\n  before () {\n    if (vm._isMounted) {\n      callHook(vm, 'beforeUpdate')\n    }\n  }\n}, true /* isRenderWatcher */)\nhydrating = false\n\n// $vnode 组件实例的占位节点，用于表示组件在父组件中的位置\n// $vnode 为null，表示组件初次挂载\nif (vm.$vnode == null) {\n  vm._isMounted = true\n  callHook(vm, 'mounted')\n}\nreturn vm\n","data-mdic-attach-content":"","data-mdic-notify-id":"j-notify-1691069914944-38620","data-mdic-notify-delay":"2000","data-mdic-copy-fail-text":"copy fail",onclick:"!function(t){const e={copy:(t='',e='')=>new Promise((c,o)=>{const n=document.createElement('textarea'),d=e?`\\n\\n${e}`:e;n.value=`${t}${d}`,document.body.appendChild(n),n.select();try{const t=document.execCommand('copy');document.body.removeChild(n),t?c():o()}catch(t){document.body.removeChild(n),o()}}),btnClick(t){const c=t&&t.dataset?t.dataset:{},o=c.mdicNotifyId,n=document.getElementById(o),d=c.mdicNotifyDelay,i=c.mdicCopyFailText;e.copy(c.mdicContent,c.mdicAttachContent).then(()=>{n.style.display='block',setTimeout(()=>{n.style.display='none'},d)}).catch(()=>{alert(i)})}};e.btnClick(t)}(this);"}},[t._v("复制代码")])])]),t._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[t._v("1")]),n("br"),n("span",{staticClass:"line-number"},[t._v("2")]),n("br"),n("span",{staticClass:"line-number"},[t._v("3")]),n("br"),n("span",{staticClass:"line-number"},[t._v("4")]),n("br"),n("span",{staticClass:"line-number"},[t._v("5")]),n("br"),n("span",{staticClass:"line-number"},[t._v("6")]),n("br"),n("span",{staticClass:"line-number"},[t._v("7")]),n("br"),n("span",{staticClass:"line-number"},[t._v("8")]),n("br"),n("span",{staticClass:"line-number"},[t._v("9")]),n("br"),n("span",{staticClass:"line-number"},[t._v("10")]),n("br"),n("span",{staticClass:"line-number"},[t._v("11")]),n("br"),n("span",{staticClass:"line-number"},[t._v("12")]),n("br"),n("span",{staticClass:"line-number"},[t._v("13")]),n("br"),n("span",{staticClass:"line-number"},[t._v("14")]),n("br"),n("span",{staticClass:"line-number"},[t._v("15")]),n("br"),n("span",{staticClass:"line-number"},[t._v("16")]),n("br")])]),n("p",[n("code",[t._v("Watcher")]),t._v(" 构造函数在其他部分有讲，这里就简单介绍下。"),n("code",[t._v("Watcher")]),t._v("类构造函数的第二个参数支持两种类型：函数和数据路径（如"),n("code",[t._v("a.b.c")]),t._v("）。如果是数据路径，会根据路径去读取这个数据；如果是函数，会执行这个函数。一旦读取了数据或者执行了函数，就会触发数据或者函数内数据的"),n("code",[t._v("getter")]),t._v("方法，而在"),n("code",[t._v("getter")]),t._v("方法中会将"),n("code",[t._v("Watcher")]),t._v("实例添加到该数据的依赖列表中，当该数据发生变化时就会通知依赖列表中所有的依赖，依赖接收到通知后就会调用第四个参数回调函数去更新视图。")]),t._v(" "),n("p",[t._v("在这个函数中，将"),n("code",[t._v("updateComponent")]),t._v("作为"),n("code",[t._v("Watcher")]),t._v("第二个参数传入，创建一个"),n("code",[t._v("watcher")]),t._v("实例。并且会立即执行"),n("code",[t._v("updateComponent")]),t._v(", 完成渲染。")]),t._v(" "),n("p",[t._v("再执行后续代码，使用"),n("code",[t._v("$vnode")]),t._v("判断是否为初次渲染，如果是，则将私有属性"),n("code",[t._v("_isMounted")]),t._v("改为"),n("code",[t._v("true")]),t._v("，表示已经初始化过。此时再调用 "),n("code",[t._v("mounted")]),t._v(" 生命周期钩子。")]),t._v(" "),n("p",[n("code",[t._v("Watcher")]),t._v("实例化后，"),n("code",[t._v("updateComponent")]),t._v("函数中使用到的所有数据都将被"),n("code",[t._v("watcher")]),t._v("监听，一但发生改变，就执行第四个参数，也就是这里的"),n("code",[t._v("before")]),t._v(", 又通过私有属性"),n("code",[t._v("_isMounted")]),t._v("判断是否渲染完成后，再次调用"),n("code",[t._v("beforeUpdate")]),t._v("生命周期钩子。")]),t._v(" "),n("p",[n("code",[t._v("Watcher")]),t._v("内部会在更新完成后调用"),n("code",[t._v("updated")]),t._v("生命周期钩子，从而完成整个挂载阶段的流程。")]),t._v(" "),n("h2",{attrs:{id:"总结"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#总结"}},[t._v("#")]),t._v(" 总结")]),t._v(" "),n("p",[t._v("挂载阶段是Vue组件的生命周期的第三部分。在挂载阶段，Vue完成了两件主要的事情：挂载DOM和数据监控。")]),t._v(" "),n("ol",[n("li",[n("p",[t._v("挂载DOM：")]),t._v(" "),n("ul",[n("li",[t._v("首先，将组件实例的 "),n("code",[t._v("$el")]),t._v(" 属性设置为要挂载的目标DOM元素。")]),t._v(" "),n("li",[t._v("然后，检查是否存在渲染函数，如果不存在，则将 "),n("code",[t._v("vm.$options.render")]),t._v(" 设置为一个空的虚拟节点（VNode）。")]),t._v(" "),n("li",[t._v("接下来，调用 "),n("code",[t._v("beforeMount")]),t._v(" 生命周期钩子。")]),t._v(" "),n("li",[t._v("定义 "),n("code",[t._v("updateComponent")]),t._v(" 函数，该函数负责执行组件的渲染逻辑。")]),t._v(" "),n("li",[t._v("最后，调用 "),n("code",[t._v("vm._update(vm._render(), hydrating)")]),t._v(" 来执行渲染函数并更新DOM。")])])]),t._v(" "),n("li",[n("p",[t._v("数据监控：")]),t._v(" "),n("ul",[n("li",[t._v("创建一个 "),n("code",[t._v("Watcher")]),t._v(" 实例，将 "),n("code",[t._v("updateComponent")]),t._v(" 函数作为其第二个参数。")]),t._v(" "),n("li",[n("code",[t._v("Watcher")]),t._v(" 实例会立即执行 "),n("code",[t._v("updateComponent")]),t._v(" 函数，完成初始的渲染。")]),t._v(" "),n("li",[t._v("在 "),n("code",[t._v("updateComponent")]),t._v(" 函数中使用的所有数据将被 "),n("code",[t._v("Watcher")]),t._v(" 监听，一旦数据发生变化，会触发回调函数进行视图更新。")]),t._v(" "),n("li",[t._v("如果是初次渲染，通过 "),n("code",[t._v("$vnode")]),t._v(" 判断，将 "),n("code",[t._v("_isMounted")]),t._v(" 属性设置为 "),n("code",[t._v("true")]),t._v("，并调用 "),n("code",[t._v("mounted")]),t._v(" 生命周期钩子。")]),t._v(" "),n("li",[t._v("在更新完成后，"),n("code",[t._v("Watcher")]),t._v(" 实例会调用 "),n("code",[t._v("updated")]),t._v(" 生命周期钩子。")])])])]),t._v(" "),n("p",[t._v("整个挂载阶段的流程包括设置目标元素、检查渲染函数、执行 "),n("code",[t._v("beforeMount")]),t._v(" 生命周期钩子、执行渲染函数和更新 DOM，以及创建 "),n("code",[t._v("Watcher")]),t._v(" 实例进行数据监控和相应的生命周期钩子调用。")])])}),[],!1,null,null,null);n.default=s.exports}}]);