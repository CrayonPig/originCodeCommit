(window.webpackJsonp=window.webpackJsonp||[]).push([[57],{359:function(t,n,s){"use strict";s.r(n);var a=s(14),e=Object(a.a)({},(function(){var t=this,n=t._self._c;return n("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[n("h1",{attrs:{id:"vue-mixin"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#vue-mixin"}},[t._v("#")]),t._v(" Vue.mixin")]),t._v(" "),n("h2",{attrs:{id:"用法回顾"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#用法回顾"}},[t._v("#")]),t._v(" 用法回顾")]),t._v(" "),n("p",[t._v("其用法如下：")]),t._v(" "),n("div",{staticClass:"language-javascript line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-javascript"}},[n("code",[t._v("Vue"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("mixin")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v(" mixin "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n")]),n("div",{pre:!0,attrs:{class:"m-mdic-copy-wrapper"}},[n("div",{pre:!0,attrs:{class:"u-mdic-copy-notify",id:"j-notify-1701941076283-42991"}},[t._v("成功")]),n("button",{pre:!0,attrs:{class:"u-mdic-copy-btn j-mdic-copy-btn","data-mdic-content":"Vue.mixin( mixin )\n","data-mdic-attach-content":"","data-mdic-notify-id":"j-notify-1701941076283-42991","data-mdic-notify-delay":"2000","data-mdic-copy-fail-text":"copy fail",onclick:"!function(t){const e={copy:(t='',e='')=>new Promise((c,o)=>{const n=document.createElement('textarea'),d=e?`\\n\\n${e}`:e;n.value=`${t}${d}`,document.body.appendChild(n),n.select();try{const t=document.execCommand('copy');document.body.removeChild(n),t?c():o()}catch(t){document.body.removeChild(n),o()}}),btnClick(t){const c=t&&t.dataset?t.dataset:{},o=c.mdicNotifyId,n=document.getElementById(o),d=c.mdicNotifyDelay,i=c.mdicCopyFailText;e.copy(c.mdicContent,c.mdicAttachContent).then(()=>{n.style.display='block',setTimeout(()=>{n.style.display='none'},d)}).catch(()=>{alert(i)})}};e.btnClick(t)}(this);"}},[t._v("复制代码")])])]),t._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[t._v("1")]),n("br")])]),n("ul",[n("li",[n("p",[n("strong",[t._v("参数")]),t._v("：")]),t._v(" "),n("ul",[n("li",[n("code",[t._v("{Object} mixin")])])])]),t._v(" "),n("li",[n("p",[n("strong",[t._v("作用")]),t._v("：")]),t._v(" "),n("p",[t._v("全局注册一个混入，影响注册之后所有创建的每个 Vue 实例。插件作者可以使用混入，向组件注入自定义的行为。"),n("strong",[t._v("不推荐在应用代码中使用")]),t._v("。")])])]),t._v(" "),n("h2",{attrs:{id:"原理分析"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#原理分析"}},[t._v("#")]),t._v(" 原理分析")]),t._v(" "),n("p",[t._v("从用法回顾中可以知道，该API是用来向全局注册一个混入，即可以修改"),n("code",[t._v("Vue.options")]),t._v("属性，并且会影响之后的所有"),n("code",[t._v("Vue")]),t._v("实例，这个API虽然在日常的业务开发中几乎用不到，但是在编写"),n("code",[t._v("Vue")]),t._v("插件时用处非常大。下面我们就来看一下该API的内部实现原理。")]),t._v(" "),n("div",{staticClass:"language-js line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-js"}},[n("code",[n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// src/core/global-api/mixin.js")]),t._v("\n\n"),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("export")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("initMixin")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token parameter"}},[n("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("Vue")]),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" GlobalAPI")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  Vue"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function-variable function"}},[t._v("mixin")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token parameter"}},[n("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("mixin")]),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" Object")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 修改`Vue.options`属性进而影响之后的所有`Vue`实例")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("this")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("options "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("mergeOptions")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("this")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("options"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" mixin"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("this")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")]),n("div",{pre:!0,attrs:{class:"m-mdic-copy-wrapper"}},[n("div",{pre:!0,attrs:{class:"u-mdic-copy-notify",id:"j-notify-1701941076283-97634"}},[t._v("成功")]),n("button",{pre:!0,attrs:{class:"u-mdic-copy-btn j-mdic-copy-btn","data-mdic-content":"// src/core/global-api/mixin.js\n\nexport function initMixin (Vue: GlobalAPI) {\n  Vue.mixin = function (mixin: Object) {\n    // 修改`Vue.options`属性进而影响之后的所有`Vue`实例\n    this.options = mergeOptions(this.options, mixin)\n    return this\n  }\n}\n","data-mdic-attach-content":"","data-mdic-notify-id":"j-notify-1701941076283-97634","data-mdic-notify-delay":"2000","data-mdic-copy-fail-text":"copy fail",onclick:"!function(t){const e={copy:(t='',e='')=>new Promise((c,o)=>{const n=document.createElement('textarea'),d=e?`\\n\\n${e}`:e;n.value=`${t}${d}`,document.body.appendChild(n),n.select();try{const t=document.execCommand('copy');document.body.removeChild(n),t?c():o()}catch(t){document.body.removeChild(n),o()}}),btnClick(t){const c=t&&t.dataset?t.dataset:{},o=c.mdicNotifyId,n=document.getElementById(o),d=c.mdicNotifyDelay,i=c.mdicCopyFailText;e.copy(c.mdicContent,c.mdicAttachContent).then(()=>{n.style.display='block',setTimeout(()=>{n.style.display='none'},d)}).catch(()=>{alert(i)})}};e.btnClick(t)}(this);"}},[t._v("复制代码")])])]),t._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[t._v("1")]),n("br"),n("span",{staticClass:"line-number"},[t._v("2")]),n("br"),n("span",{staticClass:"line-number"},[t._v("3")]),n("br"),n("span",{staticClass:"line-number"},[t._v("4")]),n("br"),n("span",{staticClass:"line-number"},[t._v("5")]),n("br"),n("span",{staticClass:"line-number"},[t._v("6")]),n("br"),n("span",{staticClass:"line-number"},[t._v("7")]),n("br"),n("span",{staticClass:"line-number"},[t._v("8")]),n("br"),n("span",{staticClass:"line-number"},[t._v("9")]),n("br")])]),n("p",[t._v("我们上文提到，可以通过修改"),n("code",[t._v("Vue.options")]),t._v("属性进而影响之后的所有"),n("code",[t._v("Vue")]),t._v("实例。所以这里只需要将传入的"),n("code",[t._v("mixin")]),t._v("对象与"),n("code",[t._v("this.options")]),t._v("合并即可")])])}),[],!1,null,null,null);n.default=e.exports}}]);