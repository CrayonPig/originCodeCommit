(window.webpackJsonp=window.webpackJsonp||[]).push([[70],{377:function(v,_,e){"use strict";e.r(_);var o=e(14),t=Object(o.a)({},(function(){var v=this,_=v._self._c;return _("ContentSlotsDistributor",{attrs:{"slot-key":v.$parent.slotKey}},[_("h1",{attrs:{id:"总结"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#总结"}},[v._v("#")]),v._v(" 总结")]),v._v(" "),_("p",[v._v("在前几小节，我们分析了初始化的每个环节，让大家对初始化有了一定的印象，本小节，我们根据"),_("strong",[v._v("代码执行顺序")]),v._v("，总结下初始化环节做了哪些事情。")]),v._v(" "),_("ol",[_("li",[v._v("实例化"),_("code",[v._v("Vue Router")]),v._v(" "),_("ol",[_("li",[v._v("使用初始化参数"),_("code",[v._v("routes")]),v._v("调用"),_("code",[v._v("createMatcher")]),v._v("函数，创建路由匹配器")]),v._v(" "),_("li",[v._v("根据初始化参数"),_("code",[v._v("mode")]),v._v("，判断路由模式")]),v._v(" "),_("li",[v._v("根据匹配的路由模式创建对应的路由实例")])])]),v._v(" "),_("li",[v._v("将实例化后的对象作为参数传递给"),_("code",[v._v("new Vue")])]),v._v(" "),_("li",[v._v("调用"),_("code",[v._v("Vue.use(VueRouter)")]),v._v("，插件注册完成\n"),_("ol",[_("li",[v._v("防止重复注册组件实例")]),v._v(" "),_("li",[v._v("将路由相关的逻辑通过"),_("code",[v._v("Vue.mixin")]),v._v("混入到每个 Vue 组件实例的"),_("code",[v._v("beforeCreate")]),v._v("和"),_("code",[v._v("destroyed")]),v._v("钩子函数中")]),v._v(" "),_("li",[v._v("设置"),_("code",[v._v("$router")]),v._v("和"),_("code",[v._v("$route")]),v._v("的代理，分别指向当前实例上的"),_("code",[v._v("_router")]),v._v("以及"),_("code",[v._v("_route")]),v._v("属性")]),v._v(" "),_("li",[v._v("全局注册组件"),_("code",[v._v("router-link")]),v._v("和"),_("code",[v._v("router-view")])]),v._v(" "),_("li",[v._v("设置路由的钩子函数与 "),_("code",[v._v("vue.created")]),v._v(" 一样的 "),_("code",[v._v("mixin")]),v._v(" 合并策略")])])]),v._v(" "),_("li",[v._v("根组件渲染，触发插件"),_("code",[v._v("install")]),v._v("中"),_("code",[v._v("Vue.mixin")]),v._v("的生命周期\n"),_("ol",[_("li",[v._v("判断如果是根组件调用"),_("code",[v._v("VueRouter")]),v._v("实例的"),_("code",[v._v("init")]),v._v("方法完成初始化\n"),_("ol",[_("li",[v._v("增加 "),_("code",[v._v("destroyed")]),v._v(" 钩子函数，用于销毁实例")]),v._v(" "),_("li",[v._v("如果是浏览器的 "),_("code",[v._v("history")]),v._v(" 或 "),_("code",[v._v("hash")]),v._v(" 模式，初始化滚动方法")]),v._v(" "),_("li",[v._v("监听路由变化，同步新的路由对象到所有Vue实例")])])]),v._v(" "),_("li",[v._v("调用"),_("code",[v._v("registerInstance")]),v._v("方法将当前组件实例注册到父组件中，完成了对"),_("code",[v._v("router-view")]),v._v("的挂载操作")])])])])])}),[],!1,null,null,null);_.default=t.exports}}]);