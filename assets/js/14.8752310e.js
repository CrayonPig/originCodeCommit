(window.webpackJsonp=window.webpackJsonp||[]).push([[14],{289:function(t,n,e){"use strict";e.r(n);var s=e(14),a=Object(s.a)({},(function(){var t=this,n=t._self._c;return n("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[n("h1",{attrs:{id:"初始化阶段-initprovide"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#初始化阶段-initprovide"}},[t._v("#")]),t._v(" 初始化阶段(initProvide)")]),t._v(" "),n("p",[n("code",[t._v("initProvide")]),t._v(" 函数用于初始化组件的 provide。它获取组件实例的 "),n("code",[t._v("provide")]),t._v(" 选项，并将其注册为 "),n("code",[t._v("_provided")]),t._v(" 私有属性，以供子组件进行注入使用")]),t._v(" "),n("div",{staticClass:"language-js line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-js"}},[n("code",[n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("export")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("initProvide")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token parameter"}},[n("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("vm")]),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" Component")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" provide "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" vm"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$options"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("provide\n  "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("provide"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 将provide注册为私有属性，如果是function则绑定当前组件为this")]),t._v("\n    vm"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("_provided "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("typeof")]),t._v(" provide "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("===")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'function'")]),t._v("\n      "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("?")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("provide")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("call")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("vm"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n      "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" provide\n  "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")]),n("div",{pre:!0,attrs:{class:"m-mdic-copy-wrapper"}},[n("div",{pre:!0,attrs:{class:"u-mdic-copy-notify",id:"j-notify-1688047036495-99016"}},[t._v("成功")]),n("button",{pre:!0,attrs:{class:"u-mdic-copy-btn j-mdic-copy-btn","data-mdic-content":"export function initProvide (vm: Component) {\n  const provide = vm.$options.provide\n  if (provide) {\n    // 将provide注册为私有属性，如果是function则绑定当前组件为this\n    vm._provided = typeof provide === 'function'\n      ? provide.call(vm)\n      : provide\n  }\n}\n","data-mdic-attach-content":"","data-mdic-notify-id":"j-notify-1688047036495-99016","data-mdic-notify-delay":"2000","data-mdic-copy-fail-text":"copy fail",onclick:"!function(t){const e={copy:(t='',e='')=>new Promise((c,o)=>{const n=document.createElement('textarea'),d=e?`\\n\\n${e}`:e;n.value=`${t}${d}`,document.body.appendChild(n),n.select();try{const t=document.execCommand('copy');document.body.removeChild(n),t?c():o()}catch(t){document.body.removeChild(n),o()}}),btnClick(t){const c=t&&t.dataset?t.dataset:{},o=c.mdicNotifyId,n=document.getElementById(o),d=c.mdicNotifyDelay,i=c.mdicCopyFailText;e.copy(c.mdicContent,c.mdicAttachContent).then(()=>{n.style.display='block',setTimeout(()=>{n.style.display='none'},d)}).catch(()=>{alert(i)})}};e.btnClick(t)}(this);"}},[t._v("复制代码")])])]),t._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[t._v("1")]),n("br"),n("span",{staticClass:"line-number"},[t._v("2")]),n("br"),n("span",{staticClass:"line-number"},[t._v("3")]),n("br"),n("span",{staticClass:"line-number"},[t._v("4")]),n("br"),n("span",{staticClass:"line-number"},[t._v("5")]),n("br"),n("span",{staticClass:"line-number"},[t._v("6")]),n("br"),n("span",{staticClass:"line-number"},[t._v("7")]),n("br"),n("span",{staticClass:"line-number"},[t._v("8")]),n("br"),n("span",{staticClass:"line-number"},[t._v("9")]),n("br")])]),n("p",[t._v("首先获取组件实例的 "),n("code",[t._v("provide")]),t._v(" 选项。如果存在 "),n("code",[t._v("provide")]),t._v("，则将其注册为组件实例的 "),n("code",[t._v("_provided")]),t._v(" 私有属性。")]),t._v(" "),n("p",[t._v("如果 "),n("code",[t._v("provide")]),t._v(" 是一个函数，即提供一个动态的值，函数会在组件实例上下文中调用，绑定当前组件为 "),n("code",[t._v("this")]),t._v("，并将返回值赋给 "),n("code",[t._v("_provided")]),t._v("。")]),t._v(" "),n("p",[t._v("如果 "),n("code",[t._v("provide")]),t._v(" 是一个静态值（对象、数组等），则直接赋给 "),n("code",[t._v("_provided")]),t._v("。")])])}),[],!1,null,null,null);n.default=a.exports}}]);