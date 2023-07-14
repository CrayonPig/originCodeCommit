/* @flow */

import { cached } from 'shared/util'
import { parseFilters } from './filter-parser'

const defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g
const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g

const buildRegex = cached(delimiters => {
  const open = delimiters[0].replace(regexEscapeRE, '\\$&')
  const close = delimiters[1].replace(regexEscapeRE, '\\$&')
  return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
})

type TextParseResult = {
  expression: string,
  tokens: Array<string | { '@binding': string }>
}

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
