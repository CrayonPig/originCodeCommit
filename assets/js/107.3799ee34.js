(window.webpackJsonp=window.webpackJsonp||[]).push([[107],{422:function(t,s,n){"use strict";n.r(s);var a=n(14),e=Object(a.a)({},(function(){var t=this,s=t._self._c;return s("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[s("h1",{attrs:{id:"初始化-store-vm"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#初始化-store-vm"}},[t._v("#")]),t._v(" 初始化 store._vm")]),t._v(" "),s("p",[t._v("接下来，执行初始化"),s("code",[t._v("store._vm")]),t._v("的相关逻辑")]),t._v(" "),s("div",{staticClass:"language-js line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-js"}},[s("code",[s("span",{pre:!0,attrs:{class:"token function"}},[t._v("resetStoreVM")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("this")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" state"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 重置 Vuex store 中的 Vue 实例 _vm")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("resetStoreVM")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("store"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" state"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" hot")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 保存旧的 Vue 实例")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" oldVm "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" store"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("_vm\n\n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 绑定 store 的公共 getters")]),t._v("\n  store"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("getters "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 重置局部 getters 缓存")]),t._v("\n  store"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("_makeLocalGettersCache "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" Object"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("create")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("null")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" wrappedGetters "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" store"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("_wrappedGetters\n  "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" computed "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 遍历 store 中的 wrapped getters")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("forEachValue")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("wrappedGetters"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("fn"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" key")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 使用 computed 属性来利用其懒加载机制")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 直接内联函数使用会导致保留旧的 Vue 实例。")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 使用 partial 返回只在闭包环境中保留参数的函数。")]),t._v("\n    computed"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("key"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("partial")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("fn"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" store"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 通过 Object.defineProperty 定义 store 的 getters，以获取 _vm[key] 的值")]),t._v("\n    Object"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("defineProperty")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("store"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("getters"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" key"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token function-variable function"}},[t._v("get")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" store"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("_vm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("key"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("enumerable")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("true")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 用于局部 getters")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 创建一个新的 Vue 实例来存储状态树")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 禁用警告，以防用户添加了一些全局混入（mixins）")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" silent "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" Vue"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("config"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("silent\n  Vue"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("config"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("silent "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("true")]),t._v("\n  store"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("_vm "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Vue")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("data")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("$$state")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" state\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    computed\n  "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n  Vue"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("config"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("silent "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" silent\n\n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 如果 store 启用了严格模式，为新的 Vue 实例启用严格模式")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("store"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("strict"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("enableStrictMode")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("store"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 如果存在旧的 Vue 实例，且需要进行热重载（hot reloading）")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("oldVm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("hot"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 触发所有已订阅的观察者的更改")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 以强制重新评估 getter 以进行热重载")]),t._v("\n      store"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("_withCommit")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        oldVm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("_data"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$$state "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("null")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 在下一个事件循环中销毁旧的 Vue 实例")]),t._v("\n    Vue"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("nextTick")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" oldVm"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("$destroy")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")]),s("div",{pre:!0,attrs:{class:"m-mdic-copy-wrapper"}},[s("div",{pre:!0,attrs:{class:"u-mdic-copy-notify",id:"j-notify-1701072400263-58959"}},[t._v("成功")]),s("button",{pre:!0,attrs:{class:"u-mdic-copy-btn j-mdic-copy-btn","data-mdic-content":"resetStoreVM(this, state)\n\n// 重置 Vuex store 中的 Vue 实例 _vm\nfunction resetStoreVM (store, state, hot) {\n  // 保存旧的 Vue 实例\n  const oldVm = store._vm\n\n  // 绑定 store 的公共 getters\n  store.getters = {}\n  // 重置局部 getters 缓存\n  store._makeLocalGettersCache = Object.create(null)\n  const wrappedGetters = store._wrappedGetters\n  const computed = {}\n\n  // 遍历 store 中的 wrapped getters\n  forEachValue(wrappedGetters, (fn, key) => {\n    // 使用 computed 属性来利用其懒加载机制\n    // 直接内联函数使用会导致保留旧的 Vue 实例。\n    // 使用 partial 返回只在闭包环境中保留参数的函数。\n    computed[key] = partial(fn, store)\n\n    // 通过 Object.defineProperty 定义 store 的 getters，以获取 _vm[key] 的值\n    Object.defineProperty(store.getters, key, {\n      get: () => store._vm[key],\n      enumerable: true // 用于局部 getters\n    })\n  })\n\n  // 创建一个新的 Vue 实例来存储状态树\n  // 禁用警告，以防用户添加了一些全局混入（mixins）\n  const silent = Vue.config.silent\n  Vue.config.silent = true\n  store._vm = new Vue({\n    data: {\n      $state: state\n    },\n    computed\n  })\n  Vue.config.silent = silent\n\n  // 如果 store 启用了严格模式，为新的 Vue 实例启用严格模式\n  if (store.strict) {\n    enableStrictMode(store)\n  }\n\n  // 如果存在旧的 Vue 实例，且需要进行热重载（hot reloading）\n  if (oldVm) {\n    if (hot) {\n      // 触发所有已订阅的观察者的更改\n      // 以强制重新评估 getter 以进行热重载\n      store._withCommit(() => {\n        oldVm._data.$state = null\n      })\n    }\n    // 在下一个事件循环中销毁旧的 Vue 实例\n    Vue.nextTick(() => oldVm.$destroy())\n  }\n}\n","data-mdic-attach-content":"","data-mdic-notify-id":"j-notify-1701072400263-58959","data-mdic-notify-delay":"2000","data-mdic-copy-fail-text":"copy fail",onclick:"!function(t){const e={copy:(t='',e='')=>new Promise((c,o)=>{const n=document.createElement('textarea'),d=e?`\\n\\n${e}`:e;n.value=`${t}${d}`,document.body.appendChild(n),n.select();try{const t=document.execCommand('copy');document.body.removeChild(n),t?c():o()}catch(t){document.body.removeChild(n),o()}}),btnClick(t){const c=t&&t.dataset?t.dataset:{},o=c.mdicNotifyId,n=document.getElementById(o),d=c.mdicNotifyDelay,i=c.mdicCopyFailText;e.copy(c.mdicContent,c.mdicAttachContent).then(()=>{n.style.display='block',setTimeout(()=>{n.style.display='none'},d)}).catch(()=>{alert(i)})}};e.btnClick(t)}(this);"}},[t._v("复制代码")])])]),t._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[t._v("1")]),s("br"),s("span",{staticClass:"line-number"},[t._v("2")]),s("br"),s("span",{staticClass:"line-number"},[t._v("3")]),s("br"),s("span",{staticClass:"line-number"},[t._v("4")]),s("br"),s("span",{staticClass:"line-number"},[t._v("5")]),s("br"),s("span",{staticClass:"line-number"},[t._v("6")]),s("br"),s("span",{staticClass:"line-number"},[t._v("7")]),s("br"),s("span",{staticClass:"line-number"},[t._v("8")]),s("br"),s("span",{staticClass:"line-number"},[t._v("9")]),s("br"),s("span",{staticClass:"line-number"},[t._v("10")]),s("br"),s("span",{staticClass:"line-number"},[t._v("11")]),s("br"),s("span",{staticClass:"line-number"},[t._v("12")]),s("br"),s("span",{staticClass:"line-number"},[t._v("13")]),s("br"),s("span",{staticClass:"line-number"},[t._v("14")]),s("br"),s("span",{staticClass:"line-number"},[t._v("15")]),s("br"),s("span",{staticClass:"line-number"},[t._v("16")]),s("br"),s("span",{staticClass:"line-number"},[t._v("17")]),s("br"),s("span",{staticClass:"line-number"},[t._v("18")]),s("br"),s("span",{staticClass:"line-number"},[t._v("19")]),s("br"),s("span",{staticClass:"line-number"},[t._v("20")]),s("br"),s("span",{staticClass:"line-number"},[t._v("21")]),s("br"),s("span",{staticClass:"line-number"},[t._v("22")]),s("br"),s("span",{staticClass:"line-number"},[t._v("23")]),s("br"),s("span",{staticClass:"line-number"},[t._v("24")]),s("br"),s("span",{staticClass:"line-number"},[t._v("25")]),s("br"),s("span",{staticClass:"line-number"},[t._v("26")]),s("br"),s("span",{staticClass:"line-number"},[t._v("27")]),s("br"),s("span",{staticClass:"line-number"},[t._v("28")]),s("br"),s("span",{staticClass:"line-number"},[t._v("29")]),s("br"),s("span",{staticClass:"line-number"},[t._v("30")]),s("br"),s("span",{staticClass:"line-number"},[t._v("31")]),s("br"),s("span",{staticClass:"line-number"},[t._v("32")]),s("br"),s("span",{staticClass:"line-number"},[t._v("33")]),s("br"),s("span",{staticClass:"line-number"},[t._v("34")]),s("br"),s("span",{staticClass:"line-number"},[t._v("35")]),s("br"),s("span",{staticClass:"line-number"},[t._v("36")]),s("br"),s("span",{staticClass:"line-number"},[t._v("37")]),s("br"),s("span",{staticClass:"line-number"},[t._v("38")]),s("br"),s("span",{staticClass:"line-number"},[t._v("39")]),s("br"),s("span",{staticClass:"line-number"},[t._v("40")]),s("br"),s("span",{staticClass:"line-number"},[t._v("41")]),s("br"),s("span",{staticClass:"line-number"},[t._v("42")]),s("br"),s("span",{staticClass:"line-number"},[t._v("43")]),s("br"),s("span",{staticClass:"line-number"},[t._v("44")]),s("br"),s("span",{staticClass:"line-number"},[t._v("45")]),s("br"),s("span",{staticClass:"line-number"},[t._v("46")]),s("br"),s("span",{staticClass:"line-number"},[t._v("47")]),s("br"),s("span",{staticClass:"line-number"},[t._v("48")]),s("br"),s("span",{staticClass:"line-number"},[t._v("49")]),s("br"),s("span",{staticClass:"line-number"},[t._v("50")]),s("br"),s("span",{staticClass:"line-number"},[t._v("51")]),s("br"),s("span",{staticClass:"line-number"},[t._v("52")]),s("br"),s("span",{staticClass:"line-number"},[t._v("53")]),s("br"),s("span",{staticClass:"line-number"},[t._v("54")]),s("br"),s("span",{staticClass:"line-number"},[t._v("55")]),s("br"),s("span",{staticClass:"line-number"},[t._v("56")]),s("br"),s("span",{staticClass:"line-number"},[t._v("57")]),s("br"),s("span",{staticClass:"line-number"},[t._v("58")]),s("br")])]),s("ol",[s("li",[t._v("首先保存了旧的 Vue 实例 "),s("code",[t._v("oldVm")]),t._v("，然后重置了 Vuex store 的 getters，并清除了局部 getters 的缓存。")]),t._v(" "),s("li",[t._v("定义了一个名为 "),s("code",[t._v("computed")]),t._v(" 的空对象，它将用来存储 Vuex 的 getters，每个 getter 都会被转换为 Vue 的计算属性。")]),t._v(" "),s("li",[t._v("遍历了 store 中的 "),s("code",[t._v("wrappedGetters")]),t._v("（包装过的 getters），将每个 getter 函数封装为一个计算属性函数，并存储在 "),s("code",[t._v("computed")]),t._v(" 对象中。")]),t._v(" "),s("li",[t._v("接着，使用 "),s("code",[t._v("Object.defineProperty")]),t._v(" 方法定义了 "),s("code",[t._v("store.getters")]),t._v(" 的 getter 和 setter，"),s("code",[t._v("getter")]),t._v(" 方法返回 "),s("code",[t._v("store._vm[key]")]),t._v(" 的值，其中 "),s("code",[t._v("key")]),t._v(" 就是 getter 的名称。"),s("code",[t._v("enumerable")]),t._v(" 属性设置为 "),s("code",[t._v("true")]),t._v("，表示该属性是可枚举的，主要用于支持局部的 getters。")]),t._v(" "),s("li",[t._v("然后，创建了一个新的 Vue 实例 "),s("code",[t._v("store._vm")]),t._v("，用来存储 Vuex 的 state 状态树和计算属性 "),s("code",[t._v("computed")]),t._v("。")]),t._v(" "),s("li",[t._v("如果 Vuex store 启用了严格模式，那么也要为新的 "),s("code",[t._v("_vm")]),t._v(" 实例启用严格模式。")]),t._v(" "),s("li",[t._v("如果存在旧的 Vue 实例并启用了热重载功能，那么会触发所有的观察者的更改，强制重新计算所有的 getter，然后在下一个事件循环中销毁旧的 Vue 实例。")])]),t._v(" "),s("p",[t._v("综上所述，"),s("code",[t._v("_vm")]),t._v(" 实例用于存储 "),s("code",[t._v("Vuex")]),t._v(" 的 "),s("code",[t._v("state")]),t._v(" 状态树和计算属性，在 "),s("code",[t._v("Vuex")]),t._v(" 内部，"),s("code",[t._v("getter")]),t._v(" 的实现就依赖于 "),s("code",[t._v("Vue")]),t._v(" 实例的计算属性。")])])}),[],!1,null,null,null);s.default=e.exports}}]);