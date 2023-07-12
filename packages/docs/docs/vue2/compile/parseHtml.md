# 模板解析阶段（HTML解析器）

上一小节中，我们知道了模板解析的整体运行流程，先使用HTML解析器解析模板，如果遇到文本就用文本过滤器解析，如果文本中遇到过滤器就使用过滤器解析器解析。

我们按照运行流程，先从HTML解析器开始研究。

## 整体流程

HTML解析器的简化代码如下，完整源码在`/src/complier/parser/index.js`

```js
export function parse(template, options) {
   // ...
  parseHTML(template, {
    // ...
    start (tag, attrs, unary) {
      // 每当解析到标签的开始位置时，触发该函数
    },
    end () {
      // 每当解析到标签的结束位置时，触发该函数
    },
    chars (text: string) {
      // 每当解析到文本时，触发该函数
    },
    comment (text: string) {
      // 每当解析到注释时，触发该函数
    }
  })
  return root
}
```

光看代码，可能不太理解，我们举个例子说明下:

```html
<div>
  <h1>Hello world</h1>
</div>
```

首先，解析器是从前向后解析的，解析的过程如下：

1. 解析`<div>`，触发标签开始的钩子函数`start`
2. 解析`<h1>`，触发标签开始的钩子函数`start`
3. 解析文本`Hello world`，触发文本钩子函数`chars`
4. 解析`</h1>`，触发标签结束的钩子函数`end`
5. 解析`</div>`，触发标签结束的钩子函数`end`

按照上述流程，我们可以分别在钩子函数中构建不同的`AST`节点。

- 在`start`钩子函数中构建元素类型的节点
- 在`chars`钩子函数中
  - 如果是静态文本构建静态文本类型的节点
  - 如果是动态文本构建动态文本类型的节点
- 在`comment`钩子函数中构建注释类型的节点

当HTMl解析器不再触发钩子函数时，就说明所有的模板解析完毕，所有的类型的节点都在钩子函数中构建完成，即`AST`构建完成，也就完成HTML解析器的流程。

## 解析不同内容

HTML解析器要从模板字符串中解析出不同的内容，我们首先就要知道模板字符串能解析出哪些内容，经过整理，有如下内容类型

- 文本，例如 `Hello world`
- HTML注释，例如`<!-- 我是注释 -->`
- 条件注释，例如`<!-- [if !IE]> -->我是注释<!--< ![endif] -->`
- DOCTYPE，例如`<!DOCTYPE html>`
- 开始标签，例如`<div>`
- 结束标签，例如`</div>`
- 纯文本内容元素，例如`script,style,textarea`

其中，我们经常遇到的是开始标签、结束标签、文本和注释。接下来我们挨个分析所有的内容类型

### HTML注释

由于HTML注释的格式是固定的，所以解析HTML注释较为简单，只需要判断是否符合`<!--`开头，以`-->`结尾的规则，如果符合规则，说明是HTML注释，获取中间的内容。

```js
const comment = /^<!\--/
if (comment.test(html)) {
  // 如果是<!-- 开头，则继续查找是否存在-->
  const commentEnd = html.indexOf('-->')

  if (commentEnd >= 0) {
    // 若存在 -->, 继续判断options中是否保留注释
    if (options.shouldKeepComment) {
      // 若保留注释，则把注释截取出来传给options.comment，创建注释类型的AST节点
      options.comment(html.substring(4, commentEnd))
    }
    // 若不保留注释，则将游标移动到-->之后，继续向后解析
    advance(commentEnd + 3)
    continue
  }
}
```

在上述代码中，通过判断是否符合`<!--`开头，以`-->`结尾的规则来判断是否为HTML注释，再根据`options.shouldKeepComment`判断是否触发钩子函数创建注释节点。

`options.shouldKeepComment` 就是我们平时在模板中可以在`<template></template`>标签上配置的`comments`选项，通过在这里判断，我们可以在渲染模板时决定是否保留注释。

`advance`函数是用来移动解析游标的，解析完一部分就把游标向后移动一部分，确保不会重复解析，其代码如下：

```js
function advance (n) {
  index += n   // index为解析游标
  html = html.substring(n)
}
```

### 条件注释

由于条件注释不触发钩子函数，我们只需要利用正则匹配到条件注释后，将其忽略即可。

```js
// 解析是否是条件注释
const conditionalComment = /^<!\[/
if (conditionalComment.test(html)) {
  // 若为条件注释，则继续查找是否存在']>'
  const conditionalEnd = html.indexOf(']>')

  if (conditionalEnd >= 0) {
    // 若存在 ']>',则从原本的html字符串中把条件注释截掉，
    // 把剩下的内容重新赋给html，继续向后匹配
    advance(conditionalEnd + 2)
    continue
  }
}
```

从上述代码中，我们可以发现，匹配到条件注释后，将其忽略，继续匹配。通俗点说，在Vue中写条件注释是没有用的，会直接被忽略掉。

### DOCTYPE

解析`DOCTYPE`跟解析条件注释相同，利用正则匹配后，忽略掉。

```js
const doctype = /^<!DOCTYPE [^>]+>/i
// 解析是否是DOCTYPE
const doctypeMatch = html.match(doctype)
if (doctypeMatch) {
  advance(doctypeMatch[0].length)
  continue
}
```

### 开始标签

开始标签相对于前几个来说，考虑的情况稍微复杂一些。需要考虑如下情况

1. 匹配开始标签
2. 解析标签名`tag`、标签属性`attrs`、标签是否自闭合`unary`
3. 匹配自闭合标签，如`<img />`

#### 匹配开始标签

先使用正则匹配模板字符串是否具有开始标签的特征

```js
/**
 * 匹配开始标签的正则
 */
const ncname = '[a-zA-Z_][\\w\\-\\.]*'
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)

const start = html.match(startTagOpen)
if (start) {
  const match = {
    tagName: start[1],
    attrs: [],
    start: index
  }
}

// 以开始标签开始的模板：
'<div></div>'.match(startTagOpen)  => ['<div','div',index:0,input:'<div></div>']
// 以结束标签开始的模板：
'</div><div></div>'.match(startTagOpen) => null
// 以文本开始的模板：
'我是文本</p>'.match(startTagOpen) => null
```

上述代码可以看出，匹配到开始标签后，会返回一个数组，数组第二项就是该标签的标签名。

#### 匹配标签中的属性

还记得我们之前介绍的简化代码中的`start`钩子函数，它接受三个参数：标签名`tag`、标签属性`attrs`、标签是否自闭合`unary`

```js
start (tag, attrs, unary) {
  // 每当解析到标签的开始位置时，触发该函数
},
```

所以我们匹配到开始标签的第二步，要解析标签属性。以如下为例：

```html
<div class="a" id="b"></div>
```

在经过第一步标签匹配，获取到标签名`tag`后，模板字符串如下

```txt
class="a" id="b"></div>
```

将该模板字符串利用正则匹配，获取其中的属性

```js
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
let html = 'class="a" id="b"></div>'
let attr = html.match(attribute)
console.log(attr)
// ["class="a"", "class", "=", "a", undefined, undefined, index: 0, input: "class="a" id="b"></div>", groups: undefined]
```

可以看到，匹配出数组的第二项和第四项就是该标签的属性名和属性值`class="a"`。

在匹配属性值的时候会遇到两种情况

1. 匹配的结果为空，说明该标签没有设置属性
2. 匹配结果不为空，说明该标签有属性，截取属性后循环匹配，直到找不到属性为止

循环匹配代码如下：

```js
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const startTagClose = /^\s*(\/?)>/
const match = {
  tagName: start[1],
  attrs: [],
  start: index
}
while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
  advance(attr[0].length)
  match.attrs.push(attr)
}
```

在上面代码的`while`循环中，如果剩下的字符串不符合开始标签的结束特征（`startTagClose`）并且符合标签属性的特征的话，那就说明还有未提取出的标签属性，那就进入循环，继续提取，直到把所有标签属性都提取完毕。

不符合开始标签的结束特征（`startTagClose`），具体指的是，如果匹配的模板字符串不符合成对标签`>`或者自闭合标签`/>`的特征

#### 匹配自闭合标签

我们知道，HTML标签有两种方式成对标签`<div></div>`或者自闭合标签`<img />`，这两种方式在`AST`中处理方式不太一样

- 成对标签：有专门的结束钩子函数`end`处理
- 自闭合标签：在匹配开始标签钩子函数`start`时候处理

我们这里先研究自闭合标签的处理方式。其实自闭合标签处理也比较简单，当我们匹配完属性后，模板字符串只有两种情况

- 成对标签： `></div>`
- 自闭合标签： `/>`

所以我们只需要利用剩下的模板字符串来匹配开头是否为`/>`

```js
const startTagClose = /^\s*(\/?)>/
let end = html.match(startTagClose)
'></div>'.match(startTagClose) // [">", "", index: 0, input: "></div>", groups: undefined]
'/>'.match(startTagClose) // ["/>", "/", index: 0, input: "/><div></div>", groups: undefined]
```

可以看到，正则匹配自闭合标签返回的数组中，第二项为`/`，所以我们只需要判断匹配结果的第二项是否为`\`即可判断出当前标签是否为自闭合标签

```js
const startTagClose = /^\s*(\/?)>/
let end = html.match(startTagClose)
if (end) {
 match.unarySlash = end[1]
 advance(end[0].length)
 match.end = index
 return match
}
```

到这步，就完成了标签开始的解析。

### 开始标签完整源码

源码在`src/compiler/parser/html-parser.js`

```js
const ncname = '[a-zA-Z_][\\w\\-\\.]*'
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
const startTagClose = /^\s*(\/?)>/

const startTagMatch = parseStartTag()
  if (startTagMatch) {
  handleStartTag(startTagMatch)
  if (shouldIgnoreFirstNewline(lastTag, html)) {
    advance(1)
  }
  continue
}

function parseStartTag () {
  const start = html.match(startTagOpen)
  // '<div></div>'.match(startTagOpen)  => ['<div','div',index:0,input:'<div></div>']
  // '</div><div></div>'.match(startTagOpen) => null
  if (start) {
    const match = {
      tagName: start[1],
      attrs: [],
      start: index
    }
    advance(start[0].length)
    let end, attr
    /**
     * <div a=1 b=2 c=3></div>
     * 从<div之后到开始标签的结束符号'>'之前，一直匹配属性attrs
     * 所有属性匹配完之后，html字符串还剩下
     * 自闭合标签剩下：'/>'
     * 非自闭合标签剩下：'></div>'
     */
    while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
      advance(attr[0].length)
      match.attrs.push(attr)
    }

    /**
     * 这里判断了该标签是否为自闭合标签
     * 自闭合标签如:<input type='text' />
     * 非自闭合标签如:<div></div>
     * '></div>'.match(startTagClose) => [">", "", index: 0, input: "></div>", groups: undefined]
     * '/><div></div>'.match(startTagClose) => ["/>", "/", index: 0, input: "/><div></div>", groups: undefined]
     * 因此，我们可以通过end[1]是否是"/"来判断该标签是否是自闭合标签
     */
    if (end) {
      match.unarySlash = end[1]
      advance(end[0].length)
      match.end = index
      return match
    }
  }
}
```

通过源码可以看到，调用`parseStartTag`函数，如果模板字符串符合开始标签的特征，则解析开始标签，并将解析结果返回，如果不符合开始标签的特征，则返回`undefined`。

解析完毕后，并没有直接调用`start`钩子函数，而是通过`handleStartTag`将标签中提取的属性进行二次处理。

```js
function handleStartTag (match) {
  // 开始标签的标签名
  const tagName = match.tagName    
  // 是否为自闭合标签的标志，成对标签为"",自闭合标签为"/"   
  const unarySlash = match.unarySlash  

  if (expectHTML) {
    if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
      parseEndTag(lastTag)
    }
    if (canBeLeftOpenTag(tagName) && lastTag === tagName) {
      parseEndTag(tagName)
    }
  }

  // 布尔值，标志是否为自闭合标签
  const unary = isUnaryTag(tagName) || !!unarySlash 
  // match.attrs 数组的长度
  const l = match.attrs.length 
  // 一个与match.attrs数组长度相等的数组
  const attrs = new Array(l) 
  // 循环处理提取出来的标签属性数组
  for (let i = 0; i < l; i++) {
    const args = match.attrs[i]
    // hackish work around FF bug https://bugzilla.mozilla.org/show_bug.cgi?id=369778
    if (IS_REGEX_CAPTURING_BROKEN && args[0].indexOf('""') === -1) {
      if (args[3] === '') { delete args[3] }
      if (args[4] === '') { delete args[4] }
      if (args[5] === '') { delete args[5] }
    }
    // 获取标签属性的属性值
    const value = args[3] || args[4] || args[5] || ''

    const shouldDecodeNewlines = tagName === 'a' && args[1] === 'href'
    // 对a标签的 href属性值中的换行符或制表符做兼容处理
    ? options.shouldDecodeNewlinesForHref
    // 对属性值中的换行符或制表符做兼容处理
      : options.shouldDecodeNewlines
    attrs[i] = {
      // 标签属性的属性名，如class
      name: args[1], 
      // 标签属性的属性值，如class对应的a
      value: decodeAttr(value, shouldDecodeNewlines)
    }
  }
  // 如果该标签是成对标签，则将标签推入栈中
  if (!unary) {
    stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs })
    lastTag = tagName
  }
  // 该标签是自闭合标签，调用start钩子函数创建AST节点
  if (options.start) {
    options.start(tagName, attrs, unary, match.start, match.end)
  }
}
```

`handleStartTag`过程并不复杂，主要是将我们之前获取到的标签属性`["class="a"", "class", "=", "a", undefined, undefined, index: 0, input: "class="a" id="b"></div>", groups: undefined]`格式，需要统一处理成`{name: '', value: ''}`的形式，方便`AST`创建节点使用。

需要说明都是，如果该标签是成对标签时，则将标签推入栈中，具体关于栈的内容，我们在本小节后续讲解。

### 结束标签

结束标签就简单很多，只需判断剩下的模板字符串是否符合结束标签的特征，如果符合，就将结束标签名提取出来，再调用钩子函数`end`。

首先使用正则判断是否符合结束标签

```js
const ncname = '[a-zA-Z_][\\w\\-\\.]*'
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
const endTagMatch = html.match(endTag)

'</div>'.match(endTag)  // ["</div>", "div", index: 0, input: "</div>", groups: undefined]
'<div>'.match(endTag)  // null
```

上述代码中，匹配到结束标签后，会返回一个数组，数组第二项就是该标签的标签名。

接着再调用钩子函数`end`

```js
if (endTagMatch) {
  const curIndex = index
  advance(endTagMatch[0].length)
  parseEndTag(endTagMatch[1], curIndex, index)
  continue
}
```

上述代码中，没有直接调用钩子函数`end`，而是调用了`parseEndTag`，在`parseEndTag`内部调用钩子函数`end`。`parseEndTag`函数我们稍后解析，这里先简单理解为调用钩子函数`end`。

### 文本

文本类型相比于前几种类型比较特殊，前面五种类型都是以`<`开头的，只有文本类型的内容不是以`<`开头的。所以解析模板字符串时，如果不是
以`<`开头的，就当做文本处理。

有同学就会问了，如果我文本中包含`<`怎么处理呢？

其实思路很简单，以模板字符串`1<2</div>`为例，当截取完`1`之后，剩余模板为

```txt
<2</div>
```

此时进行判断:

1. 符合开始标签的特征么？ 不符合
2. 符合结束标签的特征么？ 不符合
3. 符合注释的特征么？ 不符合

以上不符合，那就说明`<`是属于文本的一部分

梳理完思路后，我们看源码是如何实现的，源码在`src/compiler/parser/html-parser.js`

```js
let textEnd = html.indexOf('<')

if(textEnd === 0) {
  // ...
}

// 不是'<'开头，按文本处理
let text, rest, next
if (textEnd >= 0) {
  // 把'<'之前的都当做文本处理
  rest = html.slice(textEnd)
  while (
    !endTag.test(rest) &&
    !startTagOpen.test(rest) &&
    !comment.test(rest) &&
    !conditionalComment.test(rest)
  ) {
    // < in plain text, be forgiving and treat it as text
    /**
     * 用'<'以后的内容rest去匹配endTag、startTagOpen、comment、conditionalComment
     * 如果都匹配不上，表示'<'是属于文本本身的内容
     */
    // 在'<'之后查找是否还有'<'
    next = rest.indexOf('<', 1)
    // 如果没有了，表示'<'后面也是文本
    if (next < 0) break
    // 如果还有，表示'<'是文本中的一个字符
    textEnd += next
    // 那就把next之后的内容截出来继续下一轮循环匹配
    rest = html.slice(textEnd)
  }
  // '<'是结束标签的开始 ,说明从开始到'<'都是文本，截取出来
  text = html.substring(0, textEnd)
  advance(textEnd)
}

// 整个模板字符串里没有找到`<`,说明整个模板字符串都是文本
if (textEnd < 0) {
  text = html
  html = ''
}

// 把截取出来的text转化成textAST
if (options.chars && text) {
  options.chars(text)
}
```

从上述代码，我们可以发现，判断`textEnd === 0`（模板字符串以`<`开头）后，并没有直接`else`判断字符串，这里就是为了模板字符串以`<`开头匹配前五种类型不匹配后，将其作为文本的一部分。后续判断文本的时候也是`textEnd >= 0`而不是`textEnd > 0`。

#### 纯文本内容元素

上述几种情况解析时，都是默认当前元素的父级不是纯文本内容元素。

纯文本内容元素是指`script`、`style`、`textarea`三种元素，解析时会把该标签内容都当做文本处理。

在`parseHTML`的`while`中最先判断的就是父级元素是不是纯文本内容元素。

```js
 while (html) {
    // 判断父元素是否为script、style、textarea纯文本内容元素
    if (!lastTag || !isPlainTextElement(lastTag)) {
      // 父元素为正常元素
    } else {
      // 父元素为script、style、textarea纯文本内容元素
       let endTagLength = 0
      const stackedTag = lastTag.toLowerCase()
      // 匹配结束标签前包括结束标签自身在内的所有文本
      const reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'))
      const rest = html.replace(reStackedTag, function (all, text, endTag) {
        // replace第二个参数为自定义替换函数
        // all 完整的匹配子字符串
        // text 结束标签前的所有内容
        // endTag 结束标签本身
        endTagLength = endTag.length

        // stackedTag 不是纯文本元素并且不是 'noscript'，
        if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
          text = text
            // 删除注释标记，保留注释内容
            .replace(/<!\--([\s\S]*?)-->/g, '$1') // #7298
            // 删除 CDATA 标记，保留 CDATA 内容
            .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1')
        }

        // stackedTag是pre,textarea，并且text开头为\n，则删除\n
        if (shouldIgnoreFirstNewline(stackedTag, text)) {
          text = text.slice(1)
        }
        // 触发钩子函数`chars`
        if (options.chars) {
          options.chars(text)
        }
        return ''
      })
      index += html.length - rest.length
      html = rest
      parseEndTag(stackedTag, index - endTagLength, index)
    }
 }
```

上述代码可以看出，当父元素是纯文本内容元素时，只需要把内容视作文本，并且把这些文本截取出来，触发钩子函数`chars`，然后再将结束标签截取出来触发钩子函数`end`

## AST层级结构

有的同学可能已经发现一个问题，我们之前看到的`AST`是有层级关系的，是一个树状结构。但我们以上分析的创建`AST`节点都是平级的，没有层级关系，这个怎么处理呢？

其实处理的思路也很简单，我们只需要维护一个栈`stack`，用栈来记录层级关系，这个层级关系也可以理解为DOM的深度。

HTML解析器在解析HTML时，是从前向后解析。每当遇到开始标签，就触发钩子函数`start`。每当遇到结束标签，就会触发钩子函数`end`。

基于 HTML 解析器的逻辑，我们可以在每次触发钩子函数 `start` 时，把当前构建的节点推入栈中。每当触发钩子函数 `end` 时，就从栈中弹出一个节点。

这样就可以保证每当触发钩子函数`start`是，栈的最后一个节点就是当前正在构建的节点的父节点。

举例说明

```html
<div><p><span></span></p></div>
```

1. 解析到开始标签`<div>`时，`div`入栈
2. 解析到开始标签`<p>`时，`p`入栈
3. 解析到开始标签`<span>`时，`span`入栈
4. 解析到结束标签`</span>`时，栈的顶端是`span`，使用`span`的开始标签和结束标签构建AST节点，栈弹出`span`
5. 后续同理

这样我们就梳理出了`AST`的树状结构，过程如图所示：

![栈](@assets/vue2/htmlParseStack.png)

## 回归源码

当上述逻辑都梳理完毕后，我们可以开始分析`HTML`解析器`parseHTML`函数的源码，源码在`src/compiler/parser/html-parser.js`

```js
export function parseHTML (html, options) {
  const stack = [] // 维护AST节点层级的栈
  const expectHTML = options.expectHTML
  const isUnaryTag = options.isUnaryTag || no
  const canBeLeftOpenTag = options.canBeLeftOpenTag || no //用来检测一个标签是否是可以省略闭合标签的非自闭合标签
  let index = 0   //解析游标，标识当前从何处开始解析模板字符串
  let last,   // 存储剩余还未解析的模板字符串
      lastTag  // 存储着位于 stack 栈顶的元素
  while (html) {
    last = html
    // Make sure we're not in a plaintext content element like script/style
    // 判断父元素是否为script、style、textarea纯文本内容元素
    if (!lastTag || !isPlainTextElement(lastTag)) {
      let textEnd = html.indexOf('<')
      if (textEnd === 0) {
      // 如果开头是<，则判断是否为注释、开始标签、结束标签、DOCTYPE
        
        if (comment.test(html)) {
          // 判断是否为注释
        }

        // 解析是否是条件注释
        if (conditionalComment.test(html)) {
         
        }

        // 解析是否是DOCTYPE
        const doctypeMatch = html.match(doctype)
        if (doctypeMatch) {
          
        }

        // 解析结束标签
        const endTagMatch = html.match(endTag)
        if (endTagMatch) {
          
        }

        // 解析开始标签
        const startTagMatch = parseStartTag()
        if (startTagMatch) {
         
        }
      }

      // 不是'<'开头，按文本处理
      let text, rest, next
      if (textEnd >= 0) {
        
      }

      // 整个模板字符串里没有找到`<`,说明整个模板字符串都是文本
      if (textEnd < 0) {
        text = html
        html = ''
      }

      // 把截取出来的text转化成textAST
      if (options.chars && text) {
        options.chars(text)
      }
    } else {
      // 父元素为script、style、textarea纯文本内容元素
     
    }

    if (html === last) {
      options.chars && options.chars(html)
      if (process.env.NODE_ENV !== 'production' && !stack.length && options.warn) {
        options.warn(`Mal-formatted tag at end of template: "${html}"`)
      }
      break
    }
  }

  // 处理栈中剩余未处理的标签
  // Clean up any remaining tags
  parseEndTag()

  function advance (n) {
    index += n
    html = html.substring(n)
  }

  function parseStartTag () {
    // 匹配开始标签
  }

  function handleStartTag (match) {
    // 处理 parseStartTag 的结果
  }

  function parseEndTag (tagName, start, end) {
    // 解析 结束标签
  }
}
```

简化后的整体逻辑比较简单，具体解析细节上面都有分析，这里就不赘述了。

需要分析的是，我们之前暂时忽略的`parseEndTag`函数

```js
// tagName 结束标签名
// start 结束标签在模板字符串的开始位置
// end 结束标签在模板字符串的结束位置
function parseEndTag (tagName, start, end) {
  let pos, lowerCasedTagName
  if (start == null) start = index
  if (end == null) end = index

  if (tagName) {
    lowerCasedTagName = tagName.toLowerCase()
  }

  // Find the closest opened tag of the same type
  if (tagName) {
    // 从后往前遍历栈，在栈中寻找与tagName相同的标签并记录其所在的位置pos，
    for (pos = stack.length - 1; pos >= 0; pos--) {
      if (stack[pos].lowerCasedTag === lowerCasedTagName) {
        break
      }
    }
  } else {
    // 如果tagName不存在，则将pos置为0
    // If no tag name is provided, clean shop
    pos = 0
  }

  if (pos >= 0) {
    // Close all the open elements, up the stack
    for (let i = stack.length - 1; i >= pos; i--) {
      if (process.env.NODE_ENV !== 'production' &&
        (i > pos || !tagName) &&
        options.warn
      ) {
        // 栈的索引大于pos，那么该元素一定是缺少闭合标签的。
        options.warn(
          `tag <${stack[i].tag}> has no matching end tag.`
        )
      }
      // 为了保证解析结果的正确性， i>pos 或 tagName不存在时，立即闭合
      // i === pos 时，正常闭合
      if (options.end) {
        options.end(stack[i].tag, start, end)
      }
    }
    // Remove the open elements from the stack
    // 把pos位置以后的元素都从stack栈中弹出
    stack.length = pos
    // 以及把lastTag更新为栈顶元素:
    lastTag = pos && stack[pos - 1].tag
  } else if (lowerCasedTagName === 'br') {
    // 浏览器会将</br>标签解析为正常的 <br>标签
    if (options.start) {
      // 创建<br>AST节点
      options.start(tagName, [], true, start, end)
    }
  } else if (lowerCasedTagName === 'p') {
    // 浏览器会将</p>标签解析为正常的 <p />标签
    // 补全p标签, 创建<br>AST节点
    if (options.start) {
      options.start(tagName, [], false, start, end)
    }
    if (options.end) {
      options.end(tagName, start, end)
    }
  }
}
```

`parseEndTag`接收三个参数：

- `tagName` 结束标签名
- `start` 结束标签在模板字符串的开始位置
- `end` 结束标签在模板字符串的结束位置

这三个参数其实都是可选的，根据传参的不同其功能也不同。

1. 三个参数都传递，用于处理普通的结束标签
2. 只传递`tagName`
3. 三个参数都不传递，用于处理栈中剩余未处理的标签

## 总结

本小节介绍了HTML解析器的工作流程和具体原理。

首先介绍了HTML解析器的工作流程，HTML解析器从前到后解析，解析到不同类型的内容调用对应的钩子函数生成相应的`AST`节点，直到解析完整个模板字符串。

接着介绍了HTML解析器是如何解析用户所写的模板字符串中各种类型的内容的，把各种类型的解析方式都分别进行了介绍。

其次，介绍了在解析器通过维护栈的方式，保证构建的AST节点层级与真正DOM层级一致。

了解以上思路后，通过源码回顾整体流程和处理细节。
