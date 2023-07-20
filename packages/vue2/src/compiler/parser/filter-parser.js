/* @flow */

const validDivisionCharRE = /[\w).+\-_$\]]/

export function parseFilters (exp: string): string {
  // exp是否在 '' 中
  let inSingle = false
  // exp是否在 "" 中
  let inDouble = false
  // exp是否在 `` 中
  let inTemplateString = false
  // exp是否在 \\ 中
  let inRegex = false
  // 在exp中发现一个 { 则curly加1，发现一个 } 则curly减1，直到curly为0 说明 { ... }闭合
  let curly = 0
  // 在exp中发现一个 [ 则square加1，发现一个 ] 则square减1，直到square为0 说明 [ ... ]闭合
  let square = 0
  // 在exp中发现一个 ( 则paren加1，发现一个 ) 则paren减1，直到paren为0 说明 ( ... )闭合
  let paren = 0
  // 解析游标，每循环过一个字符串游标加1
  let lastFilterIndex = 0
  
  let c, prev, i, expression, filters
  // 从前往后开始一个一个匹配，匹配出那些特殊字符
  for (i = 0; i < exp.length; i++) {
    prev = c
    c = exp.charCodeAt(i)
    if (inSingle) {
      if (c === 0x27 && prev !== 0x5C) inSingle = false
    } else if (inDouble) {
      if (c === 0x22 && prev !== 0x5C) inDouble = false
    } else if (inTemplateString) {
      if (c === 0x60 && prev !== 0x5C) inTemplateString = false
    } else if (inRegex) {
      if (c === 0x2f && prev !== 0x5C) inRegex = false
    } else if (
      c === 0x7C && // 匹配 字符 |
      exp.charCodeAt(i + 1) !== 0x7C && // 不是 || 
      exp.charCodeAt(i - 1) !== 0x7C && // 不是 || 
      !curly && !square && !paren // 不在() [] {} 之间
    ) {
      if (expression === undefined) {
        // first filter, end of expression
        lastFilterIndex = i + 1
        // 截取表达式为当前过滤器之前的部分
        expression = exp.slice(0, i).trim()
      } else {
        // 添加过滤器
        pushFilter()
      }
    } else {
      switch (c) {
        case 0x22: inDouble = true; break         // "
        case 0x27: inSingle = true; break         // '
        case 0x60: inTemplateString = true; break // `
        case 0x28: paren++; break                 // (
        case 0x29: paren--; break                 // )
        case 0x5B: square++; break                // [
        case 0x5D: square--; break                // ]
        case 0x7B: curly++; break                 // {
        case 0x7D: curly--; break                 // }
      }
      if (c === 0x2f) { // /
        let j = i - 1
        let p
        // find first non-whitespace prev char
        for (; j >= 0; j--) {
          p = exp.charAt(j)
          if (p !== ' ') break
        }
        if (!p || !validDivisionCharRE.test(p)) {
          inRegex = true
        }
      }
    }
  }
  // 循环结束，没有定义过过滤器，则去除整个字符串的首位空格
  if (expression === undefined) {
    expression = exp.slice(0, i).trim()
  // 有过滤器，则保存过滤器最后一部分
  } else if (lastFilterIndex !== 0) {
    pushFilter()
  }

  function pushFilter () {
    // 截取当前过滤器之前的部分，存入filters中
    (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim())
    lastFilterIndex = i + 1
  }
  // 循环完成后，如果过滤器存在，则拼接过滤器render函数
  if (filters) {
    for (i = 0; i < filters.length; i++) {
      expression = wrapFilter(expression, filters[i])
    }
  }

  return expression
}

function wrapFilter (exp: string, filter: string): string {
  const i = filter.indexOf('(')
  if (i < 0) {
    // _f: resolveFilter
    return `_f("${filter}")(${exp})`
  // 判断有没有(，代表过滤器中是否有传入参数
  } else {
    const name = filter.slice(0, i)
    const args = filter.slice(i + 1)
    return `_f("${name}")(${exp}${args !== ')' ? ',' + args : args}`
  }
}
