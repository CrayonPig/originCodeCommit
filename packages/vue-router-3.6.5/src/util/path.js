/* @flow */

/**
 * 解析路径
 * @param {*} relative 相对路径，要跳转路径的 pathname
 * @param {*} base 基准路径
 * @param {*} append 是否需要拼接基准地址
 * @returns 
 */
export function resolvePath (
  relative: string,
  base: string,
  append?: boolean
): string {
  const firstChar = relative.charAt(0)
  // 绝对路径，不需要拼接基准路径
  if (firstChar === '/') {
    return relative
  }

  // 如果以 ? 或者 # 开头，则表示要跳转的路径是 "",则表示是原路径跳转，即刷新本页面。
  // 所以拼接原来路径的 pathName
  if (firstChar === '?' || firstChar === '#') {
    return base + relative
  }

  // 将 base 路径按照 "/" 切分成数组
  const stack = base.split('/')

  // remove trailing segment if:
  // - not appending
  // - appending to trailing slash (last segment is empty)
  // 如果需要追加基础路径，且 stack 最后一个元素为 “”, 则将最后一个元素移除
  // 防止重复添加'/'
  if (!append || !stack[stack.length - 1]) {
    stack.pop()
  }

  // resolve relative path
  // 去除开头的第一个 /
  const segments = relative.replace(/^\//, '').split('/')
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    // 如果是 '..', 则表示当前目录的上一级目录
    if (segment === '..') {
      // 则弹出当前目录代表的元素
      stack.pop()
    } else if (segment !== '.') {
      // 如果是 '.', 则表示是当前目录，不需要处理。
      // 否则就是有效路径。被添加到 stack 中。
      stack.push(segment)
    }
  }

  // ensure leading slash
  // 通过添加''，保证匹配字符串最后解析完毕后以/开头
  if (stack[0] !== '') {
    stack.unshift('')
  }

  return stack.join('/')
}

// 拆分路径，解析成一个 { path, query, hash } 的对象。
export function parsePath (path: string): {
  path: string;
  query: string;
  hash: string;
} {
  let hash = ''
  let query = ''

  const hashIndex = path.indexOf('#')
  // 如果存在 # 号，则将 # 后面的内容记录为 hash。 且将 path 去除 # 之后的内容。
  if (hashIndex >= 0) {
    hash = path.slice(hashIndex)
    path = path.slice(0, hashIndex)
  }

  const queryIndex = path.indexOf('?')
  // 如果匹配完#后，还存在 ？ 号，则将 ？ 后面的内容记录为 query, 剩下的为path
  if (queryIndex >= 0) {
    query = path.slice(queryIndex + 1)
    path = path.slice(0, queryIndex)
  }

  return {
    path,
    query,
    hash
  }
}
// 清理 path 路径中 // 
export function cleanPath (path: string): string {
  return path.replace(/\/(?:\s*\/)+/g, '/')
}
