# 代码生成阶段

用户编写的模板字符串，在经过模板编译阶段生成`AST`，在优化阶段标记`AST`中的静态节点和静态根节点后，就要进入代码生成阶段了。

代码生成阶段，顾名思义，就是将之前生成的`AST`生成`render`函数字符串的阶段。Vue 通过调用`render`函数字符串，就可以生成`vnode`，供后续渲染使用。

## 通过AST生成render函数

生成`render`函数的过程其实就是一个递归的过程，从顶向下依次递归`AST`中的每一个节点，根据不同的`AST`节点类型创建不同的`vnode`类型。

我们通过一个示例来说明下，假如现在有一个模板字符串如下，需要生成`render`函数

```vue
<div id="NLRX"><p>Hello {{name}}</p></div>
```

该模板经过模板编译阶段和优化阶段后对应的`AST`如下：

```js
{
  'type': 1,
  'tag': 'div',
  'attrsList': [
    {
      'name':'id',
      'value':'NLRX',
    }
  ],
  'attrsMap': {
    'id': 'NLRX',
  },
  'static':false,
  'parent': undefined,
  'plain': false,
  'children': [{
    'type': 1,
    'tag': 'p',
    'plain': false,
    'static':false,
    'children': [
      {
        'type': 2,
        'expression': '"Hello "+_s(name)',
        'text': 'Hello {{name}}',
        'static':false,
      }
    ]
  }]
}
```

接下来我们就来对照已有的模板和AST实际演示一下生成`render`函数的过程。

1. 首先，根节点`type: 1`说明是一个元素节点，`tag`为`div`说明是个`div`标签。那我们就要创建一个`div`的元素节点。我们假设创建一个元素型`VNode`的方法叫做`_c(tagName,data,children)`，那么可以生成如下代码：

```js
_c('div',{attrs:{"id":"NLRX"}},[/*子节点列表*/])
```

2. 接下来发现根节点有子节点`children`，并且子节点是元素节点`p`。同理可得：

```js
_c('div',{attrs:{"id":"NLRX"}},[_c('p'),[/*子节点列表*/]])
```

3. 继续往下，元素节点`p`还有子节点`children`，子节点是文本节点，那就创建一个文本型VNode并将其插入到p节点的子节点列表中，这个方法我们先定义为`_v()`

```js
_c('div',{attrs:{"id":"NLRX"}},[_c('p'),[_v("Hello "+_s(name))]])
```

4. 到此，整个`AST`就遍历完毕了，我们将得到的函数字符串再包装一下，如下：

```js
`
with(this){
  return _c(
    'div',
    {
      attrs:{"id":"NLRX"},
    }
    [
      _c('p'),
      [
        _v("Hello "+_s(name))
      ]
    ])
}
`
```

5. 最后，将上面得到的这个函数字符串传递给`createFunction`函数（关于这个函数在后面会介绍到），`createFunction`函数会帮我们把得到的函数字符串转换成真正的函数，赋给组件中的`render`选项，从而就是`render`函数了。如下：

```js
res.render = createFunction(compiled.render, fnGenErrors)

function createFunction (code, errors) {
  try {
    return new Function(code)
  } catch (err) {
    errors.push({ err, code })
    return noop
  }
}
```

以上就是一个简单的将模板字符串生成为`render`函数的过程，接下来我们看源码来分析具体的实现过程。

## 源码分析

源码在`src/compiler/codegen/index.js`

```js
export function generate (
  ast: ASTElement | void,
  options: CompilerOptions
): CodegenResult {
  const state = new CodegenState(options)
  // ast 不存在，生成一个空div vnode
  const code = ast ? genElement(ast, state) : '_c("div")'
  return {
    render: `with(this){return ${code}}`,
    staticRenderFns: state.staticRenderFns
  }
}
```

从上述代码中可以看出，实际核心代码是`genElement(ast, state)`，通过`genElement`生成函数字符串，在`return`中包裹`with(this){return ${code}}`返回。那我们先分析`genElement`函数。

```js
export function genElement (el: ASTElement, state: CodegenState): string {
  // 静态节点并且未处理过
  if (el.staticRoot && !el.staticProcessed) {
    return genStatic(el, state)
  // 节点具有 once 属性且未被处理过
  } else if (el.once && !el.onceProcessed) {
    return genOnce(el, state)
  // 节点具有 for 属性且未被处理过
  } else if (el.for && !el.forProcessed) {
    return genFor(el, state)
  // 节点具有 if 属性且未被处理过
  } else if (el.if && !el.ifProcessed) {
    return genIf(el, state)
  // 节点是 template 标签且没有 slotTarget 属性
  } else if (el.tag === 'template' && !el.slotTarget) {
    return genChildren(el, state) || 'void 0'
  // 插槽
  } else if (el.tag === 'slot') {
    return genSlot(el, state)
  // 组件或元素
  } else {
    // component or element
    let code
    // 如果是组件
    if (el.component) {
      code = genComponent(el.component, el, state)
    // 是元素节点
    } else {
      // 如果节点没有属性，无需处理
      const data = el.plain ? undefined : genData(el, state)
      // 如果有内联的模板内容，不需要生成子节点
      const children = el.inlineTemplate ? null : genChildren(el, state, true)
      code = `_c('${el.tag}'${
        data ? `,${data}` : '' // data
      }${
        children ? `,${children}` : '' // children
      })`
    }

    // module transforms
    for (let i = 0; i < state.transforms.length; i++) {
      code = state.transforms[i](el, code)
    }
    return code
  }
}
```

`genElement`函数会根据当前 AST 元素节点属性的不同从而执行不同的代码生成函数。初看会感觉判断逻辑相当之多，但实际上虽然需要处理的逻辑较多，但最后由`AST`生成的只有三种节点类型，元素节点、文本节点和注释节点。我们只需要分析这三种节点即可。

### 元素节点

生成元素节点的代码在`genElement`中，如下：

```js
// 如果节点没有属性，无需处理
const data = el.plain ? undefined : genData(el, state)
// 如果有内联的模板内容，不需要生成子节点
const children = el.inlineTemplate ? null : genChildren(el, state, true)
code = `_c('${el.tag}'${
  data ? `,${data}` : '' // data
}${
  children ? `,${children}` : '' // children
})`
```

首先，`el.plain`是在编译的过程中，如果节点没有属性，就会将其设置为`true`。这里我们可以用来判断是否需要处理节点的属性数据。这里用来获取属性的函数为`genData`，源码如下：

```js
export function genData (el: ASTElement, state: CodegenState): string {
  let data = '{'

  // directives first.
  // directives may mutate the el's other properties before they are generated.
  const dirs = genDirectives(el, state)
  if (dirs) data += dirs + ','

  // key
  if (el.key) {
    data += `key:${el.key},`
  }
  // ref
  if (el.ref) {
    data += `ref:${el.ref},`
  }
  if (el.refInFor) {
    data += `refInFor:true,`
  }
  // pre
  if (el.pre) {
    data += `pre:true,`
  }
  // record original tag name for components using "is" attribute
  if (el.component) {
    data += `tag:"${el.tag}",`
  }
  // module data generation functions
  for (let i = 0; i < state.dataGenFns.length; i++) {
    data += state.dataGenFns[i](el)
  }
  // attributes
  if (el.attrs) {
    data += `attrs:{${genProps(el.attrs)}},`
  }
  // DOM props
  if (el.props) {
    data += `domProps:{${genProps(el.props)}},`
  }
  // event handlers
  if (el.events) {
    data += `${genHandlers(el.events, false, state.warn)},`
  }
  if (el.nativeEvents) {
    data += `${genHandlers(el.nativeEvents, true, state.warn)},`
  }
  // slot target
  // only for non-scoped slots
  if (el.slotTarget && !el.slotScope) {
    data += `slot:${el.slotTarget},`
  }
  // scoped slots
  if (el.scopedSlots) {
    data += `${genScopedSlots(el.scopedSlots, state)},`
  }
  // component v-model
  if (el.model) {
    data += `model:{value:${
      el.model.value
    },callback:${
      el.model.callback
    },expression:${
      el.model.expression
    }},`
  }
  // inline-template
  if (el.inlineTemplate) {
    const inlineTemplate = genInlineTemplate(el, state)
    if (inlineTemplate) {
      data += `${inlineTemplate},`
    }
  }
  data = data.replace(/,$/, '') + '}'
  // v-bind data wrap
  if (el.wrapData) {
    data = el.wrapData(data)
  }
  // v-on data wrap
  if (el.wrapListeners) {
    data = el.wrapListeners(data)
  }
  return data
}
```

从上述代码中可以看出`genData`函数的实现并不复杂，先给`data`赋值`{`，然后挨个判断节点存在哪些属性，就将数据拼接在`data`中，拼接完成后，再补上`}`，一个完整的`data`就拼完了。

然后判断`el.inlineTemplate`是否存在，`inlineTemplate`表示是否包含内联的模板内容。如果不存在，则需要使用`genChildren`生成子节点列表。简化代码如下

```js
export function genChildren (el):  {
  if (children.length) {
    return `[${children.map(c => genNode(c, state)).join(',')}]`
  }
}
function genNode (node: ASTNode, state: CodegenState): string {
  if (node.type === 1) {
    return genElement(node, state)
  } if (node.type === 3 && node.isComment) {
    return genComment(node)
  } else {
    return genText(node)
  }
}
```

可以看出，生成子节点列表`children`其实就是遍历`AST`的`children`属性中的元素，然后根据元素属性的不同生成不同的`VNode`创建函数调用字符串。

在`data` 和 `children` 处理完成后，将其拼接为函数字符串

```js
`_c('${el.tag}'${
  data ? `,${data}` : '' // data
}${
  children ? `,${children}` : '' // children
})`
```

从这里，我们就可以知道，`_c`有三个参数，分别是节点的标签名`tagName`，节点属性`data`，节点的子节点列表`children`。

### 文本节点

生成文本节点逻辑比较简单，只需要用`_v()`函数将文本包裹起来。

```js
export function genText (text: ASTText | ASTExpression): string {
  return `_v(${text.type === 2
    ? text.expression // no need for () because already wrapped in _s()
    : transformSpecialNewlines(JSON.stringify(text.text))
  })`
}
```

在作为`_v`的参数时，会判断文本的类型，如果是动态文本，则用`expression`。如果是静态文本，则使用`text`。

::: tip 为什么在Vue中，经常使用JSON.stringify() 包裹字符串？
为了保持文本格式的统一，动态文本格式为`'"hello" + _s(name)'`，静态文本格式为`"hello world"`，我们需要将静态文本格式与动态文本格式统一，所以使用`JSON.stringify`给文本包装一层字符串，格式为`'"hello world"'`
:::

### 注释节点

注释节点更为简单，直接使用`_e()`包裹注释文本即可

```js
export function genComment (comment: ASTText): string {
  return `_e(${JSON.stringify(comment.text)})`
}
```

## _c、_v和_e究竟是什么

有的同学可能已经发现了，上述生成函数字符串时，我们用到的`_c`、`_v`、`_e`三种函数对应三种节点类型。实际上这三个函数是节点创建方法的别名，对应关系如下：

| 类型     | 创建方法         | 别名 |
| -------- | ---------------- | ---- |
| 元素节点 | createElement    | _c   |
| 文本节点 | createTextVNode  | _v   |
| 注释节点 | createEmptyVNode | _e   |

## 总结

本小节是模板编译的最后一个阶段——代码生成阶段，我们知道了代码生成阶段就是将之前生成的`AST`生成`render`函数字符串的阶段。后续Vue通过`render`函数就可以生成对应的虚拟DOM。

在源码中，我们发现虽然判断逻辑较多，但核心都是生成元素节点、文本节点及注释节点三个节点。这三个节点处理完毕后会生成相应的代码字符串，拼接在一起后，被包裹在`with(this){return ${code}}`后返回一个代码字符串。最终又通过`new Function`的方式生成一个可供执行的`render`函数。
