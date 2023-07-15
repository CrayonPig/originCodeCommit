(window.webpackJsonp=window.webpackJsonp||[]).push([[26],{316:function(t,s,n){"use strict";n.r(s);var e=n(14),a=Object(e.a)({},(function(){var t=this,s=t._self._c;return s("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[s("h1",{attrs:{id:"初始化阶段-initinjections"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#初始化阶段-initinjections"}},[t._v("#")]),t._v(" 初始化阶段(initInjections)")]),t._v(" "),s("p",[s("code",[t._v("initInjections")]),t._v(" 函数用于初始化组件的注入属性，它通过解析组件配置中的 "),s("code",[t._v("inject")]),t._v(" 选项，将注入的属性定义为响应式数据。")]),t._v(" "),s("p",[s("code",[t._v("inject")]),t._v(" 和 "),s("code",[t._v("provide")]),t._v(" 通常是成对出现的，它们的作用是：允许一个祖先组件向其所有子孙后代注入一个依赖，不论组件层次有多深，并在起上下游关系成立的时间里始终生效。")]),t._v(" "),s("div",{staticClass:"custom-block tip"},[s("p",{staticClass:"custom-block-title"},[t._v("TIP")]),t._v(" "),s("p",[s("code",[t._v("inject")]),t._v(" 和 "),s("code",[t._v("provide")]),t._v(" 主要为高阶插件/组件库提供用例，并不推荐直接用于业务代码中。")])]),t._v(" "),s("p",[s("code",[t._v("provide")]),t._v(" 选项应该是一个对象或返回一个对象的函数。该对象包含可注入其子孙的属性。在该对象中你可以使用 "),s("code",[t._v("ES2015 Symbols")]),t._v(" 作为 key，但是只在原生支持 "),s("code",[t._v("Symbol")]),t._v(" 和 "),s("code",[t._v("Reflect.ownKeys")]),t._v(" 的环境下可工作。")]),t._v(" "),s("p",[s("code",[t._v("inject")]),t._v(" 选项应该是一个字符串数组或对象，其中对象的 key 是本地的绑定名。value 是个 key ( 字符串或 symbol) 或对象，用来在可用的注人内容中搜索。")]),t._v(" "),s("p",[t._v("如果是对象，那么它有如下两个属性")]),t._v(" "),s("ul",[s("li",[t._v("from 属性是在可用的注入内容中搜索用的 key (字符串或 Symbol)")]),t._v(" "),s("li",[t._v("default 属性是降级情况下使用的 value")])]),t._v(" "),s("div",{staticClass:"custom-block tip"},[s("p",{staticClass:"custom-block-title"},[t._v("TIP")]),t._v(" "),s("p",[t._v("可用的注入内容指的是祖先组件通过 provide 注入了内容，子孙组件可以通过 inject 获取祖先组件注入的内容。")])]),t._v(" "),s("p",[t._v("虽然"),s("code",[t._v("inject")]),t._v("和"),s("code",[t._v("provide")]),t._v(" 是成对出现的，但是二者在内部的实现是分开处理的，先处理 "),s("code",[t._v("inject")]),t._v("后处理 "),s("code",[t._v("provide")]),t._v("。从之前梳理的"),s("code",[t._v("_init")]),t._v("函数的逻辑中也可以看出，"),s("code",[t._v("inject")]),t._v(" 在 "),s("code",[t._v("data/props")]),t._v(" 之前初始化，而 "),s("code",[t._v("provide")]),t._v(" 在 "),s("code",[t._v("data/props")]),t._v(" 后面初始化。这样做的目的是让用户可以在 "),s("code",[t._v("data/props")]),t._v(" 中使用 "),s("code",[t._v("inject")]),t._v(" 所注人的内容。也就是说，可以让"),s("code",[t._v("data/props")]),t._v(" 依赖 "),s("code",[t._v("inject")]),t._v("，所以需要将初始化 "),s("code",[t._v("inject")]),t._v("放在初始化"),s("code",[t._v("data/props")]),t._v("的前面。")]),t._v(" "),s("div",{staticClass:"language-js line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-js"}},[s("code",[s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// _init函数片段")]),t._v("\n\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 在data/props之前，注入inject")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("initInjections")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// resolve injections before data/props")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 初始化 props、methods、data、computed、watch")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("initState")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 数据初始化完成后，调用provide传递数据")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("initProvide")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// resolve provide after data/props")]),t._v("\n")]),s("div",{pre:!0,attrs:{class:"m-mdic-copy-wrapper"}},[s("div",{pre:!0,attrs:{class:"u-mdic-copy-notify",id:"j-notify-1689411477414-60493"}},[t._v("成功")]),s("button",{pre:!0,attrs:{class:"u-mdic-copy-btn j-mdic-copy-btn","data-mdic-content":"// _init函数片段\n\n// 在data/props之前，注入inject\ninitInjections(vm) // resolve injections before data/props\n// 初始化 props、methods、data、computed、watch\ninitState(vm)\n// 数据初始化完成后，调用provide传递数据\ninitProvide(vm) // resolve provide after data/props\n","data-mdic-attach-content":"","data-mdic-notify-id":"j-notify-1689411477414-60493","data-mdic-notify-delay":"2000","data-mdic-copy-fail-text":"copy fail",onclick:"!function(t){const e={copy:(t='',e='')=>new Promise((c,o)=>{const n=document.createElement('textarea'),d=e?`\\n\\n${e}`:e;n.value=`${t}${d}`,document.body.appendChild(n),n.select();try{const t=document.execCommand('copy');document.body.removeChild(n),t?c():o()}catch(t){document.body.removeChild(n),o()}}),btnClick(t){const c=t&&t.dataset?t.dataset:{},o=c.mdicNotifyId,n=document.getElementById(o),d=c.mdicNotifyDelay,i=c.mdicCopyFailText;e.copy(c.mdicContent,c.mdicAttachContent).then(()=>{n.style.display='block',setTimeout(()=>{n.style.display='none'},d)}).catch(()=>{alert(i)})}};e.btnClick(t)}(this);"}},[t._v("复制代码")])])]),t._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[t._v("1")]),s("br"),s("span",{staticClass:"line-number"},[t._v("2")]),s("br"),s("span",{staticClass:"line-number"},[t._v("3")]),s("br"),s("span",{staticClass:"line-number"},[t._v("4")]),s("br"),s("span",{staticClass:"line-number"},[t._v("5")]),s("br"),s("span",{staticClass:"line-number"},[t._v("6")]),s("br"),s("span",{staticClass:"line-number"},[t._v("7")]),s("br"),s("span",{staticClass:"line-number"},[t._v("8")]),s("br")])]),s("h2",{attrs:{id:"initinjections"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#initinjections"}},[t._v("#")]),t._v(" initInjections")]),t._v(" "),s("p",[t._v("接下来我们看"),s("code",[t._v("initInjections")]),t._v("源码，代码在"),s("code",[t._v("src/core/instance/inject.js")])]),t._v(" "),s("div",{staticClass:"language-js line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-js"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("export")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("initInjections")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token parameter"}},[s("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("vm")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" Component")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" result "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("resolveInject")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$options"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("inject"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("result"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 禁用observe")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("toggleObserving")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("false")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n    Object"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("keys")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("result"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("forEach")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("key")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 将解析出的inject绑定为当前组件的响应式数据")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("defineReactive")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" key"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" result"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("key"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 开启")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("toggleObserving")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("true")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")]),s("div",{pre:!0,attrs:{class:"m-mdic-copy-wrapper"}},[s("div",{pre:!0,attrs:{class:"u-mdic-copy-notify",id:"j-notify-1689411477414-4015"}},[t._v("成功")]),s("button",{pre:!0,attrs:{class:"u-mdic-copy-btn j-mdic-copy-btn","data-mdic-content":"export function initInjections (vm: Component) {\n  const result = resolveInject(vm.$options.inject, vm)\n  if (result) {\n    // 禁用observe\n    toggleObserving(false)\n    Object.keys(result).forEach(key => {\n      // 将解析出的inject绑定为当前组件的响应式数据\n      defineReactive(vm, key, result[key])\n    })\n    // 开启\n    toggleObserving(true)\n  }\n}\n","data-mdic-attach-content":"","data-mdic-notify-id":"j-notify-1689411477414-4015","data-mdic-notify-delay":"2000","data-mdic-copy-fail-text":"copy fail",onclick:"!function(t){const e={copy:(t='',e='')=>new Promise((c,o)=>{const n=document.createElement('textarea'),d=e?`\\n\\n${e}`:e;n.value=`${t}${d}`,document.body.appendChild(n),n.select();try{const t=document.execCommand('copy');document.body.removeChild(n),t?c():o()}catch(t){document.body.removeChild(n),o()}}),btnClick(t){const c=t&&t.dataset?t.dataset:{},o=c.mdicNotifyId,n=document.getElementById(o),d=c.mdicNotifyDelay,i=c.mdicCopyFailText;e.copy(c.mdicContent,c.mdicAttachContent).then(()=>{n.style.display='block',setTimeout(()=>{n.style.display='none'},d)}).catch(()=>{alert(i)})}};e.btnClick(t)}(this);"}},[t._v("复制代码")])])]),t._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[t._v("1")]),s("br"),s("span",{staticClass:"line-number"},[t._v("2")]),s("br"),s("span",{staticClass:"line-number"},[t._v("3")]),s("br"),s("span",{staticClass:"line-number"},[t._v("4")]),s("br"),s("span",{staticClass:"line-number"},[t._v("5")]),s("br"),s("span",{staticClass:"line-number"},[t._v("6")]),s("br"),s("span",{staticClass:"line-number"},[t._v("7")]),s("br"),s("span",{staticClass:"line-number"},[t._v("8")]),s("br"),s("span",{staticClass:"line-number"},[t._v("9")]),s("br"),s("span",{staticClass:"line-number"},[t._v("10")]),s("br"),s("span",{staticClass:"line-number"},[t._v("11")]),s("br"),s("span",{staticClass:"line-number"},[t._v("12")]),s("br"),s("span",{staticClass:"line-number"},[t._v("13")]),s("br")])]),s("p",[t._v("首先调用 "),s("code",[t._v("resolveInject")]),t._v(" 函数来解析组件的注入属性。"),s("code",[t._v("resolveInject")]),t._v(" 函数会根据组件的配置项 "),s("code",[t._v("$options.inject")]),t._v(" 和当前组件实例 "),s("code",[t._v("vm")]),t._v(" 来确定注入的属性。")]),t._v(" "),s("p",[t._v("如果存在解析结果 "),s("code",[t._v("result")]),t._v("，则会执行以下操作：")]),t._v(" "),s("ol",[s("li",[t._v("禁用观测：调用 "),s("code",[t._v("toggleObserving(false)")]),t._v(" 来禁用对属性的观测。")]),t._v(" "),s("li",[t._v("遍历解析结果 "),s("code",[t._v("result")]),t._v(" 的每个属性，使用 "),s("code",[t._v("Object.keys(result).forEach(key => { ... })")]),t._v("。")]),t._v(" "),s("li",[t._v("在非生产环境下，使用 "),s("code",[t._v("defineReactive")]),t._v(" 函数定义注入属性为响应式数据。该函数会为每个属性设置 getter 和 setter，并在修改属性值时发出警告，防止直接修改注入属性的值。")]),t._v(" "),s("li",[t._v("在生产环境下，直接使用 "),s("code",[t._v("defineReactive")]),t._v(" 函数定义注入属性为响应式数据。")]),t._v(" "),s("li",[t._v("开启观测：调用 "),s("code",[t._v("toggleObserving(true)")]),t._v(" 来开启对属性的观测。")])]),t._v(" "),s("h2",{attrs:{id:"resolveinject"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#resolveinject"}},[t._v("#")]),t._v(" resolveInject")]),t._v(" "),s("p",[s("code",[t._v("resolveInject")]),t._v(" 函数用于解析组件的注入属性配置，并根据提供的配置在组件的父级组件中查找提供的值。如果找到了提供的值，则将其存储在解析后的注入属性对象中。如果未找到提供的值，并且存在默认值，则将默认值赋给解析后的注入属性对象。最后，返回解析后的注入属性对象。")]),t._v(" "),s("p",[t._v("源码在"),s("code",[t._v("src/core/instance/inject.js")])]),t._v(" "),s("div",{staticClass:"language-js line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-js"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("export")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("resolveInject")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token parameter"}},[s("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("inject")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" any"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("vm")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" Component")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("?")]),t._v("Object "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("inject"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// inject is :any because flow is not smart enough to figure out cached")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" result "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" Object"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("create")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("null")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// Reflect.ownKeys() 方法返回一个由所有键（包括符号键和非符号键）组成的数组，")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 而 Object.keys() 方法只返回一个由字符串键组成的数组")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 所以优先使用Reflect判断")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" keys "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" hasSymbol\n      "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("?")]),t._v(" Reflect"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("ownKeys")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("inject"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("filter")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("key")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("/* istanbul ignore next */")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" Object"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("getOwnPropertyDescriptor")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("inject"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" key"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("enumerable\n      "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" Object"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("keys")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("inject"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("for")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" i "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" i "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("<")]),t._v(" keys"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("length"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" i"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("++")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" key "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" keys"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("i"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" provideKey "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" inject"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("key"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("from\n      "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" source "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" vm\n      "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("while")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("source"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 根组件_provided为空，后续步骤初始化_provided")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("source"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("_provided "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("&&")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("hasOwn")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("source"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("_provided"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" provideKey"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n          result"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("key"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" source"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("_provided"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("provideKey"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v("\n          "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("break")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 如果在父级没找到，则向祖先查找，如果父级找到了，直接break出去，不需要祖先覆盖")]),t._v("\n        source "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" source"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$parent\n      "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("!")]),t._v("source"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 没获取值的时候，如果设置了默认值，default字段，取默认值")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'default'")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("in")]),t._v(" inject"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("key"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n          "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" provideDefault "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" inject"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("key"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("default\n          "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 如果获取到的值为function，则将this绑定到当前组件")]),t._v("\n          result"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("key"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("typeof")]),t._v(" provideDefault "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("===")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'function'")]),t._v("\n            "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("?")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("provideDefault")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("call")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n            "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" provideDefault\n        "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("else")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("process"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("env"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token constant"}},[t._v("NODE_ENV")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("!==")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'production'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n          "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("warn")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token template-string"}},[s("span",{pre:!0,attrs:{class:"token template-punctuation string"}},[t._v("`")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('Injection "')]),s("span",{pre:!0,attrs:{class:"token interpolation"}},[s("span",{pre:!0,attrs:{class:"token interpolation-punctuation punctuation"}},[t._v("${")]),t._v("key"),s("span",{pre:!0,attrs:{class:"token interpolation-punctuation punctuation"}},[t._v("}")])]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('" not found')]),s("span",{pre:!0,attrs:{class:"token template-punctuation string"}},[t._v("`")])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" result\n  "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")]),s("div",{pre:!0,attrs:{class:"m-mdic-copy-wrapper"}},[s("div",{pre:!0,attrs:{class:"u-mdic-copy-notify",id:"j-notify-1689411477415-37133"}},[t._v("成功")]),s("button",{pre:!0,attrs:{class:"u-mdic-copy-btn j-mdic-copy-btn","data-mdic-content":"export function resolveInject (inject: any, vm: Component): ?Object {\n  if (inject) {\n    // inject is :any because flow is not smart enough to figure out cached\n    const result = Object.create(null)\n    // Reflect.ownKeys() 方法返回一个由所有键（包括符号键和非符号键）组成的数组，\n    // 而 Object.keys() 方法只返回一个由字符串键组成的数组\n    // 所以优先使用Reflect判断\n    const keys = hasSymbol\n      ? Reflect.ownKeys(inject).filter(key => {\n        /* istanbul ignore next */\n        return Object.getOwnPropertyDescriptor(inject, key).enumerable\n      })\n      : Object.keys(inject)\n\n    for (let i = 0; i < keys.length; i++) {\n      const key = keys[i]\n      const provideKey = inject[key].from\n      let source = vm\n      while (source) {\n        // 根组件_provided为空，后续步骤初始化_provided\n        if (source._provided && hasOwn(source._provided, provideKey)) {\n          result[key] = source._provided[provideKey]\n          break\n        }\n        // 如果在父级没找到，则向祖先查找，如果父级找到了，直接break出去，不需要祖先覆盖\n        source = source.$parent\n      }\n      if (!source) {\n        // 没获取值的时候，如果设置了默认值，default字段，取默认值\n        if ('default' in inject[key]) {\n          const provideDefault = inject[key].default\n          // 如果获取到的值为function，则将this绑定到当前组件\n          result[key] = typeof provideDefault === 'function'\n            ? provideDefault.call(vm)\n            : provideDefault\n        } else if (process.env.NODE_ENV !== 'production') {\n          warn(`Injection \"${key}\" not found`, vm)\n        }\n      }\n    }\n    return result\n  }\n}\n","data-mdic-attach-content":"","data-mdic-notify-id":"j-notify-1689411477415-37133","data-mdic-notify-delay":"2000","data-mdic-copy-fail-text":"copy fail",onclick:"!function(t){const e={copy:(t='',e='')=>new Promise((c,o)=>{const n=document.createElement('textarea'),d=e?`\\n\\n${e}`:e;n.value=`${t}${d}`,document.body.appendChild(n),n.select();try{const t=document.execCommand('copy');document.body.removeChild(n),t?c():o()}catch(t){document.body.removeChild(n),o()}}),btnClick(t){const c=t&&t.dataset?t.dataset:{},o=c.mdicNotifyId,n=document.getElementById(o),d=c.mdicNotifyDelay,i=c.mdicCopyFailText;e.copy(c.mdicContent,c.mdicAttachContent).then(()=>{n.style.display='block',setTimeout(()=>{n.style.display='none'},d)}).catch(()=>{alert(i)})}};e.btnClick(t)}(this);"}},[t._v("复制代码")])])]),t._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[t._v("1")]),s("br"),s("span",{staticClass:"line-number"},[t._v("2")]),s("br"),s("span",{staticClass:"line-number"},[t._v("3")]),s("br"),s("span",{staticClass:"line-number"},[t._v("4")]),s("br"),s("span",{staticClass:"line-number"},[t._v("5")]),s("br"),s("span",{staticClass:"line-number"},[t._v("6")]),s("br"),s("span",{staticClass:"line-number"},[t._v("7")]),s("br"),s("span",{staticClass:"line-number"},[t._v("8")]),s("br"),s("span",{staticClass:"line-number"},[t._v("9")]),s("br"),s("span",{staticClass:"line-number"},[t._v("10")]),s("br"),s("span",{staticClass:"line-number"},[t._v("11")]),s("br"),s("span",{staticClass:"line-number"},[t._v("12")]),s("br"),s("span",{staticClass:"line-number"},[t._v("13")]),s("br"),s("span",{staticClass:"line-number"},[t._v("14")]),s("br"),s("span",{staticClass:"line-number"},[t._v("15")]),s("br"),s("span",{staticClass:"line-number"},[t._v("16")]),s("br"),s("span",{staticClass:"line-number"},[t._v("17")]),s("br"),s("span",{staticClass:"line-number"},[t._v("18")]),s("br"),s("span",{staticClass:"line-number"},[t._v("19")]),s("br"),s("span",{staticClass:"line-number"},[t._v("20")]),s("br"),s("span",{staticClass:"line-number"},[t._v("21")]),s("br"),s("span",{staticClass:"line-number"},[t._v("22")]),s("br"),s("span",{staticClass:"line-number"},[t._v("23")]),s("br"),s("span",{staticClass:"line-number"},[t._v("24")]),s("br"),s("span",{staticClass:"line-number"},[t._v("25")]),s("br"),s("span",{staticClass:"line-number"},[t._v("26")]),s("br"),s("span",{staticClass:"line-number"},[t._v("27")]),s("br"),s("span",{staticClass:"line-number"},[t._v("28")]),s("br"),s("span",{staticClass:"line-number"},[t._v("29")]),s("br"),s("span",{staticClass:"line-number"},[t._v("30")]),s("br"),s("span",{staticClass:"line-number"},[t._v("31")]),s("br"),s("span",{staticClass:"line-number"},[t._v("32")]),s("br"),s("span",{staticClass:"line-number"},[t._v("33")]),s("br"),s("span",{staticClass:"line-number"},[t._v("34")]),s("br"),s("span",{staticClass:"line-number"},[t._v("35")]),s("br"),s("span",{staticClass:"line-number"},[t._v("36")]),s("br"),s("span",{staticClass:"line-number"},[t._v("37")]),s("br"),s("span",{staticClass:"line-number"},[t._v("38")]),s("br"),s("span",{staticClass:"line-number"},[t._v("39")]),s("br"),s("span",{staticClass:"line-number"},[t._v("40")]),s("br"),s("span",{staticClass:"line-number"},[t._v("41")]),s("br"),s("span",{staticClass:"line-number"},[t._v("42")]),s("br"),s("span",{staticClass:"line-number"},[t._v("43")]),s("br")])]),s("p",[t._v("函数内部首先判断 "),s("code",[t._v("inject")]),t._v(" 是否存在。如果存在，则执行以下操作：")]),t._v(" "),s("ol",[s("li",[t._v("创建一个空对象 "),s("code",[t._v("result")]),t._v("，用于存储解析后的注入属性。")]),t._v(" "),s("li",[t._v("根据是否支持符号键（Symbol key），确定要遍历的键数组 "),s("code",[t._v("keys")]),t._v("。如果支持符号键，则使用 "),s("code",[t._v("Reflect.ownKeys(inject)")]),t._v("，否则使用 "),s("code",[t._v("Object.keys(inject)")]),t._v("。")]),t._v(" "),s("li",[t._v("遍历键数组 "),s("code",[t._v("keys")]),t._v("，对于每个键 "),s("code",[t._v("key")]),t._v("，执行以下操作：")])]),t._v(" "),s("ul",[s("li",[t._v("获取 "),s("code",[t._v("inject[key]")]),t._v(" 的 "),s("code",[t._v("from")]),t._v(" 属性值，即提供注入值的键名。")]),t._v(" "),s("li",[t._v("从当前组件实例 "),s("code",[t._v("vm")]),t._v(" 开始向父级组件逐层查找，直到找到 "),s("code",[t._v("_provided")]),t._v(" 属性，并且 "),s("code",[t._v("_provided")]),t._v(" 对象中存在键为 "),s("code",[t._v("provideKey")]),t._v(" 的属性。如果找到，则将该属性值存储在 "),s("code",[t._v("result[key]")]),t._v(" 中，并终止循环。")]),t._v(" "),s("li",[t._v("如果在所有父级组件中都未找到提供的值，则判断是否存在 "),s("code",[t._v("default")]),t._v(" 字段。如果存在，则将 "),s("code",[t._v("inject[key].default")]),t._v(" 的值赋给 "),s("code",[t._v("result[key]")]),t._v("，如果 "),s("code",[t._v("default")]),t._v(" 是一个函数，则绑定当前组件实例 "),s("code",[t._v("vm")]),t._v("，并调用该函数获取默认值。")]),t._v(" "),s("li",[t._v("如果既未找到提供的值，也不存在 "),s("code",[t._v("default")]),t._v(" 字段，则在非生产环境下发出警告，提示注入属性未找到。")])]),t._v(" "),s("ol",{attrs:{start:"4"}},[s("li",[t._v("返回解析后的注入属性对象 "),s("code",[t._v("result")]),t._v("。")])])])}),[],!1,null,null,null);s.default=a.exports}}]);