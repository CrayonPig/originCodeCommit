(window.webpackJsonp=window.webpackJsonp||[]).push([[43],{337:function(t,n,a){"use strict";a.r(n);var s=a(14),e=Object(s.a)({},(function(){var t=this,n=t._self._c;return n("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[n("h1",{attrs:{id:"vue-nexttick"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#vue-nexttick"}},[t._v("#")]),t._v(" Vue.nextTick")]),t._v(" "),n("h2",{attrs:{id:"用法回顾"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#用法回顾"}},[t._v("#")]),t._v(" 用法回顾")]),t._v(" "),n("p",[t._v("其用法如下：")]),t._v(" "),n("div",{staticClass:"language-javascript line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-javascript"}},[n("code",[t._v("Vue"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("nextTick")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("callback"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" context"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n")]),n("div",{pre:!0,attrs:{class:"m-mdic-copy-wrapper"}},[n("div",{pre:!0,attrs:{class:"u-mdic-copy-notify",id:"j-notify-1689935364749-10757"}},[t._v("成功")]),n("button",{pre:!0,attrs:{class:"u-mdic-copy-btn j-mdic-copy-btn","data-mdic-content":"Vue.nextTick( [callback, context] )\n","data-mdic-attach-content":"","data-mdic-notify-id":"j-notify-1689935364749-10757","data-mdic-notify-delay":"2000","data-mdic-copy-fail-text":"copy fail",onclick:"!function(t){const e={copy:(t='',e='')=>new Promise((c,o)=>{const n=document.createElement('textarea'),d=e?`\\n\\n${e}`:e;n.value=`${t}${d}`,document.body.appendChild(n),n.select();try{const t=document.execCommand('copy');document.body.removeChild(n),t?c():o()}catch(t){document.body.removeChild(n),o()}}),btnClick(t){const c=t&&t.dataset?t.dataset:{},o=c.mdicNotifyId,n=document.getElementById(o),d=c.mdicNotifyDelay,i=c.mdicCopyFailText;e.copy(c.mdicContent,c.mdicAttachContent).then(()=>{n.style.display='block',setTimeout(()=>{n.style.display='none'},d)}).catch(()=>{alert(i)})}};e.btnClick(t)}(this);"}},[t._v("复制代码")])])]),t._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[t._v("1")]),n("br")])]),n("ul",[n("li",[n("p",[n("strong",[t._v("参数")]),t._v("：")]),t._v(" "),n("ul",[n("li",[n("code",[t._v("{Function} [callback]")])]),t._v(" "),n("li",[n("code",[t._v("{Object} [context]")])])])]),t._v(" "),n("li",[n("p",[n("strong",[t._v("作用")]),t._v("：")]),t._v(" "),n("p",[t._v("在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM。")]),t._v(" "),n("div",{staticClass:"language-javascript line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-javascript"}},[n("code",[n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 修改数据")]),t._v("\nvm"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("msg "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'Hello'")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// DOM 还没有更新")]),t._v("\nVue"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("nextTick")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// DOM 更新了")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\n"),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 作为一个 Promise 使用 (2.1.0 起新增，详见接下来的提示)")]),t._v("\nVue"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("nextTick")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("then")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// DOM 更新了")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n")]),n("div",{pre:!0,attrs:{class:"m-mdic-copy-wrapper"}},[n("div",{pre:!0,attrs:{class:"u-mdic-copy-notify",id:"j-notify-1689935364749-73334"}},[t._v("成功")]),n("button",{pre:!0,attrs:{class:"u-mdic-copy-btn j-mdic-copy-btn","data-mdic-content":"// 修改数据\nvm.msg = 'Hello'\n// DOM 还没有更新\nVue.nextTick(function () {\n  // DOM 更新了\n})\n\n// 作为一个 Promise 使用 (2.1.0 起新增，详见接下来的提示)\nVue.nextTick()\n  .then(function () {\n    // DOM 更新了\n  })\n","data-mdic-attach-content":"","data-mdic-notify-id":"j-notify-1689935364749-73334","data-mdic-notify-delay":"2000","data-mdic-copy-fail-text":"copy fail",onclick:"!function(t){const e={copy:(t='',e='')=>new Promise((c,o)=>{const n=document.createElement('textarea'),d=e?`\\n\\n${e}`:e;n.value=`${t}${d}`,document.body.appendChild(n),n.select();try{const t=document.execCommand('copy');document.body.removeChild(n),t?c():o()}catch(t){document.body.removeChild(n),o()}}),btnClick(t){const c=t&&t.dataset?t.dataset:{},o=c.mdicNotifyId,n=document.getElementById(o),d=c.mdicNotifyDelay,i=c.mdicCopyFailText;e.copy(c.mdicContent,c.mdicAttachContent).then(()=>{n.style.display='block',setTimeout(()=>{n.style.display='none'},d)}).catch(()=>{alert(i)})}};e.btnClick(t)}(this);"}},[t._v("复制代码")])])]),t._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[t._v("1")]),n("br"),n("span",{staticClass:"line-number"},[t._v("2")]),n("br"),n("span",{staticClass:"line-number"},[t._v("3")]),n("br"),n("span",{staticClass:"line-number"},[t._v("4")]),n("br"),n("span",{staticClass:"line-number"},[t._v("5")]),n("br"),n("span",{staticClass:"line-number"},[t._v("6")]),n("br"),n("span",{staticClass:"line-number"},[t._v("7")]),n("br"),n("span",{staticClass:"line-number"},[t._v("8")]),n("br"),n("span",{staticClass:"line-number"},[t._v("9")]),n("br"),n("span",{staticClass:"line-number"},[t._v("10")]),n("br"),n("span",{staticClass:"line-number"},[t._v("11")]),n("br"),n("span",{staticClass:"line-number"},[t._v("12")]),n("br")])]),n("blockquote",[n("p",[t._v("2.1.0 起新增：如果没有提供回调且在支持 Promise 的环境中，则返回一个 Promise。请注意 Vue 不自带 Promise 的 polyfill，所以如果你的目标浏览器不原生支持 Promise (IE：你们都看我干嘛)，你得自己提供 polyfill。")])])])]),t._v(" "),n("h2",{attrs:{id:"原理分析"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#原理分析"}},[t._v("#")]),t._v(" 原理分析")]),t._v(" "),n("p",[t._v("该API的原理同实例方法 "),n("code",[t._v("$nextTick")]),t._v("原理一样，此处不再重复。唯一不同的是实例方法 "),n("code",[t._v("$nextTick")]),t._v(" 中回调的 "),n("code",[t._v("this")]),t._v(" 绑定在调用它的实例上。")])])}),[],!1,null,null,null);n.default=e.exports}}]);