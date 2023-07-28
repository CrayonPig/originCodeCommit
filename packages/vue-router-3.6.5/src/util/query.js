/* @flow */

import { warn } from './warn'

const encodeReserveRE = /[!'()*]/g
/* 
  1、c.charCodeAt(0) 获取字符的 ascii 编码，返回的是数字。
  2、number.toString(16) 返回 16 进制数字编码的字符串形式。
  3、!'()* 转换成的形式为 %21%27%28%29%2a。
 */
const encodeReserveReplacer = c => '%' + c.charCodeAt(0).toString(16)
const commaRE = /%2C/g

const encode = str =>
  // 对字符串进行编码转化 （url上不能有特殊字符。）
  encodeURIComponent(str)
  // 将 [!'()*] 转换成  %21%27%28%29%2a 的形式
    .replace(encodeReserveRE, encodeReserveReplacer)
    // 将 %2c 替换成 ',' 2c 就是 44 的十六进制表示。 44 的 ascii 符号对应的就是 ','
    .replace(commaRE, ',')

// 特殊字符解码
export function decode (str: string) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      warn(false, `Error decoding "${str}". Leaving it intact.`)
    }
  }
  return str
}
// 合并所有的 query 
export function resolveQuery (
  query: ?string,
  extraQuery: Dictionary<string> = {},
  _parseQuery: ?Function
): Dictionary<string> {
  const parse = _parseQuery || parseQuery
  let parsedQuery
  try {
    // 解析成 { key1=value1, key2=[value2,value3] }
    parsedQuery = parse(query || '')
  } catch (e) {
    process.env.NODE_ENV !== 'production' && warn(false, e.message)
    parsedQuery = {}
  }
  // extraQuery 是通过 push() 或者 replace() 的时候指定的 query 参数对象。
  // <link-view :to={path:'xxxx', query: {xxxx}}></link-view>
  // this.$router.push( { path: "xxx", query: {xxxxxx} } )
  for (const key in extraQuery) {
    const value = extraQuery[key]
    // 如果 value 是数组,则对每个元素进行处理
    // 如果元素是基础类型数据，则转为字符串；否则原样返回
    parsedQuery[key] = Array.isArray(value)
      ? value.map(castQueryParamValue)
      : castQueryParamValue(value)
  }
  return parsedQuery
}
// 如果是基础类型数据，则转为字符串；否则原样返回
const castQueryParamValue = value => (value == null || typeof value === 'object' ? value : String(value))

// 将 key=value&key=value 解析成对象。{ key: value, key1:[value2,value3] }
function parseQuery (query: string): Dictionary<string> {
  const res = {}

  query = query.trim().replace(/^(\?|#|&)/, '')

  if (!query) {
    return res
  }

  query.split('&').forEach(param => {
    const parts = param.replace(/\+/g, ' ').split('=')
    const key = decode(parts.shift())
    const val = parts.length > 0 ? decode(parts.join('=')) : null

    if (res[key] === undefined) {
      res[key] = val
    } else if (Array.isArray(res[key])) {
      res[key].push(val)
    } else {
      res[key] = [res[key], val]
    }
  })

  return res
}
// 将 query 参数进行序列化成字符串
export function stringifyQuery (obj: Dictionary<string>): string {
  const res = obj
    ? Object.keys(obj)
      .map(key => {
        const val = obj[key]

        if (val === undefined) {
          return ''
        }

        if (val === null) {
          return encode(key)
        }

        if (Array.isArray(val)) {
          const result = []
          val.forEach(val2 => {
            if (val2 === undefined) {
              return
            }
            if (val2 === null) {
              result.push(encode(key))
            } else {
              result.push(encode(key) + '=' + encode(val2))
            }
          })
          return result.join('&')
        }

        return encode(key) + '=' + encode(val)
      })
      .filter(x => x.length > 0)
      .join('&')
    : null
  return res ? `?${res}` : ''
}
