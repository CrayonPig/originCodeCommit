# 模板解析阶段（文本解析器）

之前我们介绍过，在解析器的整体流程是先使用HTML解析器解析模板，如果遇到文本就用文本过滤器解析。

上一节介绍完HTML解析器后，本小节我们一起来看看文本解析器是如何处理文本的。

有同学就有问题，文本就是一段文字，有什么好解析的，记录下来就行呗。

其实不然，文本解析器主要用来解析带变量的文本，不带变量的文本是纯文本，不需要在解析器中处理。带变量的文本如下:

```vue
Hello {{ name }}
```

我们都知道，在Vue中，可以使用变量填充模板。而在我们之前分析的HTML解析器中，并不会区分是否带有变量的文本。只是在遇到文本后，触发钩子函数`chars`。简化代码如下

```js
chars (text: string) {
// 每当解析到文本时，触发该函数
  if(res = parseText(text)){
    // 文本中带变量，创建动态文本节点
    children.push({
      type: 2,
      expression: res.expression,
      tokens: res.tokens,
      text
    })
  } else {
    // 文本中不变量，创建静态文本节点
    children.push({
      type: 3,
      text
    })
  }
}
```

从上述代码中可以看出，在钩子函数`chars`中，执行`parseText`函数解析文本，如果返回有结果，就说明是带变量的文本，将解析后获取的`expression`和`tokens`传入。否则是静态文本。

## 源码分析

我们来看`parseText`源码是如何处理的，源码在`src/compiler/parser/text-parser.js`

```js
const defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g
const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g

const buildRegex = cached(delimiters => {
  const open = delimiters[0].replace(regexEscapeRE, '\\$&')
  const close = delimiters[1].replace(regexEscapeRE, '\\$&')
  return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
})

export function parseText (
  text: string,
  delimiters?: [string, string]
): TextParseResult | void {
  // 用户可自定义解析规则，如将匹配{{}}改为匹配%%
  const tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE
  if (!tagRE.test(text)) {
    return
  }
  const tokens = []
  const rawTokens = []
  let lastIndex = tagRE.lastIndex = 0
  let match, index, tokenValue
  while ((match = tagRE.exec(text))) {
    // match.index是获取匹配的子字符串在整个字符串的位置
    index = match.index
    // push text token
    if (index > lastIndex) {
      // 将 {{ 前的字符串放入 tokens
      rawTokens.push(tokenValue = text.slice(lastIndex, index))
      tokens.push(JSON.stringify(tokenValue))
    }
    // tag token
    // 取出'{{ }}'中间的变量
    const exp = parseFilters(match[1].trim())
    // 把'{{ }}'中间的变量exp改成_s(exp)形式也放入tokens中
    tokens.push(`_s(${exp})`)
    rawTokens.push({ '@binding': exp })
    // 匹配 {{ }} 完成后，将lastIndex 跳过匹配的 {{ }}，保证下次匹配
    lastIndex = index + match[0].length
  }
  // 当剩下的text不再被正则匹配上时，表示所有变量已经处理完毕
  // 此时如果lastIndex < text.length，表示在最后一个变量后面还有文本
  // 最后将后面的文本再加入到tokens中
  if (lastIndex < text.length) {
    rawTokens.push(tokenValue = text.slice(lastIndex))
    tokens.push(JSON.stringify(tokenValue))
  }

  // 最后把数组tokens中的所有元素用'+'拼接起来
  return {
    expression: tokens.join('+'),
    tokens: rawTokens
  }
}
```

从上述源码看，思路还是比较明确的，我们用个例子一起分析下

```js
let text = "我叫{{name}}，我今年{{age}}岁了"
```

`parseText`接受两个参数，一个`text`, 表示需要匹配的文本字符串，另一个是`delimiters`，表示修改插值语法，具体作用往下看。

```js
// 用户可自定义解析规则，如将匹配{{}}改为匹配%%
const tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE
```

我们可以通过上下知道`defaultTagRE`是用来解析`{{ }}`的，如果`delimiters`存在，就重新生成一个正则表达式。根据`buildRegex`的实现，我们可以推断出我们可以使用`delimiters`来配置文本内包含变量所使用的符号。比如我们可以将`delimiters`设置为`['${', '}']`，后续匹配的时候，就会将`${hello}`中的`hello`作为变量。

接下来用`tagRE`去匹配传入的文本内容，判断是否包含变量，若不包含，则直接返回，如下：

```js
if (!tagRE.test(text)) {
  return
}
```

如果包含变量，则执行下面的`while`循环

```js
const tokens = []
const rawTokens = []
let lastIndex = tagRE.lastIndex = 0
let match, index, tokenValue
while ((match = tagRE.exec(text))) {

}
```

此处`while`循环是通过`tagRE.exec(text)`查询是否有匹配到的变量。

这里需要提的是，在具有`g`修饰的正则表达式中调用的`exec`函数，会在`lastIndex`属性指定的字符处开始检索字符串，调用完毕后，如果匹配到结果，把`lastIndex`设置为紧挨着匹配子串的字符位置。如果没匹配到结果，将`lastIndex`重置为0。[文档在此](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec) 以我们之前例子来讲：

```js
let text = "我叫{{name}}，我今年{{age}}岁了"
tagRE.exec(text)
// 第一次匹配 返回：['{{name}}', 'name', index: 2, input: '我叫{{name}}，我今年{{age}}岁了', groups: undefined]
tagRE.lastIndex // 10

tagRE.exec(text)
// 第二次匹配 返回：['{{age}}', 'age', index: 7, input: '{{name}}，我今年{{age}}岁了', groups: undefined]
tagRE.lastIndex // 10

tagRE.exec(text)
// 第三次匹配 返回：null
tagRE.lastIndex // 0
```

可以看出，在最后匹配时，会返回`null`，从而结束`while`循环。

在上述`exec`的返回值中，匹配结果的第一个元素是字符串中第一个完整的带有包裹的变量，第二个元素是第一个被包裹的变量名，第三个元素是第一个变量在字符串中的起始位置。

接下来看完整`while`循环

```js
while ((match = tagRE.exec(text))) {
  // match.index是获取匹配的子字符串在整个字符串的位置
  index = match.index
  // push text token
  if (index > lastIndex) {
    // 将 {{ 前的字符串放入 tokens
    rawTokens.push(tokenValue = text.slice(lastIndex, index))
    tokens.push(JSON.stringify(tokenValue))
  }
  // tag token
  // 取出'{{ }}'中间的变量
  const exp = parseFilters(match[1].trim())
  // 把'{{ }}'中间的变量exp改成_s(exp)形式也放入tokens中
  tokens.push(`_s(${exp})`)
  rawTokens.push({ '@binding': exp })
  // 匹配 {{ }} 完成后，将lastIndex 跳过匹配的 {{ }}，保证下次匹配时
  lastIndex = index + match[0].length
}
```

首先，通过`match.index`获取匹配的子字符串在整个字符串的位置赋值给`index`，然后比较`lastIndex`和`index`，`lastIndex`就是之前的`tagRE.lastIndex`。

当`index > lastIndex`时，表示`{{`前有纯文本，将其切割出来，放入`rawTokens`数组中，并将其序列化为字符串并放在`tokens`数组中。

截取完纯文本后，就该轮到`{{}}`了，之前利用正则表达式匹配到了被包裹的变量名，将其取出用`_s()`包裹存入`tokens`中，同时再把变量名构造成`{'@binding': exp}`存入`rawTokens`中

```js
// 取出'{{ }}'中间的变量
const exp = parseFilters(match[1].trim())
// 把'{{ }}'中间的变量exp改成_s(exp)形式也放入tokens中
tokens.push(`_s(${exp})`)
rawTokens.push({ '@binding': exp })
```

`parseFilters`函数是过滤器解析器，我们后续会单开一个章节讲解，这里就先简单的理解为取出变量后做了一些匹配操作，返回了中间的变量。

获取完变量名后，当前循环要做的事情就差不多结束了。为了后续循环时，只从`}}`后面再开始匹配正则，更新``lastIndex`

```js
lastIndex = index + match[0].length
```

在`while`循环匹配结束后，再进行判断，最后一个变量后面是否还存在纯文本，如果存在，就存起来

```js
// 当剩下的text不再被正则匹配上时，表示所有变量已经处理完毕
// 此时如果lastIndex < text.length，表示在最后一个变量后面还有文本
// 最后将后面的文本再加入到tokens中
if (lastIndex < text.length) {
  rawTokens.push(tokenValue = text.slice(lastIndex))
  tokens.push(JSON.stringify(tokenValue))
}
```

最后，把`tokens`数组里的元素用`+`连接，和`rawTokens`一并返回，如下：

```js
return {
  expression: tokens.join('+'),
  tokens: rawTokens
}
```

所以，按照我们上述的例子，最后将结果输出为：

```js
{
  expression:"我叫"+_s(name)+"，我今年"+_s(age)+"岁了",
  tokens:[
    "我叫",
    {'@binding': name },
    "，我今年"
    {'@binding': age },
    "岁了"
  ]
}
```

至于最后为什么要输出成这种形式，我们在后续的代码生成阶段会去讲解。

这就是完整的文本解析器`parseText`函数的的逻辑了。

## 总结

本小节讲解了文本解析器`parseText`的逻辑，整个逻辑可以分为以下几步

1. 执行循环，匹配所有变量名
   1. 获取`{{}}`前的纯文本
   2. 获取变量名
2. 获取最后一个变量名后的纯文本

经过这些步骤后，文本和变量被解析出来，为后续的`render`做好了准备。
