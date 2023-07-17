(window.webpackJsonp=window.webpackJsonp||[]).push([[10],{299:function(t,n,e){t.exports=e.p+"assets/img/updateChildDOM.32efdb7a.png"},300:function(t,n,e){t.exports=e.p+"assets/img/updateChildMove.b9621b4d.png"},341:function(t,n,e){"use strict";e.r(n);var s=e(14),a=Object(s.a)({},(function(){var t=this,n=t._self._c;return n("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[n("h1",{attrs:{id:"更新子节点"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#更新子节点"}},[t._v("#")]),t._v(" 更新子节点")]),t._v(" "),n("p",[t._v("在上一节中，我们研究了更新节点的过程，在这个过程中说到，当新节点"),n("code",[t._v("vnode")]),t._v("和旧节点"),n("code",[t._v("oldVnode")]),t._v(" 都有子节点并且子节点不相同时，需要进行子节点的更新。本节我们就来详细研究这个过程。")]),t._v(" "),n("p",[t._v("我们将新子节点列表记为"),n("code",[t._v("newChildren")]),t._v("，旧子节点列表记为"),n("code",[t._v("oldChildren")]),t._v("。当需要对比两个列表时，我们需要将两个列表的每一个子节点进行对比，所以就有了如下双重循环的"),n("strong",[t._v("伪代码")]),t._v("(仅供梳理思路使用)：")]),t._v(" "),n("div",{staticClass:"language-js line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-js"}},[n("code",[n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("for")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" i "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" i "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("<")]),t._v(" newChildren"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("length"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" i"),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("++")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" newChild "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" newChildren"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("i"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("for")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" j "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" j "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("<")]),t._v(" oldChildren"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("length"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" j"),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("++")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" oldChild "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" oldChildren"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("j"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("newChild "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("===")]),t._v(" oldChild"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n      "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// ...")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")]),n("div",{pre:!0,attrs:{class:"m-mdic-copy-wrapper"}},[n("div",{pre:!0,attrs:{class:"u-mdic-copy-notify",id:"j-notify-1689603115476-27786"}},[t._v("成功")]),n("button",{pre:!0,attrs:{class:"u-mdic-copy-btn j-mdic-copy-btn","data-mdic-content":"for (let i = 0; i < newChildren.length; i++) {\n  const newChild = newChildren[i];\n  for (let j = 0; j < oldChildren.length; j++) {\n    const oldChild = oldChildren[j];\n    if (newChild === oldChild) {\n      // ...\n    }\n  }\n}\n","data-mdic-attach-content":"","data-mdic-notify-id":"j-notify-1689603115476-27786","data-mdic-notify-delay":"2000","data-mdic-copy-fail-text":"copy fail",onclick:"!function(t){const e={copy:(t='',e='')=>new Promise((c,o)=>{const n=document.createElement('textarea'),d=e?`\\n\\n${e}`:e;n.value=`${t}${d}`,document.body.appendChild(n),n.select();try{const t=document.execCommand('copy');document.body.removeChild(n),t?c():o()}catch(t){document.body.removeChild(n),o()}}),btnClick(t){const c=t&&t.dataset?t.dataset:{},o=c.mdicNotifyId,n=document.getElementById(o),d=c.mdicNotifyDelay,i=c.mdicCopyFailText;e.copy(c.mdicContent,c.mdicAttachContent).then(()=>{n.style.display='block',setTimeout(()=>{n.style.display='none'},d)}).catch(()=>{alert(i)})}};e.btnClick(t)}(this);"}},[t._v("复制代码")])])]),t._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[t._v("1")]),n("br"),n("span",{staticClass:"line-number"},[t._v("2")]),n("br"),n("span",{staticClass:"line-number"},[t._v("3")]),n("br"),n("span",{staticClass:"line-number"},[t._v("4")]),n("br"),n("span",{staticClass:"line-number"},[t._v("5")]),n("br"),n("span",{staticClass:"line-number"},[t._v("6")]),n("br"),n("span",{staticClass:"line-number"},[t._v("7")]),n("br"),n("span",{staticClass:"line-number"},[t._v("8")]),n("br"),n("span",{staticClass:"line-number"},[t._v("9")]),n("br")])]),n("p",[t._v("在这个过程中，我们可以发现一共有四种情况。")]),t._v(" "),n("ol",[n("li",[t._v("新增子节点\n当一个节点只存在"),n("code",[t._v("newChildren")]),t._v("中时，说明这个节点是本次新增的节点，需要创建到DOM中")]),t._v(" "),n("li",[t._v("删除子节点\n当一个节点只存在"),n("code",[t._v("oldChildren")]),t._v("中时，说明这个节点是本次删除的节点，需要从DOM中删除")]),t._v(" "),n("li",[t._v("更新子节点\n当一个节点同时在两个节点列表中存在，位置相同但是值不同时，说明这个节点发生了更新，需要更新到DOM中")]),t._v(" "),n("li",[t._v("移动子节点\n当一个节点同时在两个节点列表中存在，但是位置不同，说明这个节点需要移动到另一个位置")])]),t._v(" "),n("p",[t._v("梳理完可能出现的情况后，我们就可以针对每种情况进行分析了。")]),t._v(" "),n("h2",{attrs:{id:"新增子节点"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#新增子节点"}},[t._v("#")]),t._v(" 新增子节点")]),t._v(" "),n("p",[t._v("当一个节点只存在"),n("code",[t._v("newChildren")]),t._v("中时，说明这个节点是本次新增的节点，需要创建到真实DOM中。")]),t._v(" "),n("p",[t._v("对于新增的节点，我们需要执行创建节点的逻辑，并将新创建的节点插入到"),n("code",[t._v("oldChildren")]),t._v("中所有未处理节点（没有经过更新操作的节点）的前面。")]),t._v(" "),n("p",[t._v("创建节点的逻辑，我们上一节已经分析过，这里就不再赘述了。")]),t._v(" "),n("p",[t._v("创建节点完毕后，下一步就是要把这个节点插入到"),n("code",[t._v("oldChildren")]),t._v("中所有未处理节点的前面。为什么是未处理节点的前面呢？")]),t._v(" "),n("p",[n("img",{attrs:{src:e(299),alt:"DOM"}})]),t._v(" "),n("p",[t._v("假设我们现在在对比新老子节点列表的过程中（当前DOM状态如图所示），发现位于列表第三个子节点是一个需要新增的子节点，在上图所示的DOM树中，可供新增子节点插入的位置有几个呢？")]),t._v(" "),n("ol",[n("li",[n("strong",[t._v("已处理前")])])]),t._v(" "),n("p",[t._v("如果将新增子节点放入已处理前的位置中，第三个子节点就变成了DOM树的第一个子节点，导致渲染顺序错乱")]),t._v(" "),n("ol",{attrs:{start:"2"}},[n("li",[n("strong",[t._v("已处理节点后")])])]),t._v(" "),n("p",[t._v("好像还行")]),t._v(" "),n("ol",{attrs:{start:"3"}},[n("li",[n("strong",[t._v("未处理节点前")])])]),t._v(" "),n("p",[t._v("好像还行")]),t._v(" "),n("ol",{attrs:{start:"4"}},[n("li",[n("strong",[t._v("未处理节点后")]),t._v("\n如果新增子节点放在未处理节点后，如果下一个子节点是需要更新的，不会放在这个新增子节点的后面，导致渲染顺序错乱")])]),t._v(" "),n("p",[t._v("所以，供我们选择的只有两种情况，放在已处理节点后，或者未处理节点前。")]),t._v(" "),n("p",[t._v("有的同学就很疑惑，这俩有啥区别呢？不都是在已处理节点和未处理节点的中间么？")]),t._v(" "),n("p",[t._v("对于单个节点来说没啥区别，但对于多个节点排序来说，就是有区别的。")]),t._v(" "),n("p",[t._v("假设我们现在将已处理节点设为"),n("code",[t._v("X")]),t._v("，未处理节点为"),n("code",[t._v("Y")]),t._v("，子节点列表位于第三个需要新增的为"),n("code",[t._v("3")]),t._v("，子节点列表位于第四个需要新增的为"),n("code",[t._v("4")]),t._v("。按照"),n("code",[t._v("已处理节点后")]),t._v("规则来讲，应该是这样的")]),t._v(" "),n("div",{staticClass:"language-js line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-js"}},[n("code",[n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 已处理节点后")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 未添加时的DOM树顺序")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("XXYY")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 新增第三个后的DOM树顺序")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("XX3YY")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 新增第四个后的DOM树顺序")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("XX43YY")]),t._v("\n")]),n("div",{pre:!0,attrs:{class:"m-mdic-copy-wrapper"}},[n("div",{pre:!0,attrs:{class:"u-mdic-copy-notify",id:"j-notify-1689603115476-50369"}},[t._v("成功")]),n("button",{pre:!0,attrs:{class:"u-mdic-copy-btn j-mdic-copy-btn","data-mdic-content":"// 已处理节点后\n// 未添加时的DOM树顺序\nXXYY\n// 新增第三个后的DOM树顺序\nXX3YY\n// 新增第四个后的DOM树顺序\nXX43YY\n","data-mdic-attach-content":"","data-mdic-notify-id":"j-notify-1689603115476-50369","data-mdic-notify-delay":"2000","data-mdic-copy-fail-text":"copy fail",onclick:"!function(t){const e={copy:(t='',e='')=>new Promise((c,o)=>{const n=document.createElement('textarea'),d=e?`\\n\\n${e}`:e;n.value=`${t}${d}`,document.body.appendChild(n),n.select();try{const t=document.execCommand('copy');document.body.removeChild(n),t?c():o()}catch(t){document.body.removeChild(n),o()}}),btnClick(t){const c=t&&t.dataset?t.dataset:{},o=c.mdicNotifyId,n=document.getElementById(o),d=c.mdicNotifyDelay,i=c.mdicCopyFailText;e.copy(c.mdicContent,c.mdicAttachContent).then(()=>{n.style.display='block',setTimeout(()=>{n.style.display='none'},d)}).catch(()=>{alert(i)})}};e.btnClick(t)}(this);"}},[t._v("复制代码")])])]),t._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[t._v("1")]),n("br"),n("span",{staticClass:"line-number"},[t._v("2")]),n("br"),n("span",{staticClass:"line-number"},[t._v("3")]),n("br"),n("span",{staticClass:"line-number"},[t._v("4")]),n("br"),n("span",{staticClass:"line-number"},[t._v("5")]),n("br"),n("span",{staticClass:"line-number"},[t._v("6")]),n("br"),n("span",{staticClass:"line-number"},[t._v("7")]),n("br")])]),n("p",[t._v("可以看到，新增位于第三个的子节点时没问题，新增位于第四个子节点的时候，顺序就乱了，第四个子节点跑到第三个子节点前面了。")]),t._v(" "),n("p",[t._v("按照"),n("code",[t._v("未处理节点前")]),t._v("的规则，如下所示")]),t._v(" "),n("div",{staticClass:"language-js line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-js"}},[n("code",[n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 已处理节点后")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 未添加时的DOM树顺序")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("XXYY")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 新增第三个后的DOM树顺序")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("XX3YY")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 新增第四个后的DOM树顺序")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("XX34YY")]),t._v("\n")]),n("div",{pre:!0,attrs:{class:"m-mdic-copy-wrapper"}},[n("div",{pre:!0,attrs:{class:"u-mdic-copy-notify",id:"j-notify-1689603115476-55516"}},[t._v("成功")]),n("button",{pre:!0,attrs:{class:"u-mdic-copy-btn j-mdic-copy-btn","data-mdic-content":"// 已处理节点后\n// 未添加时的DOM树顺序\nXXYY\n// 新增第三个后的DOM树顺序\nXX3YY\n// 新增第四个后的DOM树顺序\nXX34YY\n","data-mdic-attach-content":"","data-mdic-notify-id":"j-notify-1689603115476-55516","data-mdic-notify-delay":"2000","data-mdic-copy-fail-text":"copy fail",onclick:"!function(t){const e={copy:(t='',e='')=>new Promise((c,o)=>{const n=document.createElement('textarea'),d=e?`\\n\\n${e}`:e;n.value=`${t}${d}`,document.body.appendChild(n),n.select();try{const t=document.execCommand('copy');document.body.removeChild(n),t?c():o()}catch(t){document.body.removeChild(n),o()}}),btnClick(t){const c=t&&t.dataset?t.dataset:{},o=c.mdicNotifyId,n=document.getElementById(o),d=c.mdicNotifyDelay,i=c.mdicCopyFailText;e.copy(c.mdicContent,c.mdicAttachContent).then(()=>{n.style.display='block',setTimeout(()=>{n.style.display='none'},d)}).catch(()=>{alert(i)})}};e.btnClick(t)}(this);"}},[t._v("复制代码")])])]),t._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[t._v("1")]),n("br"),n("span",{staticClass:"line-number"},[t._v("2")]),n("br"),n("span",{staticClass:"line-number"},[t._v("3")]),n("br"),n("span",{staticClass:"line-number"},[t._v("4")]),n("br"),n("span",{staticClass:"line-number"},[t._v("5")]),n("br"),n("span",{staticClass:"line-number"},[t._v("6")]),n("br"),n("span",{staticClass:"line-number"},[t._v("7")]),n("br")])]),n("p",[t._v("可以看到，按照"),n("code",[t._v("未处理节点前")]),t._v("的规则，新增操作完成后的顺序才能保持一致")]),t._v(" "),n("p",[t._v("所以，"),n("strong",[t._v("合适的位置是所有未处理节点之前，而并非所有已处理节点之后。")])]),t._v(" "),n("h2",{attrs:{id:"删除子节点"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#删除子节点"}},[t._v("#")]),t._v(" 删除子节点")]),t._v(" "),n("p",[t._v("当一个节点只存在"),n("code",[t._v("oldChildren")]),t._v("中时，说明这个节点是本次删除的节点，需要从DOM中删除。")]),t._v(" "),n("p",[t._v("删除节点的逻辑上节也分析过，这里同样不赘述")]),t._v(" "),n("h2",{attrs:{id:"更新子节点-2"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#更新子节点-2"}},[t._v("#")]),t._v(" 更新子节点")]),t._v(" "),n("p",[t._v("当一个节点同时在两个节点列表中存在，位置相同但是值不同时，说明这个节点发生了更新，需要更新到DOM中")]),t._v(" "),n("p",[t._v("更新节点的逻辑上节也分析过，这里同样不赘述")]),t._v(" "),n("h2",{attrs:{id:"移动子节点"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#移动子节点"}},[t._v("#")]),t._v(" 移动子节点")]),t._v(" "),n("p",[t._v("当一个节点同时在两个节点列表中存在，但是位置不同，说明这个节点需要移动到另一个位置")]),t._v(" "),n("p",[t._v("通过"),n("code",[t._v("insertBefore")]),t._v(" 方法，我们可以将一个已有节点移动到指定的位置。")]),t._v(" "),n("p",[t._v("那么我们怎么得到这个指定的位置呢？")]),t._v(" "),n("p",[t._v("其实这个跟新增的逻辑是一样的，都是"),n("strong",[t._v("未处理节点的最前面")]),t._v("，下图可供参考")]),t._v(" "),n("p",[n("img",{attrs:{src:e(300),alt:"updateChildMove"}})]),t._v(" "),n("h2",{attrs:{id:"回到源码"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#回到源码"}},[t._v("#")]),t._v(" 回到源码")]),t._v(" "),n("p",[t._v("上述四种情况分析完毕后，我们回到源码看看，Vue实现的逻辑是否跟我们一样。源码在"),n("code",[t._v("/src/core/vdom/patch.js")])]),t._v(" "),n("div",{staticClass:"language-js line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-js"}},[n("code",[n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//  oldChildren找不到当前循环的newChildren里的子节点")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("isUndef")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("idxInOld"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// New element")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 新增节点，插入到指定位置")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("createElm")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("newStartVnode"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" insertedVnodeQueue"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" parentElm"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" oldStartVnode"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("elm"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("false")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" newCh"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" newStartIdx"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 如果在oldChildren里找到了当前循环的newChildren里的子节点")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("else")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  vnodeToMove "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" oldCh"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("idxInOld"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 如果两个节点相同")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("sameVnode")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("vnodeToMove"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" newStartVnode"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 调用patchVnode更新节点")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("patchVnode")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("vnodeToMove"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" newStartVnode"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" insertedVnodeQueue"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n    oldCh"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("idxInOld"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("undefined")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// canmove表示是否需要移动节点，如果为true表示需要移动，则移动节点，如果为false则不用移动")]),t._v("\n    canMove "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("&&")]),t._v(" nodeOps"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("insertBefore")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("parentElm"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" vnodeToMove"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("elm"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" oldStartVnode"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("elm"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// key不同或者key相同但element不同，则视为不同，需要新建")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("else")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// same key but different element. treat as new element")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("createElm")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("newStartVnode"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" insertedVnodeQueue"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" parentElm"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" oldStartVnode"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("elm"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("false")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" newCh"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" newStartIdx"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")]),n("div",{pre:!0,attrs:{class:"m-mdic-copy-wrapper"}},[n("div",{pre:!0,attrs:{class:"u-mdic-copy-notify",id:"j-notify-1689603115476-55694"}},[t._v("成功")]),n("button",{pre:!0,attrs:{class:"u-mdic-copy-btn j-mdic-copy-btn","data-mdic-content":"//  oldChildren找不到当前循环的newChildren里的子节点\nif (isUndef(idxInOld)) { // New element\n  // 新增节点，插入到指定位置\n  createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)\n// 如果在oldChildren里找到了当前循环的newChildren里的子节点\n} else {\n  vnodeToMove = oldCh[idxInOld]\n  // 如果两个节点相同\n  if (sameVnode(vnodeToMove, newStartVnode)) {\n    // 调用patchVnode更新节点\n    patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue)\n    oldCh[idxInOld] = undefined\n    // canmove表示是否需要移动节点，如果为true表示需要移动，则移动节点，如果为false则不用移动\n    canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)\n  // key不同或者key相同但element不同，则视为不同，需要新建\n  } else {\n    // same key but different element. treat as new element\n    createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)\n  }\n}\n","data-mdic-attach-content":"","data-mdic-notify-id":"j-notify-1689603115476-55694","data-mdic-notify-delay":"2000","data-mdic-copy-fail-text":"copy fail",onclick:"!function(t){const e={copy:(t='',e='')=>new Promise((c,o)=>{const n=document.createElement('textarea'),d=e?`\\n\\n${e}`:e;n.value=`${t}${d}`,document.body.appendChild(n),n.select();try{const t=document.execCommand('copy');document.body.removeChild(n),t?c():o()}catch(t){document.body.removeChild(n),o()}}),btnClick(t){const c=t&&t.dataset?t.dataset:{},o=c.mdicNotifyId,n=document.getElementById(o),d=c.mdicNotifyDelay,i=c.mdicCopyFailText;e.copy(c.mdicContent,c.mdicAttachContent).then(()=>{n.style.display='block',setTimeout(()=>{n.style.display='none'},d)}).catch(()=>{alert(i)})}};e.btnClick(t)}(this);"}},[t._v("复制代码")])])]),t._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[t._v("1")]),n("br"),n("span",{staticClass:"line-number"},[t._v("2")]),n("br"),n("span",{staticClass:"line-number"},[t._v("3")]),n("br"),n("span",{staticClass:"line-number"},[t._v("4")]),n("br"),n("span",{staticClass:"line-number"},[t._v("5")]),n("br"),n("span",{staticClass:"line-number"},[t._v("6")]),n("br"),n("span",{staticClass:"line-number"},[t._v("7")]),n("br"),n("span",{staticClass:"line-number"},[t._v("8")]),n("br"),n("span",{staticClass:"line-number"},[t._v("9")]),n("br"),n("span",{staticClass:"line-number"},[t._v("10")]),n("br"),n("span",{staticClass:"line-number"},[t._v("11")]),n("br"),n("span",{staticClass:"line-number"},[t._v("12")]),n("br"),n("span",{staticClass:"line-number"},[t._v("13")]),n("br"),n("span",{staticClass:"line-number"},[t._v("14")]),n("br"),n("span",{staticClass:"line-number"},[t._v("15")]),n("br"),n("span",{staticClass:"line-number"},[t._v("16")]),n("br"),n("span",{staticClass:"line-number"},[t._v("17")]),n("br"),n("span",{staticClass:"line-number"},[t._v("18")]),n("br"),n("span",{staticClass:"line-number"},[t._v("19")]),n("br"),n("span",{staticClass:"line-number"},[t._v("20")]),n("br")])]),n("ul",[n("li",[t._v("如果当前循环的"),n("code",[t._v("newChildren")]),t._v("里的子节点在"),n("code",[t._v("oldChildren")]),t._v("不存在，则表示是一个新的节点，需要创建并插入到指定位置。")]),t._v(" "),n("li",[t._v("如果在 "),n("code",[t._v("oldChildren")]),t._v(" 中找到了相同的子节点，则执行以下判断：\n"),n("ul",[n("li",[t._v("如果两个子节点相同（key相同，元素类型相同），则调用 "),n("code",[t._v("patchVnode")]),t._v(" 函数更新节点属性，更新完成后位置不同再挪动位置")]),t._v(" "),n("li",[t._v("如果key不同或者key相同，但元素类型不同，则视为不同的节点，需要创建新节点并插入到指定位置。")])])])]),t._v(" "),n("h2",{attrs:{id:"总结"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#总结"}},[t._v("#")]),t._v(" 总结")]),t._v(" "),n("p",[t._v("本小节通过对于 "),n("code",[t._v("oldChildren")]),t._v(" 和"),n("code",[t._v("newChildren")]),t._v(" 双循环的每个子节点对比，根据不同情况作出创建子节点、删除子节点、更新子节点以及移动子节点的操作。并针对每个操作进行了分析，最后归回源码，发现源码的逻辑与我们的保持一致。")]),t._v(" "),n("p",[t._v("我们知道双重循环的时间复杂度为"),n("code",[t._v("O(n^2)")]),t._v("，假设我们有一万个子节点，那我们就需要计算一亿次。这几乎是没法用到实际场景中的，那Vue是怎么优化这个算法的呢？我们下节分析")])])}),[],!1,null,null,null);n.default=a.exports}}]);