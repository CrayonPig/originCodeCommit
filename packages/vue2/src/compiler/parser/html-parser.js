/**
 * Not type-checking this file because it's mostly vendor code.
 */

/*!
 * HTML Parser By John Resig (ejohn.org)
 * Modified by Juriy "kangax" Zaytsev
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 */

import { makeMap, no } from 'shared/util'
import { isNonPhrasingTag } from 'web/compiler/util'

// Regular Expressions for parsing tags and attributes
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
// could use https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName
// but for Vue templates we can enforce a simple charset
const ncname = '[a-zA-Z_][\\w\\-\\.]*'
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
const doctype = /^<!DOCTYPE [^>]+>/i
// #7298: escape - to avoid being pased as HTML comment when inlined in page
const comment = /^<!\--/
const conditionalComment = /^<!\[/

let IS_REGEX_CAPTURING_BROKEN = false
'x'.replace(/x(.)?/g, function (m, g) {
  IS_REGEX_CAPTURING_BROKEN = g === ''
})

// Special Elements (can contain anything)
export const isPlainTextElement = makeMap('script,style,textarea', true)
const reCache = {}

const decodingMap = {
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&amp;': '&',
  '&#10;': '\n',
  '&#9;': '\t'
}
const encodedAttr = /&(?:lt|gt|quot|amp);/g
const encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#10|#9);/g

// #5992
const isIgnoreNewlineTag = makeMap('pre,textarea', true)
const shouldIgnoreFirstNewline = (tag, html) => tag && isIgnoreNewlineTag(tag) && html[0] === '\n'

function decodeAttr (value, shouldDecodeNewlines) {
  const re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr
  return value.replace(re, match => decodingMap[match])
}

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
        // Comment:
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

        // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
        // 解析是否是条件注释
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

        // 解析是否是DOCTYPE
        const doctypeMatch = html.match(doctype)
        if (doctypeMatch) {
          advance(doctypeMatch[0].length)
          continue
        }

        // 解析结束标签
        const endTagMatch = html.match(endTag)
        if (endTagMatch) {
          const curIndex = index
          advance(endTagMatch[0].length)
          parseEndTag(endTagMatch[1], curIndex, index)
          continue
        }

        // 解析开始标签
        const startTagMatch = parseStartTag()
        if (startTagMatch) {
          handleStartTag(startTagMatch)
          if (shouldIgnoreFirstNewline(lastTag, html)) {
            advance(1)
          }
          continue
        }
      }

      //  不是'<'开头，按文本处理
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

    if (html === last) {
      options.chars && options.chars(html)
      if (process.env.NODE_ENV !== 'production' && !stack.length && options.warn) {
        options.warn(`Mal-formatted tag at end of template: "${html}"`)
      }
      break
    }
  }

  // Clean up any remaining tags
  parseEndTag()

  function advance (n) {
    index += n
    html = html.substring(n)
  }

  function parseStartTag () {
    // 匹配开始标签
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
        // 循环匹配获取标签属性
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
}
