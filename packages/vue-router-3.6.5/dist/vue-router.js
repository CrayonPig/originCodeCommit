/*!
  * vue-router v3.6.5
  * (c) 2023 Evan You
  * @license MIT
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.VueRouter = factory());
})(this, (function () { 'use strict';

  /*  */

  function assert (condition, message) {
    if (!condition) {
      throw new Error(("[vue-router] " + message))
    }
  }

  function warn (condition, message) {
    if (!condition) {
      typeof console !== 'undefined' && console.warn(("[vue-router] " + message));
    }
  }

  function extend (a, b) {
    for (var key in b) {
      a[key] = b[key];
    }
    return a
  }

  /*  */

  var encodeReserveRE = /[!'()*]/g;
  /* 
    1、c.charCodeAt(0) 获取字符的 ascii 编码，返回的是数字。
    2、number.toString(16) 返回 16 进制数字编码的字符串形式。
    3、!'()* 转换成的形式为 %21%27%28%29%2a。
   */
  var encodeReserveReplacer = function (c) { return '%' + c.charCodeAt(0).toString(16); };
  var commaRE = /%2C/g;

  var encode = function (str) { return encodeURIComponent(str)
    // 将 [!'()*] 转换成  %21%27%28%29%2a 的形式
      .replace(encodeReserveRE, encodeReserveReplacer)
      // 将 %2c 替换成 ',' 2c 就是 44 的十六进制表示。 44 的 ascii 符号对应的就是 ','
      .replace(commaRE, ','); };

  // 特殊字符解码
  function decode (str) {
    try {
      return decodeURIComponent(str)
    } catch (err) {
      {
        warn(false, ("Error decoding \"" + str + "\". Leaving it intact."));
      }
    }
    return str
  }
  // 合并所有的 query 
  function resolveQuery (
    query,
    extraQuery,
    _parseQuery
  ) {
    if ( extraQuery === void 0 ) extraQuery = {};

    var parse = _parseQuery || parseQuery;
    var parsedQuery;
    try {
      // 解析成 { key1=value1, key2=[value2,value3] }
      parsedQuery = parse(query || '');
    } catch (e) {
      warn(false, e.message);
      parsedQuery = {};
    }
    // extraQuery 是通过 push() 或者 replace() 的时候指定的 query 参数对象。
    // <link-view :to={path:'xxxx', query: {xxxx}}></link-view>
    // this.$router.push( { path: "xxx", query: {xxxxxx} } )
    for (var key in extraQuery) {
      var value = extraQuery[key];
      // 如果 value 是数组,则对每个元素进行处理
      // 如果元素是基础类型数据，则转为字符串；否则原样返回
      parsedQuery[key] = Array.isArray(value)
        ? value.map(castQueryParamValue)
        : castQueryParamValue(value);
    }
    return parsedQuery
  }
  // 如果是基础类型数据，则转为字符串；否则原样返回
  var castQueryParamValue = function (value) { return (value == null || typeof value === 'object' ? value : String(value)); };

  // 将 key=value&key=value 解析成对象。{ key: value, key1:[value2,value3] }
  function parseQuery (query) {
    var res = {};

    query = query.trim().replace(/^(\?|#|&)/, '');

    if (!query) {
      return res
    }

    query.split('&').forEach(function (param) {
      var parts = param.replace(/\+/g, ' ').split('=');
      var key = decode(parts.shift());
      var val = parts.length > 0 ? decode(parts.join('=')) : null;

      if (res[key] === undefined) {
        res[key] = val;
      } else if (Array.isArray(res[key])) {
        res[key].push(val);
      } else {
        res[key] = [res[key], val];
      }
    });

    return res
  }
  // 将 query 参数进行序列化成字符串
  function stringifyQuery (obj) {
    var res = obj
      ? Object.keys(obj)
        .map(function (key) {
          var val = obj[key];

          if (val === undefined) {
            return ''
          }

          if (val === null) {
            return encode(key)
          }

          if (Array.isArray(val)) {
            var result = [];
            val.forEach(function (val2) {
              if (val2 === undefined) {
                return
              }
              if (val2 === null) {
                result.push(encode(key));
              } else {
                result.push(encode(key) + '=' + encode(val2));
              }
            });
            return result.join('&')
          }

          return encode(key) + '=' + encode(val)
        })
        .filter(function (x) { return x.length > 0; })
        .join('&')
      : null;
    return res ? ("?" + res) : ''
  }

  /*  */

  var trailingSlashRE = /\/?$/;

  // 创建路由对象
  function createRoute (
    record,
    location,
    redirectedFrom,
    router
  ) {
    // 获取router中的序列化成字符串方法
    var stringifyQuery = router && router.options.stringifyQuery;

    var query = location.query || {};
    try {
      query = clone(query);
    } catch (e) {}

    var route = {
      name: location.name || (record && record.name),
      meta: (record && record.meta) || {},
      path: location.path || '/',
      hash: location.hash || '',
      query: query,
      params: location.params || {},
      // 拼接完整路径
      fullPath: getFullPath(location, stringifyQuery),
      matched: record ? formatMatch(record) : []
    };
    // 如果有重定向来源
    if (redirectedFrom) {
      // 拼接完整路径
      route.redirectedFrom = getFullPath(redirectedFrom, stringifyQuery);
    }
    // 将对象变为只读
    return Object.freeze(route)
  }

  function clone (value) {
    if (Array.isArray(value)) {
      return value.map(clone)
    } else if (value && typeof value === 'object') {
      var res = {};
      for (var key in value) {
        res[key] = clone(value[key]);
      }
      return res
    } else {
      return value
    }
  }

  // the starting route that represents the initial state
  var START = createRoute(null, {
    path: '/'
  });

  function formatMatch (record) {
    var res = [];
    while (record) {
      res.unshift(record);
      record = record.parent;
    }
    return res
  }

  function getFullPath (
    ref,
    _stringifyQuery
  ) {
    var path = ref.path;
    var query = ref.query; if ( query === void 0 ) query = {};
    var hash = ref.hash; if ( hash === void 0 ) hash = '';

    var stringify = _stringifyQuery || stringifyQuery;
    return (path || '/') + stringify(query) + hash
  }

  function isSameRoute (a, b, onlyPath) {
    if (b === START) {
      return a === b
    } else if (!b) {
      return false
    } else if (a.path && b.path) {
      return a.path.replace(trailingSlashRE, '') === b.path.replace(trailingSlashRE, '') && (onlyPath ||
        a.hash === b.hash &&
        isObjectEqual(a.query, b.query))
    } else if (a.name && b.name) {
      return (
        a.name === b.name &&
        (onlyPath || (
          a.hash === b.hash &&
        isObjectEqual(a.query, b.query) &&
        isObjectEqual(a.params, b.params))
        )
      )
    } else {
      return false
    }
  }

  function isObjectEqual (a, b) {
    if ( a === void 0 ) a = {};
    if ( b === void 0 ) b = {};

    // handle null value #1566
    if (!a || !b) { return a === b }
    var aKeys = Object.keys(a).sort();
    var bKeys = Object.keys(b).sort();
    if (aKeys.length !== bKeys.length) {
      return false
    }
    return aKeys.every(function (key, i) {
      var aVal = a[key];
      var bKey = bKeys[i];
      if (bKey !== key) { return false }
      var bVal = b[key];
      // query values can be null and undefined
      if (aVal == null || bVal == null) { return aVal === bVal }
      // check nested equality
      if (typeof aVal === 'object' && typeof bVal === 'object') {
        return isObjectEqual(aVal, bVal)
      }
      return String(aVal) === String(bVal)
    })
  }

  function isIncludedRoute (current, target) {
    return (
      current.path.replace(trailingSlashRE, '/').indexOf(
        target.path.replace(trailingSlashRE, '/')
      ) === 0 &&
      (!target.hash || current.hash === target.hash) &&
      queryIncludes(current.query, target.query)
    )
  }

  function queryIncludes (current, target) {
    for (var key in target) {
      if (!(key in current)) {
        return false
      }
    }
    return true
  }

  function handleRouteEntered (route) {
    for (var i = 0; i < route.matched.length; i++) {
      var record = route.matched[i];
      for (var name in record.instances) {
        var instance = record.instances[name];
        var cbs = record.enteredCbs[name];
        if (!instance || !cbs) { continue }
        delete record.enteredCbs[name];
        for (var i$1 = 0; i$1 < cbs.length; i$1++) {
          if (!instance._isBeingDestroyed) { cbs[i$1](instance); }
        }
      }
    }
  }

  var View = {
    name: 'RouterView',
    functional: true,
    props: {
      name: {
        type: String,
        default: 'default'
      }
    },
    render: function render (_, ref) {
      var props = ref.props;
      var children = ref.children;
      var parent = ref.parent;
      var data = ref.data;

      // used by devtools to display a router-view badge
      data.routerView = true;

      // directly use parent context's createElement() function
      // so that components rendered by router-view can resolve named slots
      var h = parent.$createElement;
      var name = props.name;
      var route = parent.$route;
      var cache = parent._routerViewCache || (parent._routerViewCache = {});

      // determine current view depth, also check to see if the tree
      // has been toggled inactive but kept-alive.
      var depth = 0;
      var inactive = false;
      while (parent && parent._routerRoot !== parent) {
        var vnodeData = parent.$vnode ? parent.$vnode.data : {};
        if (vnodeData.routerView) {
          depth++;
        }
        if (vnodeData.keepAlive && parent._directInactive && parent._inactive) {
          inactive = true;
        }
        parent = parent.$parent;
      }
      data.routerViewDepth = depth;

      // render previous view if the tree is inactive and kept-alive
      if (inactive) {
        var cachedData = cache[name];
        var cachedComponent = cachedData && cachedData.component;
        if (cachedComponent) {
          // #2301
          // pass props
          if (cachedData.configProps) {
            fillPropsinData(cachedComponent, data, cachedData.route, cachedData.configProps);
          }
          return h(cachedComponent, data, children)
        } else {
          // render previous empty view
          return h()
        }
      }

      var matched = route.matched[depth];
      var component = matched && matched.components[name];

      // render empty node if no matched route or no config component
      if (!matched || !component) {
        cache[name] = null;
        return h()
      }

      // cache component
      cache[name] = { component: component };

      // attach instance registration hook
      // this will be called in the instance's injected lifecycle hooks
      data.registerRouteInstance = function (vm, val) {
        // val could be undefined for unregistration
        var current = matched.instances[name];
        if (
          (val && current !== vm) ||
          (!val && current === vm)
        ) {
          matched.instances[name] = val;
        }
      }

      // also register instance in prepatch hook
      // in case the same component instance is reused across different routes
      ;(data.hook || (data.hook = {})).prepatch = function (_, vnode) {
        matched.instances[name] = vnode.componentInstance;
      };

      // register instance in init hook
      // in case kept-alive component be actived when routes changed
      data.hook.init = function (vnode) {
        if (vnode.data.keepAlive &&
          vnode.componentInstance &&
          vnode.componentInstance !== matched.instances[name]
        ) {
          matched.instances[name] = vnode.componentInstance;
        }

        // if the route transition has already been confirmed then we weren't
        // able to call the cbs during confirmation as the component was not
        // registered yet, so we call it here.
        handleRouteEntered(route);
      };

      var configProps = matched.props && matched.props[name];
      // save route and configProps in cache
      if (configProps) {
        extend(cache[name], {
          route: route,
          configProps: configProps
        });
        fillPropsinData(component, data, route, configProps);
      }

      return h(component, data, children)
    }
  };

  function fillPropsinData (component, data, route, configProps) {
    // resolve props
    var propsToPass = data.props = resolveProps(route, configProps);
    if (propsToPass) {
      // clone to prevent mutation
      propsToPass = data.props = extend({}, propsToPass);
      // pass non-declared props as attrs
      var attrs = data.attrs = data.attrs || {};
      for (var key in propsToPass) {
        if (!component.props || !(key in component.props)) {
          attrs[key] = propsToPass[key];
          delete propsToPass[key];
        }
      }
    }
  }

  function resolveProps (route, config) {
    switch (typeof config) {
      case 'undefined':
        return
      case 'object':
        return config
      case 'function':
        return config(route)
      case 'boolean':
        return config ? route.params : undefined
      default:
        {
          warn(
            false,
            "props in \"" + (route.path) + "\" is a " + (typeof config) + ", " +
            "expecting an object, function or boolean."
          );
        }
    }
  }

  /*  */

  /**
   * 解析路径
   * @param {*} relative 相对路径，要跳转路径的 pathname
   * @param {*} base 基准路径
   * @param {*} append 是否需要拼接基准地址
   * @returns 
   */
  function resolvePath (
    relative,
    base,
    append
  ) {
    var firstChar = relative.charAt(0);
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
    var stack = base.split('/');

    // remove trailing segment if:
    // - not appending
    // - appending to trailing slash (last segment is empty)
    // 如果需要追加基础路径，且 stack 最后一个元素为 “”, 则将最后一个元素移除
    // 防止重复添加'/'
    if (!append || !stack[stack.length - 1]) {
      stack.pop();
    }

    // resolve relative path
    // 去除开头的第一个 /
    var segments = relative.replace(/^\//, '').split('/');
    for (var i = 0; i < segments.length; i++) {
      var segment = segments[i];
      // 如果是 '..', 则表示当前目录的上一级目录
      if (segment === '..') {
        // 则弹出当前目录代表的元素
        stack.pop();
      } else if (segment !== '.') {
        // 如果是 '.', 则表示是当前目录，不需要处理。
        // 否则就是有效路径。被添加到 stack 中。
        stack.push(segment);
      }
    }

    // ensure leading slash
    // 通过添加''，保证匹配字符串最后解析完毕后以/开头
    if (stack[0] !== '') {
      stack.unshift('');
    }

    return stack.join('/')
  }

  // 拆分路径，解析成一个 { path, query, hash } 的对象。
  function parsePath (path) {
    var hash = '';
    var query = '';

    var hashIndex = path.indexOf('#');
    // 如果存在 # 号，则将 # 后面的内容记录为 hash。 且将 path 去除 # 之后的内容。
    if (hashIndex >= 0) {
      hash = path.slice(hashIndex);
      path = path.slice(0, hashIndex);
    }

    var queryIndex = path.indexOf('?');
    // 如果匹配完#后，还存在 ？ 号，则将 ？ 后面的内容记录为 query, 剩下的为path
    if (queryIndex >= 0) {
      query = path.slice(queryIndex + 1);
      path = path.slice(0, queryIndex);
    }

    return {
      path: path,
      query: query,
      hash: hash
    }
  }
  // 清理 path 路径中 // 
  function cleanPath (path) {
    return path.replace(/\/(?:\s*\/)+/g, '/')
  }

  var isarray = Array.isArray || function (arr) {
    return Object.prototype.toString.call(arr) == '[object Array]';
  };

  /**
   * Expose `pathToRegexp`.
   */
  var pathToRegexp_1 = pathToRegexp;
  var parse_1 = parse;
  var compile_1 = compile;
  var tokensToFunction_1 = tokensToFunction;
  var tokensToRegExp_1 = tokensToRegExp;

  /**
   * The main path matching regexp utility.
   *
   * @type {RegExp}
   */
  var PATH_REGEXP = new RegExp([
    // Match escaped characters that would otherwise appear in future matches.
    // This allows the user to escape special characters that won't transform.
    '(\\\\.)',
    // Match Express-style parameters and un-named parameters with a prefix
    // and optional suffixes. Matches appear as:
    //
    // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
    // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
    // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
    '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))'
  ].join('|'), 'g');

  /**
   * Parse a string for the raw tokens.
   *
   * @param  {string}  str
   * @param  {Object=} options
   * @return {!Array}
   */
  function parse (str, options) {
    var tokens = [];
    var key = 0;
    var index = 0;
    var path = '';
    var defaultDelimiter = options && options.delimiter || '/';
    var res;

    while ((res = PATH_REGEXP.exec(str)) != null) {
      var m = res[0];
      var escaped = res[1];
      var offset = res.index;
      path += str.slice(index, offset);
      index = offset + m.length;

      // Ignore already escaped sequences.
      if (escaped) {
        path += escaped[1];
        continue
      }

      var next = str[index];
      var prefix = res[2];
      var name = res[3];
      var capture = res[4];
      var group = res[5];
      var modifier = res[6];
      var asterisk = res[7];

      // Push the current path onto the tokens.
      if (path) {
        tokens.push(path);
        path = '';
      }

      var partial = prefix != null && next != null && next !== prefix;
      var repeat = modifier === '+' || modifier === '*';
      var optional = modifier === '?' || modifier === '*';
      var delimiter = res[2] || defaultDelimiter;
      var pattern = capture || group;

      tokens.push({
        name: name || key++,
        prefix: prefix || '',
        delimiter: delimiter,
        optional: optional,
        repeat: repeat,
        partial: partial,
        asterisk: !!asterisk,
        pattern: pattern ? escapeGroup(pattern) : (asterisk ? '.*' : '[^' + escapeString(delimiter) + ']+?')
      });
    }

    // Match any characters still remaining.
    if (index < str.length) {
      path += str.substr(index);
    }

    // If the path exists, push it onto the end.
    if (path) {
      tokens.push(path);
    }

    return tokens
  }

  /**
   * Compile a string to a template function for the path.
   *
   * @param  {string}             str
   * @param  {Object=}            options
   * @return {!function(Object=, Object=)}
   */
  function compile (str, options) {
    return tokensToFunction(parse(str, options), options)
  }

  /**
   * Prettier encoding of URI path segments.
   *
   * @param  {string}
   * @return {string}
   */
  function encodeURIComponentPretty (str) {
    return encodeURI(str).replace(/[\/?#]/g, function (c) {
      return '%' + c.charCodeAt(0).toString(16).toUpperCase()
    })
  }

  /**
   * Encode the asterisk parameter. Similar to `pretty`, but allows slashes.
   *
   * @param  {string}
   * @return {string}
   */
  function encodeAsterisk (str) {
    return encodeURI(str).replace(/[?#]/g, function (c) {
      return '%' + c.charCodeAt(0).toString(16).toUpperCase()
    })
  }

  /**
   * Expose a method for transforming tokens into the path function.
   */
  function tokensToFunction (tokens, options) {
    // Compile all the tokens into regexps.
    var matches = new Array(tokens.length);

    // Compile all the patterns before compilation.
    for (var i = 0; i < tokens.length; i++) {
      if (typeof tokens[i] === 'object') {
        matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$', flags(options));
      }
    }

    return function (obj, opts) {
      var path = '';
      var data = obj || {};
      var options = opts || {};
      var encode = options.pretty ? encodeURIComponentPretty : encodeURIComponent;

      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];

        if (typeof token === 'string') {
          path += token;

          continue
        }

        var value = data[token.name];
        var segment;

        if (value == null) {
          if (token.optional) {
            // Prepend partial segment prefixes.
            if (token.partial) {
              path += token.prefix;
            }

            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to be defined')
          }
        }

        if (isarray(value)) {
          if (!token.repeat) {
            throw new TypeError('Expected "' + token.name + '" to not repeat, but received `' + JSON.stringify(value) + '`')
          }

          if (value.length === 0) {
            if (token.optional) {
              continue
            } else {
              throw new TypeError('Expected "' + token.name + '" to not be empty')
            }
          }

          for (var j = 0; j < value.length; j++) {
            segment = encode(value[j]);

            if (!matches[i].test(segment)) {
              throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received `' + JSON.stringify(segment) + '`')
            }

            path += (j === 0 ? token.prefix : token.delimiter) + segment;
          }

          continue
        }

        segment = token.asterisk ? encodeAsterisk(value) : encode(value);

        if (!matches[i].test(segment)) {
          throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
        }

        path += token.prefix + segment;
      }

      return path
    }
  }

  /**
   * Escape a regular expression string.
   *
   * @param  {string} str
   * @return {string}
   */
  function escapeString (str) {
    return str.replace(/([.+*?=^!:${}()[\]|\/\\])/g, '\\$1')
  }

  /**
   * Escape the capturing group by escaping special characters and meaning.
   *
   * @param  {string} group
   * @return {string}
   */
  function escapeGroup (group) {
    return group.replace(/([=!:$\/()])/g, '\\$1')
  }

  /**
   * Attach the keys as a property of the regexp.
   *
   * @param  {!RegExp} re
   * @param  {Array}   keys
   * @return {!RegExp}
   */
  function attachKeys (re, keys) {
    re.keys = keys;
    return re
  }

  /**
   * Get the flags for a regexp from the options.
   *
   * @param  {Object} options
   * @return {string}
   */
  function flags (options) {
    return options && options.sensitive ? '' : 'i'
  }

  /**
   * Pull out keys from a regexp.
   *
   * @param  {!RegExp} path
   * @param  {!Array}  keys
   * @return {!RegExp}
   */
  function regexpToRegexp (path, keys) {
    // Use a negative lookahead to match only capturing groups.
    var groups = path.source.match(/\((?!\?)/g);

    if (groups) {
      for (var i = 0; i < groups.length; i++) {
        keys.push({
          name: i,
          prefix: null,
          delimiter: null,
          optional: false,
          repeat: false,
          partial: false,
          asterisk: false,
          pattern: null
        });
      }
    }

    return attachKeys(path, keys)
  }

  /**
   * Transform an array into a regexp.
   *
   * @param  {!Array}  path
   * @param  {Array}   keys
   * @param  {!Object} options
   * @return {!RegExp}
   */
  function arrayToRegexp (path, keys, options) {
    var parts = [];

    for (var i = 0; i < path.length; i++) {
      parts.push(pathToRegexp(path[i], keys, options).source);
    }

    var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

    return attachKeys(regexp, keys)
  }

  /**
   * Create a path regexp from string input.
   *
   * @param  {string}  path
   * @param  {!Array}  keys
   * @param  {!Object} options
   * @return {!RegExp}
   */
  function stringToRegexp (path, keys, options) {
    return tokensToRegExp(parse(path, options), keys, options)
  }

  /**
   * Expose a function for taking tokens and returning a RegExp.
   *
   * @param  {!Array}          tokens
   * @param  {(Array|Object)=} keys
   * @param  {Object=}         options
   * @return {!RegExp}
   */
  function tokensToRegExp (tokens, keys, options) {
    if (!isarray(keys)) {
      options = /** @type {!Object} */ (keys || options);
      keys = [];
    }

    options = options || {};

    var strict = options.strict;
    var end = options.end !== false;
    var route = '';

    // Iterate over the tokens and create our regexp string.
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];

      if (typeof token === 'string') {
        route += escapeString(token);
      } else {
        var prefix = escapeString(token.prefix);
        var capture = '(?:' + token.pattern + ')';

        keys.push(token);

        if (token.repeat) {
          capture += '(?:' + prefix + capture + ')*';
        }

        if (token.optional) {
          if (!token.partial) {
            capture = '(?:' + prefix + '(' + capture + '))?';
          } else {
            capture = prefix + '(' + capture + ')?';
          }
        } else {
          capture = prefix + '(' + capture + ')';
        }

        route += capture;
      }
    }

    var delimiter = escapeString(options.delimiter || '/');
    var endsWithDelimiter = route.slice(-delimiter.length) === delimiter;

    // In non-strict mode we allow a slash at the end of match. If the path to
    // match already ends with a slash, we remove it for consistency. The slash
    // is valid at the end of a path match, not in the middle. This is important
    // in non-ending mode, where "/test/" shouldn't match "/test//route".
    if (!strict) {
      route = (endsWithDelimiter ? route.slice(0, -delimiter.length) : route) + '(?:' + delimiter + '(?=$))?';
    }

    if (end) {
      route += '$';
    } else {
      // In non-ending mode, we need the capturing groups to match as much as
      // possible by using a positive lookahead to the end or next path segment.
      route += strict && endsWithDelimiter ? '' : '(?=' + delimiter + '|$)';
    }

    return attachKeys(new RegExp('^' + route, flags(options)), keys)
  }

  /**
   * Normalize the given path string, returning a regular expression.
   *
   * An empty array can be passed in for the keys, which will hold the
   * placeholder key descriptions. For example, using `/user/:id`, `keys` will
   * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
   *
   * @param  {(string|RegExp|Array)} path
   * @param  {(Array|Object)=}       keys
   * @param  {Object=}               options
   * @return {!RegExp}
   */
  function pathToRegexp (path, keys, options) {
    if (!isarray(keys)) {
      options = /** @type {!Object} */ (keys || options);
      keys = [];
    }

    options = options || {};

    if (path instanceof RegExp) {
      return regexpToRegexp(path, /** @type {!Array} */ (keys))
    }

    if (isarray(path)) {
      return arrayToRegexp(/** @type {!Array} */ (path), /** @type {!Array} */ (keys), options)
    }

    return stringToRegexp(/** @type {string} */ (path), /** @type {!Array} */ (keys), options)
  }
  pathToRegexp_1.parse = parse_1;
  pathToRegexp_1.compile = compile_1;
  pathToRegexp_1.tokensToFunction = tokensToFunction_1;
  pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;

  /*  */

  // $flow-disable-line
  var regexpCompileCache = Object.create(null);

  function fillParams (
    path,
    params,
    routeMsg
  ) {
    params = params || {};
    try {
      var filler =
        regexpCompileCache[path] ||
        (regexpCompileCache[path] = pathToRegexp_1.compile(path));

      // Fix #2505 resolving asterisk routes { name: 'not-found', params: { pathMatch: '/not-found' }}
      // and fix #3106 so that you can work with location descriptor object having params.pathMatch equal to empty string
      if (typeof params.pathMatch === 'string') { params[0] = params.pathMatch; }

      return filler(params, { pretty: true })
    } catch (e) {
      {
        // Fix #3072 no warn if `pathMatch` is string
        warn(typeof params.pathMatch === 'string', ("missing param for " + routeMsg + ": " + (e.message)));
      }
      return ''
    } finally {
      // delete the 0 if it was added
      delete params[0];
    }
  }

  /*  */

  /**
    * 格式化location
    * @param {*} raw 
    * @param {*} current 当前路由信息 this.$route
    * @param {*} append 表示相对路径是否追加基准路径
    * @param {*} router 当前路由对象 this.$router
    * @returns 
    * {
        _normalized: true,
        name, //name, path 同时存在的情况下，优先使用 name。
        path, //就是 window.location.href 的 pathname 部分。
        query,
        hash,
      } 
    */
  function normalizeLocation (
    raw,
    current,
    append,
    router
  ) {
    // 如果 raw 是字符串，则表示 raw 就是跳转路径，包装成为 { path: xxx } 形式
    // 如果 raw 是对象，则不需要处理，本身就是  { path: xxx } 或者 { name: xxx } 的形式
    var next = typeof raw === 'string' ? { path: raw } : raw;
    // named target
    // 是否已经对 next 进行过格式化处理。如果处理过，则直接返回就行。
    if (next._normalized) {
      return next
    } else if (next.name) {
      // 如果 raw.name 存在，则表示是命名路由跳转形式。则将 raw 中属性浅拷贝到 next 对象中。
      next = extend({}, raw);
      var params = next.params;
      if (params && typeof params === 'object') {
        next.params = extend({}, params);
      }
      return next
    }

    // relative params
    // next.name, next.path 都不存在的情形。且 next.params 路径参数对象存在
    // 这种情形就是 path 为 "" 的情形，即原路径跳转(相当于刷新当前页)
    if (!next.path && next.params && current) {
      next = extend({}, next);
      next._normalized = true;
      // 将当前 route 的 params 数据，以及要跳转的 next route 的 params 拼凑成一个
      var params$1 = extend(extend({}, current.params), next.params);
      // 如果当前 route 的 name 存在
      if (current.name) {
        next.name = current.name;
        next.params = params$1;
      } else if (current.matched.length) {
        // 如果 name 不存在; 但是 current 的 record 对象数组存在。
        // 获取 current route 对象对应的 record 对象的 path 属性。
        var rawPath = current.matched[current.matched.length - 1].path;
        // 替换动态参数
        next.path = fillParams(rawPath, params$1, ("path " + (current.path)));
      } else {
        warn(false, "relative params navigation requires a current route.");
      }
      return next
    }

    var parsedPath = parsePath(next.path || '');
    // 如果 next 的 path 是相对路径，那么就需要 current 的路由 path 作为基准路径
    var basePath = (current && current.path) || '/';
    //处理 parsedPath.path 的路径，如果是绝对路径，则原样返回
    var path = parsedPath.path
      // 如果不是绝对路径，则拼接 basePath
      ? resolvePath(parsedPath.path, basePath, append || next.append)
      : basePath;
      
    // 合并所有的 query 
    var query = resolveQuery(
      parsedPath.query,
      next.query,
      router && router.options.parseQuery
    );
    // 如果 next 上存在 hash，则优先使用 next 上的hash。如果 next 上没有 hash，则使用 url 带有的 hash
    var hash = next.hash || parsedPath.hash;
    // 没#号，则添加
    if (hash && hash.charAt(0) !== '#') {
      hash = "#" + hash;
    }

    return {
      _normalized: true,
      path: path,
      query: query,
      hash: hash
    }
  }

  /*  */

  // work around weird flow bug
  var toTypes = [String, Object];
  var eventTypes = [String, Array];

  var noop = function () {};

  var warnedCustomSlot;
  var warnedTagProp;
  var warnedEventProp;

  var Link = {
    name: 'RouterLink',
    props: {
      to: {
        type: toTypes,
        required: true
      },
      tag: {
        type: String,
        default: 'a'
      },
      custom: Boolean,
      exact: Boolean,
      exactPath: Boolean,
      append: Boolean,
      replace: Boolean,
      activeClass: String,
      exactActiveClass: String,
      ariaCurrentValue: {
        type: String,
        default: 'page'
      },
      event: {
        type: eventTypes,
        default: 'click'
      }
    },
    render: function render (h) {
      var this$1$1 = this;

      var router = this.$router;
      var current = this.$route;
      var ref = router.resolve(
        this.to,
        current,
        this.append
      );
      var location = ref.location;
      var route = ref.route;
      var href = ref.href;

      var classes = {};
      var globalActiveClass = router.options.linkActiveClass;
      var globalExactActiveClass = router.options.linkExactActiveClass;
      // Support global empty active class
      var activeClassFallback =
        globalActiveClass == null ? 'router-link-active' : globalActiveClass;
      var exactActiveClassFallback =
        globalExactActiveClass == null
          ? 'router-link-exact-active'
          : globalExactActiveClass;
      var activeClass =
        this.activeClass == null ? activeClassFallback : this.activeClass;
      var exactActiveClass =
        this.exactActiveClass == null
          ? exactActiveClassFallback
          : this.exactActiveClass;

      var compareTarget = route.redirectedFrom
        ? createRoute(null, normalizeLocation(route.redirectedFrom), null, router)
        : route;

      classes[exactActiveClass] = isSameRoute(current, compareTarget, this.exactPath);
      classes[activeClass] = this.exact || this.exactPath
        ? classes[exactActiveClass]
        : isIncludedRoute(current, compareTarget);

      var ariaCurrentValue = classes[exactActiveClass] ? this.ariaCurrentValue : null;

      var handler = function (e) {
        if (guardEvent(e)) {
          if (this$1$1.replace) {
            router.replace(location, noop);
          } else {
            router.push(location, noop);
          }
        }
      };

      var on = { click: guardEvent };
      if (Array.isArray(this.event)) {
        this.event.forEach(function (e) {
          on[e] = handler;
        });
      } else {
        on[this.event] = handler;
      }

      var data = { class: classes };

      var scopedSlot =
        !this.$scopedSlots.$hasNormal &&
        this.$scopedSlots.default &&
        this.$scopedSlots.default({
          href: href,
          route: route,
          navigate: handler,
          isActive: classes[activeClass],
          isExactActive: classes[exactActiveClass]
        });

      if (scopedSlot) {
        if (!this.custom) {
          !warnedCustomSlot && warn(false, 'In Vue Router 4, the v-slot API will by default wrap its content with an <a> element. Use the custom prop to remove this warning:\n<router-link v-slot="{ navigate, href }" custom></router-link>\n');
          warnedCustomSlot = true;
        }
        if (scopedSlot.length === 1) {
          return scopedSlot[0]
        } else if (scopedSlot.length > 1 || !scopedSlot.length) {
          {
            warn(
              false,
              ("<router-link> with to=\"" + (this.to) + "\" is trying to use a scoped slot but it didn't provide exactly one child. Wrapping the content with a span element.")
            );
          }
          return scopedSlot.length === 0 ? h() : h('span', {}, scopedSlot)
        }
      }

      {
        if ('tag' in this.$options.propsData && !warnedTagProp) {
          warn(
            false,
            "<router-link>'s tag prop is deprecated and has been removed in Vue Router 4. Use the v-slot API to remove this warning: https://next.router.vuejs.org/guide/migration/#removal-of-event-and-tag-props-in-router-link."
          );
          warnedTagProp = true;
        }
        if ('event' in this.$options.propsData && !warnedEventProp) {
          warn(
            false,
            "<router-link>'s event prop is deprecated and has been removed in Vue Router 4. Use the v-slot API to remove this warning: https://next.router.vuejs.org/guide/migration/#removal-of-event-and-tag-props-in-router-link."
          );
          warnedEventProp = true;
        }
      }

      if (this.tag === 'a') {
        data.on = on;
        data.attrs = { href: href, 'aria-current': ariaCurrentValue };
      } else {
        // find the first <a> child and apply listener and href
        var a = findAnchor(this.$slots.default);
        if (a) {
          // in case the <a> is a static node
          a.isStatic = false;
          var aData = (a.data = extend({}, a.data));
          aData.on = aData.on || {};
          // transform existing events in both objects into arrays so we can push later
          for (var event in aData.on) {
            var handler$1 = aData.on[event];
            if (event in on) {
              aData.on[event] = Array.isArray(handler$1) ? handler$1 : [handler$1];
            }
          }
          // append new listeners for router-link
          for (var event$1 in on) {
            if (event$1 in aData.on) {
              // on[event] is always a function
              aData.on[event$1].push(on[event$1]);
            } else {
              aData.on[event$1] = handler;
            }
          }

          var aAttrs = (a.data.attrs = extend({}, a.data.attrs));
          aAttrs.href = href;
          aAttrs['aria-current'] = ariaCurrentValue;
        } else {
          // doesn't have <a> child, apply listener to self
          data.on = on;
        }
      }

      return h(this.tag, data, this.$slots.default)
    }
  };

  function guardEvent (e) {
    // don't redirect with control keys
    if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) { return }
    // don't redirect when preventDefault called
    if (e.defaultPrevented) { return }
    // don't redirect on right click
    if (e.button !== undefined && e.button !== 0) { return }
    // don't redirect if `target="_blank"`
    if (e.currentTarget && e.currentTarget.getAttribute) {
      var target = e.currentTarget.getAttribute('target');
      if (/\b_blank\b/i.test(target)) { return }
    }
    // this may be a Weex event which doesn't have this method
    if (e.preventDefault) {
      e.preventDefault();
    }
    return true
  }

  function findAnchor (children) {
    if (children) {
      var child;
      for (var i = 0; i < children.length; i++) {
        child = children[i];
        if (child.tag === 'a') {
          return child
        }
        if (child.children && (child = findAnchor(child.children))) {
          return child
        }
      }
    }
  }

  var _Vue;

  function install (Vue) {
    // 防止重复注册
    if (install.installed && _Vue === Vue) { return }
    install.installed = true;
    // 缓存Vue实例
    _Vue = Vue;

    // 判断传入参数v是否定义过
    var isDef = function (v) { return v !== undefined; };

    /**
     * 将子组件实例注册到父组件实例
     * @param {*} vm  Vue 组件实例，即要注册的子组件实例
     * @param {*} callVal 可选参数，用于在注册时传递额外的数据
     */
    var registerInstance = function (vm, callVal) {
      var i = vm.$options._parentVnode;
      if (
        // 父组件的 VNode 是否存在
        isDef(i) && 
        // 父组件 VNode 的 data 属性是否存在
        isDef(i = i.data) && 
        // data 属性中是否定义了 registerRouteInstance 方法
        isDef(i = i.registerRouteInstance)
      ) {
        // 调用registerRouteInstance注册
        i(vm, callVal);
      }
    };

    // 将路由相关的逻辑混入到每个 Vue 组件实例中
    // 在 beforeCreate 钩子执行时，会初始化路由
    // 在 destroyed 钩子执行时，会卸载路由
    Vue.mixin({
      beforeCreate: function beforeCreate () {
        // 判断组件是否存在 router 对象，该对象只在根组件上有
        if (isDef(this.$options.router)) {
          // 设置根组件
          this._routerRoot = this;
          // 设置vue router实例
          this._router = this.$options.router;
          // 调用初始化方法
          this._router.init(this);
          // 将当前路由的状态作为组件实例的响应式属性，这样在路由切换时，组件会自动更新
          Vue.util.defineReactive(this, '_route', this._router.history.current);
        } else {
          // 非根组件则直接从父组件中获取
          this._routerRoot = (this.$parent && this.$parent._routerRoot) || this;
        }
        // 当前组件实例注册到父组件中
        registerInstance(this, this);
      },
      destroyed: function destroyed () {
        // 将当前组件从父组件中注销
        registerInstance(this);
      }
    });

    // 设置代理，当访问 this.$router 的时候，代理到 this._routerRoot._router
    Object.defineProperty(Vue.prototype, '$router', {
      get: function get () { return this._routerRoot._router }
    });

    // 设置代理，当访问 this.$route 的时候，代理到 this._routerRoot._route
    Object.defineProperty(Vue.prototype, '$route', {
      get: function get () { return this._routerRoot._route }
    });

    // 全局注册组件 router-link 和 router-view
    Vue.component('RouterView', View);
    Vue.component('RouterLink', Link);
    
    // router 的钩子函数都使用与 vue.created 一样的mixin 合并策略。
    var strats = Vue.config.optionMergeStrategies;
    // use the same hook merging strategy for route hooks
    strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created;
  }

  /*  */

  var inBrowser = typeof window !== 'undefined';

  /*  */

  function createRouteMap (
    routes,
    oldPathList,
    oldPathMap,
    oldNameMap,
    parentRoute
  ) {
    // 存放所有路由的 path
    var pathList = oldPathList || [];
    // $flow-disable-line
    // 以 path 作为 key，存放所有的路由描述的Map
    var pathMap = oldPathMap || Object.create(null);
    // $flow-disable-line
    // 以 name 作为 key，存放所有的路由描述的Map
    var nameMap = oldNameMap || Object.create(null);

    // routes 是一个数组对象。也就是用户手写的 new VueRouter( { routes: [xxx] } ) 的 routes 配置数据
    // 遍历routes数组的数据，将所有元素转化为 router record 对象。且会被记录到 pathMap, nameMap 对象中。
    routes.forEach(function (route) {
      addRouteRecord(pathList, pathMap, nameMap, route, parentRoute);
    });

    // ensure wildcard routes are always at the end
    // 处理 pathList 中的 path == * 的路径，且移到数组末尾。
    for (var i = 0, l = pathList.length; i < l; i++) {
      if (pathList[i] === '*') {
        // pathList.splice(i, 1) 移除当前元素，返回移除元素的数组
        // pathList.push 将移除的元素放到数组末尾
        pathList.push(pathList.splice(i, 1)[0]);
        // 最后一个是当前元素，无需重新处理
        l--;
        // 数组发生变更，重新处理新的第i位元素
        i--;
      }
    }

    {
      // warn if routes do not include leading slashes
      var found = pathList
      // check for missing leading slash
        .filter(function (path) { return path && path.charAt(0) !== '*' && path.charAt(0) !== '/'; });

      if (found.length > 0) {
        var pathNames = found.map(function (path) { return ("- " + path); }).join('\n');
        warn(false, ("Non-nested routes must include a leading slash character. Fix the following routes: \n" + pathNames));
      }
    }

    return {
      pathList: pathList,
      pathMap: pathMap,
      nameMap: nameMap
    }
  }

  /**
   * 用于添加 route 数据
   * @param {*} pathList 存储路由 path
   * @param {*} pathMap  以 path 作为 key，存放所有的路由描述的Map
   * @param {*} nameMap  以 name 作为 key，存放所有的路由描述的Map
   * @param {*} route 用户配置的单个路由数据信息
   * @param {*} parent 父级路由描述对象
   * @param {*} matchAs 
   */
  function addRouteRecord (
    pathList,
    pathMap,
    nameMap,
    route,
    parent,
    matchAs
  ) {
    /*
      正常的route 数据为：
        {
          name: xxx,
          path: xxx,
          component: xxx,
          children: [ {
            name: xxx,
            path: xxx,
            component: xxx,
          }]
          meta: xxx
        }
    */
    var path = route.path;
    var name = route.name;

    {
      assert(path != null, "\"path\" is required in a route configuration.");
      assert(
        typeof route.component !== 'string',
        "route config \"component\" for path: " + (String(
          path || name
        )) + " cannot be a " + "string id. Use an actual component instead."
      );

      warn(
        // eslint-disable-next-line no-control-regex
        !/[^\u0000-\u007F]+/.test(path),
        "Route with path \"" + path + "\" contains unencoded characters, make sure " +
          "your path is correctly encoded before passing it to the router. Use " +
          "encodeURI to encode static segments of your path."
      );
    }
    // pathToRegexpOptions 表示编译正则的选项。
    // 可以通过配置 route 的 pathToRegexpOptions 参数添加高级配选项。默认是空对象
    var pathToRegexpOptions =
      route.pathToRegexpOptions || {};
    // 格式化路径路径名称
    // 绝对路径直接返回，相对路径就拼接父路由的path
    var normalizedPath = normalizePath(path, parent, pathToRegexpOptions.strict);

    // route.caseSensitive 属性如果存在，则设置到 pathToRegexpOptions 中。
    // caseSensitive： 表示大小写敏感。
    if (typeof route.caseSensitive === 'boolean') {
      pathToRegexpOptions.sensitive = route.caseSensitive;
    }

    var record = {
      // 完整的绝对路径
      path: normalizedPath,
      // 根据完整的路径，以及路径匹配配置参数，生成路径匹配正则对象
      regex: compileRouteRegex(normalizedPath, pathToRegexpOptions),
      // 设置 components
      // 如果是别名路由的创建，则 components 为 undefined。
      components: route.components || { default: route.component },
      // 设置路由别名。别名类似于重定向，但是显示的路径会是别名的路径。
      // 别名可以设置多个，用数组表示；如果只有一个且是字符串，则格式化为数组。
      alias: route.alias
        ? typeof route.alias === 'string'
          ? [route.alias]
          : route.alias
        : [],
      instances: {},
      enteredCbs: {},
      name: name,
      // 父路由 record 对象
      parent: parent,
      // 如果是 root route, 则 matchAS 为 undefined
      matchAs: matchAs,
      // 记录路由的 redirect 重定向属性
      redirect: route.redirect,
      // 当前路由单独定义的路由守卫
      beforeEnter: route.beforeEnter,
      // 记录 route 元数据。一般用于配置keepalive, required 等
      meta: route.meta || {},
      // 如果没配置有 route.props，则默认为空对象。
      // 如果配置有 route.props, 则如果 component 存在，则记录 route.props 数据。
      // 说明： props 类似于 query, params，都是用于携带路由传参的。不过 props 会自动把数据传递到组件的 props 中
      props:
        route.props == null
          ? {}
          : route.components
            ? route.props
            : { default: route.props }
    };

    // 如果有子路由
    if (route.children) {
      // Warn if route is named, does not redirect and has a default child route.
      // If users navigate to this route by name, the default child will
      // not be rendered (GH Issue #629)
      {
        if (
          route.name &&
          !route.redirect &&
          route.children.some(function (child) { return /^\/?$/.test(child.path); })
        ) {
          warn(
            false,
            "Named Route '" + (route.name) + "' has a default child route. " +
              "When navigating to this named route (:to=\"{name: '" + (route.name) + "'}\"), " +
              "the default child route will not be rendered. Remove the name from " +
              "this route and use the name of the default child route for named " +
              "links instead."
          );
        }
      }
      // 遍历子路由生成record对象
      route.children.forEach(function (child) {
        // 如果 route 是用户真实配置的 route 数据，则 matchAs 为 undefine。
        // 如果 route 是 alias 生成的 route 数据，则 matchAs 为被别名的完整路径。
        // 子 route 通过 matchAs 记录没有被别名的完整路径
        var childMatchAs = matchAs
          ? cleanPath((matchAs + "/" + (child.path)))
          : undefined;
        addRouteRecord(pathList, pathMap, nameMap, child, record, childMatchAs);
      });
    }
    // 如果 record.path 没有被记录到 pathMap 中。
    // 后面出现相同的 record.path，相当于直接丢弃。
    if (!pathMap[record.path]) {
      pathList.push(record.path);
      pathMap[record.path] = record;
    }

    // 如果设置了别名
    if (route.alias !== undefined) {
      // 格式化别名，后续统一为数组处理
      var aliases = Array.isArray(route.alias) ? route.alias : [route.alias];

      for (var i = 0; i < aliases.length; ++i) {
        var alias = aliases[i];
        if (alias === path) {
          warn(
            false,
            ("Found an alias with the same value as the path: \"" + path + "\". You have to remove that alias. It will be ignored in development.")
          );
          // skip in dev to make it work
          continue
        }

        // 将alias封装为route，生成对应的record
        var aliasRoute = {
          path: alias,
          children: route.children
        };
        addRouteRecord(
          pathList,
          pathMap,
          nameMap,
          aliasRoute,
          parent,
          // record.path 就是被别名的 path 的完整路径。
          record.path || '/' // matchAs
        );
      }
    }

    // 如果 route.name 存在，则记录到nameMap中
    if (name) {
      // 不重复记录
      if (!nameMap[name]) {
        nameMap[name] = record;
      } else if (!matchAs) {
        warn(
          false,
          "Duplicate named routes definition: " +
            "{ name: \"" + name + "\", path: \"" + (record.path) + "\" }"
        );
      }
    }
  }

  /**
   * 编译路由正则表达式
   * @param {*} path 路由完整的绝对路径
   * @param {*} pathToRegexpOptions 正则匹配高级配置选项
   * @returns 
   */
  function compileRouteRegex (
    path,
    pathToRegexpOptions
  ) {
    // Regexp 是 path-to-regexp 对象。 vue-router 使用 path-to-regexp.js 来进行路由规则匹配
    // 生成指定 path 的路由匹配正则对象
    var regex = pathToRegexp_1(path, [], pathToRegexpOptions);
    {
      var keys = Object.create(null);
      regex.keys.forEach(function (key) {
        warn(
          !keys[key.name],
          ("Duplicate param keys in route with path: \"" + path + "\"")
        );
        keys[key.name] = true;
      });
    }
    // 返回正则匹配对象。 作为 router record 对象的 regex 属性
    return regex
  }

  /**
   * 规范化路径
   * @param {*} path route中配置的path
   * @param {*} parent 父级route
   * @param {*} strict 严格模式，末尾斜杠是否精确匹配 (default: false)
   * @returns 
   */
  function normalizePath (
    path,
    parent,
    strict
  ) {
    // 严格模式，末尾斜杠精确匹配
    if (!strict) { path = path.replace(/\/$/, ''); }
    // path为完整路径，返回path
    if (path[0] === '/') { return path }
    // 如果 parent 不存在，则没有父路径可以拼接
    if (parent == null) { return path }
    // 返回拼接父路径和当前路径
    return cleanPath(((parent.path) + "/" + path))
  }

  /*  */



  function createMatcher (
    routes,
    router
  ) {
    // 根据 routes 数据生成 route map 对象
    var ref = createRouteMap(routes);
    var pathList = ref.pathList;
    var pathMap = ref.pathMap;
    var nameMap = ref.nameMap;

    // 批量新增 route 路由数据
    function addRoutes (routes) {
      // 如果旧的 path 存在，则新的会被忽略掉
      // 旧的 path 是不会被移除的
      createRouteMap(routes, pathList, pathMap, nameMap);
    }

    // 添加一条 route 路由数据
    function addRoute (parentOrRoute, route) {
      // 如果parentOrRoute是字符串，则代表传入的是name，找到对应的route对象，作为父级路由节点
      var parent = (typeof parentOrRoute !== 'object') ? nameMap[parentOrRoute] : undefined;
      // $flow-disable-line
      // 如果只有一个参数，则代表是直接添加到最后
      // 如果有两个参数，则第一个参数代表是要添加的父级路由节点，第二个参数为需要添加的路由
      createRouteMap([route || parentOrRoute], pathList, pathMap, nameMap, parent);

      // add aliases of parent
      // 针对 parent 存在 alias 的情形，需要将 alias 数据包装成 route，以保证所有包含别名路径的子路由，也能正确访问，
      if (parent && parent.alias.length) {
        createRouteMap(
          // $flow-disable-line route is defined if parent is
          parent.alias.map(function (alias) { return ({ path: alias, children: [route] }); }),
          pathList,
          pathMap,
          nameMap,
          parent
        );
      }
    }
    
    // 返回一个数组，包含所有的 router record 对象
    function getRoutes () {
      return pathList.map(function (path) { return pathMap[path]; })
    }

    /**
     * 匹配 route
     * @param {*} raw 字符串形式的路径
     * @param {*} currentRoute 当前的 route 实例
     * @param {*} redirectedFrom 用于重定向的 redirectedFrom. 形式为: { 
                    name?: string
                    path?: string
                    hash?: string
                    query?: Dictionary<string | (string | null)[] | null | undefined>
                    params?: Dictionary<string>
                    append?: boolean
                    replace?: boolean
                }
     * @returns 
     */
    function match (
      raw,
      currentRoute,
      redirectedFrom
    ) {
      // 将 raw 和 currentRoute 分解成为 { path, name, query， params } 的形式。
      // 之所以用到 currentRoute, 是针对 raw 没有 path 和 name 时的原页面刷新，或者同一个动态路径页面跳转
      var location = normalizeLocation(raw, currentRoute, false, router);
      var name = location.name;
      // 如果 name, path 同时存在，则优先使用 name
      if (name) {
        var record = nameMap[name];
        {
          warn(record, ("Route with name '" + name + "' does not exist"));
        }
        // 如果 record 不存在, 则不存在路径。创建相关的 route
        if (!record) { return _createRoute(null, location) }

        // 获取 record 中所有需要动态匹配的 key。
        // 比如路径为： /:user/:name, 则 paramNames 为 ["user", "name"]
        var paramNames = record.regex.keys
          .filter(function (key) { return !key.optional; })
          .map(function (key) { return key.name; });

        if (typeof location.params !== 'object') {
          location.params = {};
        }

        // 通过将currentRoute的params复制给location.params，来汇总当前所有params
        if (currentRoute && typeof currentRoute.params === 'object') {
          // 遍历 current route 的 params
          for (var key in currentRoute.params) {
            if (!(key in location.params) && paramNames.indexOf(key) > -1) {
              location.params[key] = currentRoute.params[key];
            }
          }
        }
        // 根据location.params 替换record.path的动态路径
        location.path = fillParams(record.path, location.params, ("named route \"" + name + "\""));
        // 输出route对象
        return _createRoute(record, location, redirectedFrom)
      } else if (location.path) {
        location.params = {};
        for (var i = 0; i < pathList.length; i++) {
          // 获取 path 对应的 record 对象
          var path = pathList[i];
          var record$1 = pathMap[path];
          // 判断是否通过 path 是否能找到对应的 record。
          // 特别注意：location.params 经过 matchRoute()调用后，对于动态路由路径，会存储 url 上对应动态字段的数据。
          if (matchRoute(record$1.regex, location.path, location.params)) {
            return _createRoute(record$1, location, redirectedFrom)
          }
        }
      }
      // no match
      // 没有匹配到，直接返回空route对象
      return _createRoute(null, location)
    }

    /**
     * 创建一个重定向路径的路由。
     * @param {*} record 路由跳转路径匹配到的record
     * @param {*} location 需要重定向的信息。
     * @returns 
     */
    function redirect (
      record,
      location
    ) {

      var originalRedirect = record.redirect;

      //如果 record.redirect 设置的是一个函数，则调用该函数获取返回值。
      //如果是字符串或者对象，则不处理。
      var redirect = typeof originalRedirect === 'function'
        ? originalRedirect(createRoute(record, location, null, router))
        : originalRedirect;

      if (typeof redirect === 'string') {
        redirect = { path: redirect };
      }

      if (!redirect || typeof redirect !== 'object') {
        {
          warn(
            false, ("invalid redirect option: " + (JSON.stringify(redirect)))
          );
        }
        return _createRoute(null, location)
      }

      var re = redirect;
      var name = re.name;
      var path = re.path;
      var query = location.query;
      var hash = location.hash;
      var params = location.params;
      query = re.hasOwnProperty('query') ? re.query : query;
      hash = re.hasOwnProperty('hash') ? re.hash : hash;
      params = re.hasOwnProperty('params') ? re.params : params;

      if (name) {
        // resolved named direct
        var targetRecord = nameMap[name];
        {
          assert(targetRecord, ("redirect failed: named route \"" + name + "\" not found."));
        }
        // 将 redirect 的数据封装成一个新的 Location 对象，重新进行跳转匹配
        return match({
          _normalized: true,
          name: name,
          query: query,
          hash: hash,
          params: params
        }, undefined, location)

      } else if (path) {
        // 1. resolve relative redirect
        // 如果用户配置的 redirect 或者 redirect.path 是 “/” 开头，则直接返回。
        // 否则就会以 record.parent.path 作为基准路径。返回结果为一个 /xxx/xxx/xxx 路径。
        var rawPath = resolveRecordPath(path, record);
        // 2. resolve params
        // 补全动态参数
        var resolvedPath = fillParams(rawPath, params, ("redirect route with path \"" + rawPath + "\""));
        // 3. rematch with existing query and hash
        // 将 redirect 的数据封装成一个新的 Location 对象，重新进行跳转匹配
        return match({
          _normalized: true,
          path: resolvedPath,
          query: query,
          hash: hash
        }, undefined, location)
      } else {
        {
          warn(false, ("invalid redirect option: " + (JSON.stringify(redirect))));
        }
        return _createRoute(null, location)
      }
    }
    // 针对 route conifg 上配置有 alias 属性的处理
    function alias (
      record,
      location,
      matchAs
    ) {
      // 将别名路径中动态参数路径使用 params 中对应属性进行填充
      var aliasedPath = fillParams(matchAs, location.params, ("aliased route with path \"" + matchAs + "\""));
      // 根据别名路径查找一个 route 实例
      var aliasedMatch = match({
        _normalized: true,
        path: aliasedPath
      });
      // 如果 route 存在
      if (aliasedMatch) {
        // 获取当 aliasedMatch 这个路由的 matched 数组（元素是 record）
        var matched = aliasedMatch.matched;
        // 获取最后一个 record 对象
        var aliasedRecord = matched[matched.length - 1];
        // aliasedMatch.params 的数据是 url 上的动态字段对应的数据
        location.params = aliasedMatch.params;
        return _createRoute(aliasedRecord, location)
      }
      return _createRoute(null, location)
    }
    // 创建 route 对象
    function _createRoute (
      record,
      location,
      redirectedFrom
    ) {
      // 如果 record 存在，且 record 中配置有 redirect 属性。
      if (record && record.redirect) {
        // 根据 redirect 对应的record 来创建 route 对象
        return redirect(record, redirectedFrom || location)
      }
      // 如果 record.matchAs 存在，则找到 alias 路径找到对应的 record 对象
      if (record && record.matchAs) {
        return alias(record, location, record.matchAs)
      }
      // 此时 record 可能为 null
      return createRoute(record, location, redirectedFrom, router)
    }

    return {
      match: match,
      addRoute: addRoute,
      getRoutes: getRoutes,
      addRoutes: addRoutes
    }
  }

  // 判断 path 是否匹配 regex
  function matchRoute (
    regex,
    path,
    params
  ) {
    var m = path.match(regex);

    if (!m) {
      return false
    } else if (!params) {
      return true
    }
    // 如果匹配，则将 path 中对应动态路由参数的数据收集到 params 中。
    for (var i = 1, len = m.length; i < len; ++i) {
      var key = regex.keys[i - 1];
      if (key) {
        // Fix #1994: using * with props: true generates a param named 0
        params[key.name || 'pathMatch'] = typeof m[i] === 'string' ? decode(m[i]) : m[i];
      }
    }

    return true
  }

  function resolveRecordPath (path, record) {
    // 第三个操作表示要路径拼接
    return resolvePath(path, record.parent ? record.parent.path : '/', true)
  }

  /*  */

  // use User Timing api (if present) for more accurate key precision
  var Time =
    inBrowser && window.performance && window.performance.now
      ? window.performance
      : Date;

  function genStateKey () {
    return Time.now().toFixed(3)
  }

  var _key = genStateKey();

  function getStateKey () {
    return _key
  }

  function setStateKey (key) {
    return (_key = key)
  }

  /*  */

  var positionStore = Object.create(null);

  function setupScroll () {
    // Prevent browser scroll behavior on History popstate
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    // Fix for #1585 for Firefox
    // Fix for #2195 Add optional third attribute to workaround a bug in safari https://bugs.webkit.org/show_bug.cgi?id=182678
    // Fix for #2774 Support for apps loaded from Windows file shares not mapped to network drives: replaced location.origin with
    // window.location.protocol + '//' + window.location.host
    // location.host contains the port and location.hostname doesn't
    var protocolAndPath = window.location.protocol + '//' + window.location.host;
    var absolutePath = window.location.href.replace(protocolAndPath, '');
    // preserve existing history state as it could be overriden by the user
    var stateCopy = extend({}, window.history.state);
    stateCopy.key = getStateKey();
    window.history.replaceState(stateCopy, '', absolutePath);
    window.addEventListener('popstate', handlePopState);
    return function () {
      window.removeEventListener('popstate', handlePopState);
    }
  }

  function handleScroll (
    router,
    to,
    from,
    isPop
  ) {
    if (!router.app) {
      return
    }

    var behavior = router.options.scrollBehavior;
    if (!behavior) {
      return
    }

    {
      assert(typeof behavior === 'function', "scrollBehavior must be a function");
    }

    // wait until re-render finishes before scrolling
    router.app.$nextTick(function () {
      var position = getScrollPosition();
      var shouldScroll = behavior.call(
        router,
        to,
        from,
        isPop ? position : null
      );

      if (!shouldScroll) {
        return
      }

      if (typeof shouldScroll.then === 'function') {
        shouldScroll
          .then(function (shouldScroll) {
            scrollToPosition((shouldScroll), position);
          })
          .catch(function (err) {
            {
              assert(false, err.toString());
            }
          });
      } else {
        scrollToPosition(shouldScroll, position);
      }
    });
  }

  function saveScrollPosition () {
    var key = getStateKey();
    if (key) {
      positionStore[key] = {
        x: window.pageXOffset,
        y: window.pageYOffset
      };
    }
  }

  function handlePopState (e) {
    saveScrollPosition();
    if (e.state && e.state.key) {
      setStateKey(e.state.key);
    }
  }

  function getScrollPosition () {
    var key = getStateKey();
    if (key) {
      return positionStore[key]
    }
  }

  function getElementPosition (el, offset) {
    var docEl = document.documentElement;
    var docRect = docEl.getBoundingClientRect();
    var elRect = el.getBoundingClientRect();
    return {
      x: elRect.left - docRect.left - offset.x,
      y: elRect.top - docRect.top - offset.y
    }
  }

  function isValidPosition (obj) {
    return isNumber(obj.x) || isNumber(obj.y)
  }

  function normalizePosition (obj) {
    return {
      x: isNumber(obj.x) ? obj.x : window.pageXOffset,
      y: isNumber(obj.y) ? obj.y : window.pageYOffset
    }
  }

  function normalizeOffset (obj) {
    return {
      x: isNumber(obj.x) ? obj.x : 0,
      y: isNumber(obj.y) ? obj.y : 0
    }
  }

  function isNumber (v) {
    return typeof v === 'number'
  }

  var hashStartsWithNumberRE = /^#\d/;

  function scrollToPosition (shouldScroll, position) {
    var isObject = typeof shouldScroll === 'object';
    if (isObject && typeof shouldScroll.selector === 'string') {
      // getElementById would still fail if the selector contains a more complicated query like #main[data-attr]
      // but at the same time, it doesn't make much sense to select an element with an id and an extra selector
      var el = hashStartsWithNumberRE.test(shouldScroll.selector) // $flow-disable-line
        ? document.getElementById(shouldScroll.selector.slice(1)) // $flow-disable-line
        : document.querySelector(shouldScroll.selector);

      if (el) {
        var offset =
          shouldScroll.offset && typeof shouldScroll.offset === 'object'
            ? shouldScroll.offset
            : {};
        offset = normalizeOffset(offset);
        position = getElementPosition(el, offset);
      } else if (isValidPosition(shouldScroll)) {
        position = normalizePosition(shouldScroll);
      }
    } else if (isObject && isValidPosition(shouldScroll)) {
      position = normalizePosition(shouldScroll);
    }

    if (position) {
      // $flow-disable-line
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({
          left: position.x,
          top: position.y,
          // $flow-disable-line
          behavior: shouldScroll.behavior
        });
      } else {
        window.scrollTo(position.x, position.y);
      }
    }
  }

  /*  */

  // 判断浏览器是否支持 history 模式
  var supportsPushState =
    inBrowser &&
    (function () {
      var ua = window.navigator.userAgent;

      if (
        (ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) &&
        ua.indexOf('Mobile Safari') !== -1 &&
        ua.indexOf('Chrome') === -1 &&
        ua.indexOf('Windows Phone') === -1
      ) {
        return false
      }

      return window.history && typeof window.history.pushState === 'function'
    })();

  // push 方式跳转新路径，会在 history 中记录。
  function pushState (url, replace) {
    // 保存当前页面滚动位置
    saveScrollPosition();
    // try...catch the pushState call to get around Safari
    // DOM Exception 18 where it limits to 100 pushState calls
    var history = window.history;
    try {
      // 如果是重定向，使用 history 的 replace 方法
      if (replace) {
        // preserve existing history state as it could be overriden by the user
        // 保存之前 history 的 state
        var stateCopy = extend({}, history.state);

        stateCopy.key = getStateKey();
        history.replaceState(stateCopy, '', url);
      // 如果是跳转，使用 history 的 push 方法
      } else {
        history.pushState({ key: setStateKey(genStateKey()) }, '', url);
      }
    } catch (e) {
      // 如果抛出了异常，则表示栈已经到了最大值，不能push了。
      // 使用 location.assign 也可以用来跳转网址，且 assign 会添加记录到浏览历史，点击后退可以返回到之前页面。
      window.location[replace ? 'replace' : 'assign'](url);
    }
  }

  // replace 方式跳转新路径，不会在 history 中记录
  function replaceState (url) {
    pushState(url, true);
  }

  // When changing thing, also edit router.d.ts
  var NavigationFailureType = {
    redirected: 2,
    aborted: 4,
    cancelled: 8,
    duplicated: 16
  };

  function createNavigationRedirectedError (from, to) {
    return createRouterError(
      from,
      to,
      NavigationFailureType.redirected,
      ("Redirected when going from \"" + (from.fullPath) + "\" to \"" + (stringifyRoute(
        to
      )) + "\" via a navigation guard.")
    )
  }

  function createNavigationDuplicatedError (from, to) {
    var error = createRouterError(
      from,
      to,
      NavigationFailureType.duplicated,
      ("Avoided redundant navigation to current location: \"" + (from.fullPath) + "\".")
    );
    // backwards compatible with the first introduction of Errors
    error.name = 'NavigationDuplicated';
    return error
  }

  function createNavigationCancelledError (from, to) {
    return createRouterError(
      from,
      to,
      NavigationFailureType.cancelled,
      ("Navigation cancelled from \"" + (from.fullPath) + "\" to \"" + (to.fullPath) + "\" with a new navigation.")
    )
  }

  function createNavigationAbortedError (from, to) {
    return createRouterError(
      from,
      to,
      NavigationFailureType.aborted,
      ("Navigation aborted from \"" + (from.fullPath) + "\" to \"" + (to.fullPath) + "\" via a navigation guard.")
    )
  }

  function createRouterError (from, to, type, message) {
    var error = new Error(message);
    error._isRouter = true;
    error.from = from;
    error.to = to;
    error.type = type;

    return error
  }

  var propertiesToLog = ['params', 'query', 'hash'];

  function stringifyRoute (to) {
    if (typeof to === 'string') { return to }
    if ('path' in to) { return to.path }
    var location = {};
    propertiesToLog.forEach(function (key) {
      if (key in to) { location[key] = to[key]; }
    });
    return JSON.stringify(location, null, 2)
  }

  function isError (err) {
    return Object.prototype.toString.call(err).indexOf('Error') > -1
  }

  function isNavigationFailure (err, errorType) {
    return (
      isError(err) &&
      err._isRouter &&
      (errorType == null || err.type === errorType)
    )
  }

  /*  */

  function runQueue(queue, fn, cb) {
    // 定义一个递归函数 step，它接收一个 index 参数来指示当前执行的守卫索引
    var step = function (index) {
      // 如果 index 超出队列长度，说明所有守卫已执行完毕，调用回调函数 cb
      if (index >= queue.length) {
        cb();
      } else {
        // 如果 queue[index] 存在（即守卫存在）
        if (queue[index]) {
          // 调用传入的 fn 函数，并传递当前守卫（queue[index]）和一个回调函数
          // 这个回调函数作为参数传递给守卫函数，表示守卫函数执行完毕后的下一步操作
          fn(queue[index], function () {
            // 递归调用 step，继续执行下一个守卫
            step(index + 1);
          });
        } else {
          // 如果 queue[index] 不存在，直接执行下一个守卫
          step(index + 1);
        }
      }
    };

    // 从队列的第一个守卫开始执行
    step(0);
  }

  /*  */

  function resolveAsyncComponents (matched) {
    return function (to, from, next) {
      var hasAsync = false;
      var pending = 0;
      var error = null;

      // matched 可能包含多个RouteRecord
      // 每个RouteRecord可能有多个component的定义
      // flatMapComponents的价值就是要处理所有
      flatMapComponents(matched, function (def, _, match, key) {
        // if it's a function and doesn't have cid attached,
        // assume it's an async component resolve function.
        // we are not using Vue's default async resolving mechanism because
        // we want to halt the navigation until the incoming component has been
        // resolved.
        if (typeof def === 'function' && def.cid === undefined) {
          hasAsync = true;
          pending++;

          // 加载成功回调，once防止重复执行
          var resolve = once(function (resolvedDef) {
            // 如果是 ES 模块，模块的 default 属性才是组件的定义
            if (isESModule(resolvedDef)) {
              resolvedDef = resolvedDef.default;
            }
            // 规范化处理异步组件解析后的定义
            def.resolved = typeof resolvedDef === 'function'
              ? resolvedDef
              // 不是函数，说明是已经解析好的组件选项对象
              : _Vue.extend(resolvedDef);
            match.components[key] = resolvedDef;
            pending--;
            if (pending <= 0) {
              next();
            }
          });

          // 加载失败回调，once防止重复执行
          var reject = once(function (reason) {
            var msg = "Failed to resolve async component " + key + ": " + reason;
            warn(false, msg);
            if (!error) {
              error = isError(reason)
                ? reason
                : new Error(msg);
              next(error);
            }
          });

          var res;
          try {
            // 调用加载函数
            res = def(resolve, reject);
          } catch (e) {
            reject(e);
          }
          if (res) {
            if (typeof res.then === 'function') {
              res.then(resolve, reject);
            } else {
              // new syntax in Vue 2.3
              // Vue2.3 之后 允许异步组件使用一个 component 字段来定义异步组件的加载方式
              var comp = res.component;
              if (comp && typeof comp.then === 'function') {
                comp.then(resolve, reject);
              }
            }
          }
        }
      });

      if (!hasAsync) { next(); }
    }
  }

  /**
   * 将一个匹配的路由记录数组循环执行映射函数，输出扁平化的映射函数结果数组。
   * @param {Array<RouteRecord>} matched - 匹配的路由记录数组
   * @param {Function} fn - 映射函数，接收多个参数并返回一个函数
   * @returns {Array<?Function>} - 扁平化的函数数组
   */
  function flatMapComponents (
    matched,
    fn
  ) {
    // 使用 flatten 函数将映射后的组件数组扁平化
    return flatten(matched.map(function (m) {
      return Object.keys(m.components).map(function (key) { return fn(
        m.components[key],
        m.instances[key],
        m, key
      ); })
    }))
  }

  /**
   * 将一个嵌套的数组扁平化为一个一维数组。
   * @param {Array<any>} arr - 嵌套的数组
   * @returns {Array<any>} - 扁平化后的一维数组
   */
  function flatten (arr) {
    return Array.prototype.concat.apply([], arr)
  }

  var hasSymbol =
    typeof Symbol === 'function' &&
    typeof Symbol.toStringTag === 'symbol';

  function isESModule (obj) {
    return obj.__esModule || (hasSymbol && obj[Symbol.toStringTag] === 'Module')
  }

  // in Webpack 2, require.ensure now also returns a Promise
  // so the resolve/reject functions may get called an extra time
  // if the user uses an arrow function shorthand that happens to
  // return that Promise.
  function once (fn) {
    var called = false;
    return function () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      if (called) { return }
      called = true;
      return fn.apply(this, args)
    }
  }

  /*  */

  var History = function History (router, base) {
    this.router = router;
    // 格式化base
    this.base = normalizeBase(base);
    // start with a route object that stands for "nowhere"
    // 创建当前路由为初始路由
    this.current = START;
    // 即将导航到的目标路由信息
    this.pending = null;
    // 是否已经准备就绪
    this.ready = false;
    // 准备就绪的回调函数
    this.readyCbs = [];
    // 准备失败时的回调函数
    this.readyErrorCbs = [];
    // 出错时的回调函数
    this.errorCbs = [];
    // 监听路由变化的回调函数
    this.listeners = [];
  };

  History.prototype.listen = function listen (cb) {
    this.cb = cb;
  };

  History.prototype.onReady = function onReady (cb, errorCb) {
    if (this.ready) {
      cb();
    } else {
      this.readyCbs.push(cb);
      if (errorCb) {
        this.readyErrorCbs.push(errorCb);
      }
    }
  };

  History.prototype.onError = function onError (errorCb) {
    this.errorCbs.push(errorCb);
  };

  History.prototype.transitionTo = function transitionTo (
    location,
    onComplete,
    onAbort
  ) {
      var this$1$1 = this;

    var route;
    // catch redirect option https://github.com/vuejs/vue-router/issues/3201
    try {
      // 匹配路由
      route = this.router.match(location, this.current);
    } catch (e) {
      this.errorCbs.forEach(function (cb) {
        cb(e);
      });
      // Exception should still be thrown
      throw e
    }
    var prev = this.current;
    this.confirmTransition(
      route,
      function () {
        this$1$1.updateRoute(route);
        onComplete && onComplete(route);
        this$1$1.ensureURL();
        this$1$1.router.afterHooks.forEach(function (hook) {
          hook && hook(route, prev);
        });

        // 执行ready回调
        if (!this$1$1.ready) {
          this$1$1.ready = true;
          this$1$1.readyCbs.forEach(function (cb) {
            cb(route);
          });
        }
      },
      function (err) {
        if (onAbort) {
          onAbort(err);
        }
        if (err && !this$1$1.ready) {
          // Initial redirection should not mark the history as ready yet
          // because it's triggered by the redirection instead
          // https://github.com/vuejs/vue-router/issues/3225
          // https://github.com/vuejs/vue-router/issues/3331
          if (!isNavigationFailure(err, NavigationFailureType.redirected) || prev !== START) {
            this$1$1.ready = true;
            this$1$1.readyErrorCbs.forEach(function (cb) {
              cb(err);
            });
          }
        }
      }
    );
  };
  /**
   *
   * @param {*} route
   * @param {*} onComplete 完成回调
   * @param {*} onAbort 中止回调
   * @returns
   */
  History.prototype.confirmTransition = function confirmTransition (route, onComplete, onAbort) {
      var this$1$1 = this;

    var current = this.current;
    // 将目标路由设置为正在处理的路由
    this.pending = route;
    // 处理导航过程中的错误
    var abort = function (err) {
      // changed after adding errors with
      // https://github.com/vuejs/vue-router/pull/3047 before that change,
      // redirect and aborted navigation would produce an err == null
      if (!isNavigationFailure(err) && isError(err)) {
        if (this$1$1.errorCbs.length) {
          // 如果有错误回调函数，则执行错误回调
          this$1$1.errorCbs.forEach(function (cb) {
            cb(err);
          });
        } else {
          {
            warn(false, 'uncaught error during route navigation:');
          }
          console.error(err);
        }
      }
      onAbort && onAbort(err);
    };
    var lastRouteIndex = route.matched.length - 1;
    var lastCurrentIndex = current.matched.length - 1;
    // 检查当前路由是否与目标路由相同
    if (
      isSameRoute(route, current) &&
      // 处理由于动态添加路由导致的差异
      lastRouteIndex === lastCurrentIndex &&
      route.matched[lastRouteIndex] === current.matched[lastCurrentIndex]
    ) {
      // 相同路由导航，仅更新 URL 和哈希，然后中止导航并返回导航重复错误
      this.ensureURL();
      if (route.hash) {
        // 如果有hash，可能是锚点，跳转到对应位置
        handleScroll(this.router, current, route, false);
      }
      return abort(createNavigationDuplicatedError(current, route))
    }

    // 解析路由队列，确定要激活、更新和停用的组件
    var ref = resolveQueue(
      this.current.matched,
      route.matched
    );
      var updated = ref.updated;
      var deactivated = ref.deactivated;
      var activated = ref.activated;

    // 构建导航钩子队列
    var queue = [].concat(
      // 组件内离开守卫
      extractLeaveGuards(deactivated),
      // 全局前置守卫
      this.router.beforeHooks,
      // 组件内更新守卫
      extractUpdateHooks(updated),
      // 配置的路由进入守卫
      activated.map(function (m) { return m.beforeEnter; }),
      // 异步组件的解析钩子函数
      resolveAsyncComponents(activated)
    );

    // 定义迭代执行导航钩子的函数
    var iterator = function (hook, next) {
      // 如果导航已取消，直接返回导航中止错误
      if (this$1$1.pending !== route) {
        return abort(createNavigationCancelledError(current, route))
      }
      try {
        // 执行导航守卫函数，并传入回调函数 next
        hook(route, current, function (to) {
          if (to === false) {
            // next(false) -> 中止导航并还原当前 URL
            this$1$1.ensureURL(true);
            abort(createNavigationAbortedError(current, route));
          } else if (isError(to)) {
            // next(err) -> 处理错误并还原当前 URL
            this$1$1.ensureURL(true);
            abort(to);
          } else if (
            typeof to === 'string' ||
            (typeof to === 'object' &&
              (typeof to.path === 'string' || typeof to.name === 'string'))
          ) {
            // next('/') 或 next({ path: '/' }) -> 重定向
            abort(createNavigationRedirectedError(current, route));
            if (typeof to === 'object' && to.replace) {
              // 如果重定向的是 replace 类型，则使用 replace 方法
              this$1$1.replace(to);
            } else {
              // 否则，使用 push 方法进行导航
              this$1$1.push(to);
            }
          } else {
            // 确认导航，继续执行下一个导航守卫
            next(to);
          }
        });
      } catch (e) {
        // 捕获导航守卫执行过程中的错误
        abort(e);
      }
    };

    // 执行导航钩子队列
    runQueue(queue, iterator, function () {
      // 等待异步组件解析完成后，提取组件内进入守卫
      var enterGuards = extractEnterGuards(activated);
      var queue = enterGuards.concat(this$1$1.router.resolveHooks);
      runQueue(queue, iterator, function () {
        // 如果导航已取消，返回导航中止错误
        if (this$1$1.pending !== route) {
          return abort(createNavigationCancelledError(current, route))
        }
        // 导航过程结束，清空 pending 标记，并执行导航完成回调
        this$1$1.pending = null;
        onComplete(route);
        // 在 Vue 的下一个更新周期执行路由进入后的处理
        if (this$1$1.router.app) {
          this$1$1.router.app.$nextTick(function () {
            handleRouteEntered(route);
          });
        }
      });
    });
  };

  History.prototype.updateRoute = function updateRoute (route) {
    this.current = route;
    this.cb && this.cb(route);
  };

  History.prototype.setupListeners = function setupListeners () {
    // Default implementation is empty
  };

  History.prototype.teardown = function teardown () {
    // clean up event listeners
    // https://github.com/vuejs/vue-router/issues/2341
    this.listeners.forEach(function (cleanupListener) {
      cleanupListener();
    });
    this.listeners = [];

    // reset current history route
    // https://github.com/vuejs/vue-router/issues/3294
    this.current = START;
    this.pending = null;
  };

  // 格式化base
  function normalizeBase (base) {
    if (!base) {
      if (inBrowser) {
        //  <base> 规定页面上所有链接的默认 URL 和默认目标
        var baseEl = document.querySelector('base');
        base = (baseEl && baseEl.getAttribute('href')) || '/';
        // strip full URL origin
        // 去除URL origin
        base = base.replace(/^https?:\/\/[^\/]+/, '');
      } else {
        base = '/';
      }
    }
    // 确保base 开头是/
    if (base.charAt(0) !== '/') {
      base = '/' + base;
    }
    // 删除尾部/
    return base.replace(/\/$/, '')
  }

  function resolveQueue (
    current,
    next
  ) {
    var i;
    var max = Math.max(current.length, next.length);
    for (i = 0; i < max; i++) {
      if (current[i] !== next[i]) {
        break
      }
    }
    return {
      updated: next.slice(0, i),
      activated: next.slice(i),
      deactivated: current.slice(i)
    }
  }

  /**
   * 从路由记录数组中提取指定类型的路由守卫，并将它们绑定到实例上。
   * @param {Array<RouteRecord>} records - 路由记录数组
   * @param {string} name - 守卫的类型名称
   * @param {Function} bind - 绑定函数，用于将守卫绑定到实例上
   * @param {boolean} [reverse] - 是否逆序处理守卫
   * @returns {Array<?Function>} - 绑定后的路由守卫数组
   */
  function extractGuards (
    records,
    name,
    bind,
    reverse
  ) {
    // 使用 flatMapComponents 函数提取组件中的守卫，并将它们绑定到实例上
    var guards = flatMapComponents(records, function (def, instance, match, key) {
      // 从组件定义中提取指定类型的守卫
      var guard = extractGuard(def, name);
      if (guard) {
        return Array.isArray(guard)
          // 如果守卫是数组，将每个守卫都绑定到实例上
          ? guard.map(function (guard) { return bind(guard, instance, match, key); })
          // 如果守卫是单个函数，将它绑定到实例上
          : bind(guard, instance, match, key)
      }
    });
    // 根据 reverse 参数决定是否逆序处理守卫数组
    return flatten(reverse ? guards.reverse() : guards)
  }
  /**
   * 从组件定义中提取指定键的导航守卫。
   * @param {Object|Function} def - 组件定义对象或构造函数
   * @param {string} key - 要提取的守卫的键
   * @returns {NavigationGuard|Array<NavigationGuard>} - 提取的导航守卫
   */
  function extractGuard (
    def,
    key
  ) {
    // 如果 def 不是函数，将其转换为 Vue 组件构造函数
    if (typeof def !== 'function') {
      // 现在进行扩展，以便全局 mixins 能够生效
      def = _Vue.extend(def);
    }
    // 从组件选项中获取指定键的导航守卫
    return def.options[key]
  }

  function extractLeaveGuards (deactivated) {
    return extractGuards(deactivated, 'beforeRouteLeave', bindGuard, true)
  }

  function extractUpdateHooks (updated) {
    return extractGuards(updated, 'beforeRouteUpdate', bindGuard)
  }

  /**
   * 将导航守卫绑定到特定实例上。
   * @param {NavigationGuard} guard - 要绑定的导航守卫
   * @param {_Vue} instance - 要绑定到的实例
   * @returns {?NavigationGuard} - 绑定后的导航守卫，如果没有传入实例则返回 null
   */
  function bindGuard (guard, instance) {
    if (instance) {
      // 返回一个新的函数，该函数在调用时将 guard 应用在实例上
      return function boundRouteGuard () {
        return guard.apply(instance, arguments)
      }
    }
  }

  function extractEnterGuards (
    activated
  ) {
    // 从路由记录数组中提取 beforeRouteEnter 路由守卫，并将它们绑定到实例上。
    return extractGuards(
      activated,
      'beforeRouteEnter',
      function (guard, _, match, key) {
        return bindEnterGuard(guard, match, key)
      }
    )
  }

  function bindEnterGuard (
    guard,
    match,
    key
  ) {
    return function routeEnterGuard (to, from, next) {
      return guard(to, from, function (cb) {
        if (typeof cb === 'function') {
          if (!match.enteredCbs[key]) {
            match.enteredCbs[key] = [];
          }
          match.enteredCbs[key].push(cb);
        }
        next(cb);
      })
    }
  }

  /*  */

  var HTML5History = /*@__PURE__*/(function (History) {
    function HTML5History (router, base) {
      History.call(this, router, base);
      // 拼接完整的初始地址
      this._startLocation = getLocation(this.base);
    }

    if ( History ) HTML5History.__proto__ = History;
    HTML5History.prototype = Object.create( History && History.prototype );
    HTML5History.prototype.constructor = HTML5History;

    // 设置路由监听器，用于处理浏览器地址变化事件
    HTML5History.prototype.setupListeners = function setupListeners () {
      var this$1$1 = this;

      // 检查是否已设置监听器，避免重复设置
      if (this.listeners.length > 0) {
        return
      }
      // 当前 Vue Router 实例
      var router = this.router;
      // 期望的滚动行为
      var expectScroll = router.options.scrollBehavior;
      // 是否支持滚动行为
      var supportsScroll = supportsPushState && expectScroll;

      // 添加滚动行为的监听器，如果支持滚动行为
      if (supportsScroll) {
        this.listeners.push(setupScroll());
      }

      // 定义处理路由变化事件的回调函数
      var handleRoutingEvent = function () {
        var current = this$1$1.current;

        // Avoiding first `popstate` event dispatched in some browsers but first
        // history route not updated since async guard at the same time.
        // 获取当前地址信息
        var location = getLocation(this$1$1.base);

        // 避免处理浏览器首次 `popstate` 事件时，路由状态尚未更新
        if (this$1$1.current === START && location === this$1$1._startLocation) {
          return
        }

        // 进行路由转换
        this$1$1.transitionTo(location, function (route) {
          // 如果支持滚动行为，则处理滚动
          if (supportsScroll) {
            handleScroll(router, route, current, true);
          }
        });
      };

      // 添加 `popstate` 事件监听器，并将其添加到 listeners 数组中
      window.addEventListener('popstate', handleRoutingEvent);
      this.listeners.push(function () {
        window.removeEventListener('popstate', handleRoutingEvent);
      });
    };

    HTML5History.prototype.go = function go (n) {
      window.history.go(n);
    };

    HTML5History.prototype.push = function push (location, onComplete, onAbort) {
      var this$1$1 = this;

      var ref = this;
      var fromRoute = ref.current;
      this.transitionTo(location, function (route) {
        // 添加新路由地址到浏览器历史中
        pushState(cleanPath(this$1$1.base + route.fullPath));
        // 处理滚动相关
        handleScroll(this$1$1.router, route, fromRoute, false);
        // 执行成功回调
        onComplete && onComplete(route);
      }, onAbort);
    };

    HTML5History.prototype.replace = function replace (location, onComplete, onAbort) {
      var this$1$1 = this;

      var ref = this;
      var fromRoute = ref.current;
      this.transitionTo(location, function (route) {
        // 新的路由地址直接替换当前的浏览器历史记录
        replaceState(cleanPath(this$1$1.base + route.fullPath));
        // 处理滚动相关
        handleScroll(this$1$1.router, route, fromRoute, false);
        // 执行成功回调
        onComplete && onComplete(route);
      }, onAbort);
    };

    HTML5History.prototype.ensureURL = function ensureURL (push) {
      if (getLocation(this.base) !== this.current.fullPath) {
        var current = cleanPath(this.base + this.current.fullPath);
        push ? pushState(current) : replaceState(current);
      }
    };

    HTML5History.prototype.getCurrentLocation = function getCurrentLocation () {
      return getLocation(this.base)
    };

    return HTML5History;
  }(History));

  // 拼接完整路径
  function getLocation (base) {
    var path = window.location.pathname;
    var pathLowerCase = path.toLowerCase();
    var baseLowerCase = base.toLowerCase();
    // base="/a" shouldn't turn path="/app" into "/a/pp"
    // https://github.com/vuejs/vue-router/issues/3555
    // so we ensure the trailing slash in the base
    // 把path中的base去除
    if (base && ((pathLowerCase === baseLowerCase) ||
      (pathLowerCase.indexOf(cleanPath(baseLowerCase + '/')) === 0))) {
      path = path.slice(base.length);
    }
    return (path || '/') + window.location.search + window.location.hash
  }

  /*  */

  var HashHistory = /*@__PURE__*/(function (History) {
    function HashHistory (router, base, fallback) {
      History.call(this, router, base);
      // 如果是降级来的，则重新生成降级的路径
      // 如 base 为 /user 当前路径为/user/admin 则重新生成路径为/user#/admin
      if (fallback && checkFallback(this.base)) {
        return
      }
      // 如果hash开头是/，则代表是hash模式的路由
      // 如果不是，则需要切换成hash模式的路由
      ensureSlash();
    }

    if ( History ) HashHistory.__proto__ = History;
    HashHistory.prototype = Object.create( History && History.prototype );
    HashHistory.prototype.constructor = HashHistory;

    // this is delayed until the app mounts
    // to avoid the hashchange listener being fired too early
    HashHistory.prototype.setupListeners = function setupListeners () {
      var this$1$1 = this;

      // 检查是否已设置监听器，避免重复设置
      if (this.listeners.length > 0) {
        return
      }

      // 当前 Vue Router 实例
      var router = this.router;
      // 期望的滚动行为
      var expectScroll = router.options.scrollBehavior;
      // 是否支持滚动行为
      var supportsScroll = supportsPushState && expectScroll;

      // 添加滚动行为的监听器，如果支持滚动行为
      if (supportsScroll) {
        this.listeners.push(setupScroll());
      }

      var handleRoutingEvent = function () {
        // 获取当前地址信息
        var current = this$1$1.current;
        // 如果当前路径不符合hash模式，则直接进行替换并取消后续操作
        if (!ensureSlash()) {
          return
        }

        // 进行路由转换
        this$1$1.transitionTo(getHash(), function (route) {
          // 如果支持滚动行为，则处理滚动
          if (supportsScroll) {
            handleScroll(this$1$1.router, route, current, true);
          }
          // 不支持history，则使用location.replace跳转
          if (!supportsPushState) {
            replaceHash(route.fullPath);
          }
        });
      };
      // 支持history，使用history相关方法跳转，用popstate监听
      // 不支持history，使用location.replace跳转，用hashchange监听
      var eventType = supportsPushState ? 'popstate' : 'hashchange';
      window.addEventListener(
        eventType,
        handleRoutingEvent
      );
      this.listeners.push(function () {
        window.removeEventListener(eventType, handleRoutingEvent);
      });
    };

    HashHistory.prototype.push = function push (location, onComplete, onAbort) {
      var this$1$1 = this;

      var ref = this;
      var fromRoute = ref.current;
      this.transitionTo(
        location,
        function (route) {
          // 添加新路由地址到浏览器历史中
          pushHash(route.fullPath);
          // 处理滚动相关
          handleScroll(this$1$1.router, route, fromRoute, false);
          // 执行成功回调
          onComplete && onComplete(route);
        },
        onAbort
      );
    };

    HashHistory.prototype.replace = function replace (location, onComplete, onAbort) {
      var this$1$1 = this;

      var ref = this;
      var fromRoute = ref.current;
      this.transitionTo(
        location,
        function (route) {
          // 新的路由地址直接替换当前的浏览器历史记录
          replaceHash(route.fullPath);
          // 处理滚动相关
          handleScroll(this$1$1.router, route, fromRoute, false);
          // 执行成功回调
          onComplete && onComplete(route);
        },
        onAbort
      );
    };

    HashHistory.prototype.go = function go (n) {
      window.history.go(n);
    };

    HashHistory.prototype.ensureURL = function ensureURL (push) {
      var current = this.current.fullPath;
      if (getHash() !== current) {
        push ? pushHash(current) : replaceHash(current);
      }
    };

    HashHistory.prototype.getCurrentLocation = function getCurrentLocation () {
      return getHash()
    };

    return HashHistory;
  }(History));

  function checkFallback (base) {
    var location = getLocation(base);
    // 如果当前地址中没有hash，则将base之后的地址都放入#后面作为路径
    if (!/^\/#/.test(location)) {
      window.location.replace(cleanPath(base + '/#' + location));
      return true
    }
  }

  function ensureSlash () {
    var path = getHash();
    if (path.charAt(0) === '/') {
      return true
    }
    // 切换到hash模式的路由
    replaceHash('/' + path);
    return false
  }

  // 切割hash
  function getHash () {
    // We can't use window.location.hash here because it's not
    // consistent across browsers - Firefox will pre-decode it!
    var href = window.location.href;
    var index = href.indexOf('#');
    // empty path
    if (index < 0) { return '' }

    href = href.slice(index + 1);

    return href
  }

  function getUrl (path) {
    var href = window.location.href;
    var i = href.indexOf('#');
    var base = i >= 0 ? href.slice(0, i) : href;
    return (base + "#" + path)
  }

  function pushHash (path) {
    // 如果环境支持history，则使用pushState跳转
    if (supportsPushState) {
      pushState(getUrl(path));
    } else {
      // 直接修改hash
      window.location.hash = path;
    }
  }

  function replaceHash (path) {
    // 如果环境支持history，则使用replaceState跳转
    if (supportsPushState) {
      replaceState(getUrl(path));
    } else {
      // 不支持直接走replace方法
      window.location.replace(getUrl(path));
    }
  }

  /*  */

  var AbstractHistory = /*@__PURE__*/(function (History) {
    function AbstractHistory (router, base) {
      History.call(this, router, base);
      // 路由的历史记录
      this.stack = [];
      // 当前路由的索引
      this.index = -1;
    }

    if ( History ) AbstractHistory.__proto__ = History;
    AbstractHistory.prototype = Object.create( History && History.prototype );
    AbstractHistory.prototype.constructor = AbstractHistory;

    AbstractHistory.prototype.push = function push (location, onComplete, onAbort) {
      var this$1$1 = this;

      this.transitionTo(
        location,
        function (route) {
          // 舍去当前索引之后的历史记录，将新路由添加到栈顶
          this$1$1.stack = this$1$1.stack.slice(0, this$1$1.index + 1).concat(route);
          // 更新索引
          this$1$1.index++;
          onComplete && onComplete(route);
        },
        onAbort
      );
    };

    AbstractHistory.prototype.replace = function replace (location, onComplete, onAbort) {
      var this$1$1 = this;

      this.transitionTo(
        location,
        function (route) {
          // 用新的记录替换当前记录，并舍去后续历史记录
          this$1$1.stack = this$1$1.stack.slice(0, this$1$1.index).concat(route);
          onComplete && onComplete(route);
        },
        onAbort
      );
    };

    AbstractHistory.prototype.go = function go (n) {
      var this$1$1 = this;

      var targetIndex = this.index + n;
      // 目标索引超出范围，不予处理
      if (targetIndex < 0 || targetIndex >= this.stack.length) {
        return
      }
      // 获取指向路由
      var route = this.stack[targetIndex];
      // 跳转
      this.confirmTransition(
        route,
        function () {
          var prev = this$1$1.current;
          this$1$1.index = targetIndex;
          this$1$1.updateRoute(route);
          // 触发跳转成功回调
          this$1$1.router.afterHooks.forEach(function (hook) {
            hook && hook(route, prev);
          });
        },
        function (err) {
          if (isNavigationFailure(err, NavigationFailureType.duplicated)) {
            this$1$1.index = targetIndex;
          }
        }
      );
    };

    // 获取当前路由
    AbstractHistory.prototype.getCurrentLocation = function getCurrentLocation () {
      var current = this.stack[this.stack.length - 1];
      return current ? current.fullPath : '/'
    };

    AbstractHistory.prototype.ensureURL = function ensureURL () {
      // noop
    };

    return AbstractHistory;
  }(History));

  /*  */



  var VueRouter = function VueRouter (options) {
    if ( options === void 0 ) options = {};

    {
      warn(this instanceof VueRouter, "Router must be called with the new operator.");
    }
    // 用于记录第一个 vue 实例。也就是所有的 vue 实例的祖先
    this.app = null;
    // 用于记录所有的 vue 实例
    this.apps = [];
    // new VueRouter( options ) 的 options 参数
    this.options = options;
    // 用于记录路由跳转前的钩子函数。这里面的钩子函数能拦截和改变路由跳转
    this.beforeHooks = [];
    // 以用 router.beforeResolve 注册一个全局守卫。这和 router.beforeEach 类似，因为它在每次导航时都会触发，
    // 但是确保在导航被确认之前，同时在所有组件内守卫和异步路由组件被解析之后，解析守卫就被正确调用。
    this.resolveHooks = [];
    // 用于记录路由跳转后的钩子函数。不能拦截路由跳转
    this.afterHooks = [];
    /*
      createMatcher() 会通过这个函数将 route config 数据转化为 record.
      matcher 对象：{
        match,   //函数
        addRoute,//函数 
        getRoutes, //函数
        addRoutes, //函数
      }
    */
    this.matcher = createMatcher(options.routes || [], this);
    /**
     * 以下代码就是处理 options.mode：
     * 1、根据当前运行环境，以及浏览器的型号版本来决定最终的 mode 值。
     *  如果不支持 html5 history, 就会降级为 hash 模式。
     *  如果不是浏览器环境，则会改为 abstract 模式。
     *
     * 2、根据 mode 创建对应的浏览历史history对象。
     *  this.$router.history = history;
     */
    // 默认使用hash模式
    var mode = options.mode || 'hash';
    // fallback 表示降级。
    // 如果当前环境不支持 html5 的 history 模式。那么就会退成为 hash 模式。
    this.fallback =
      mode === 'history' && !supportsPushState && options.fallback !== false;
    if (this.fallback) {
      mode = 'hash';
    }
    // 非浏览器使用abstract模式
    if (!inBrowser) {
      mode = 'abstract';
    }
    this.mode = mode;
    // options.base 为 location.pathname 基准地址
    switch (mode) {
      case 'history':
        this.history = new HTML5History(this, options.base);
        break
      case 'hash':
        this.history = new HashHistory(this, options.base, this.fallback);
        break
      case 'abstract':
        this.history = new AbstractHistory(this, options.base);
        break
      default:
        {
          assert(false, ("invalid mode: " + mode));
        }
    }
  };

  var prototypeAccessors = { currentRoute: { configurable: true } };

  /**
  * 根据 raw 来匹配 route config，从而生成一个新的 route 对象
  * @param {RawLocation} raw 字符串形式的路径
  * @param {Route} current 当前的 route 实例
  * @param {Location} redirectedFrom 用于重定向的 redirectedFrom. 形式为: {path:xxx, name:xxx, query: {}, params: {} }
  * @returns 
  */
  VueRouter.prototype.match = function match (raw, current, redirectedFrom) {
    return this.matcher.match(raw, current, redirectedFrom)
  };

  /*
   * 获取当前的 route 对象。 相当于在 vue 页面的 this.$route
   */
  prototypeAccessors.currentRoute.get = function () {
    return this.history && this.history.current
  };

  /*
    init()； 
    (1) 可以理解为每次 vue 实例创建时，对于 vue-router 的初始化。
    (2) 以及当第一个 vue 实例创建之后, 开始导航初始化工作。

    这个方法是在当 vue 实例被创建时，被 VueRouter.install() 中混入的 beforeCreate() 方法中执行的。第一个参数 app，表示当前正在创建的 vue 实例。
  */
  VueRouter.prototype.init = function init (app /* Vue component instance */) {
      var this$1$1 = this;

    // 如果不是生产环境，判断 install.installed 是否已经有标记。表明 Vue.use(VueRouter) 是否执行过。
    assert(
        install.installed,
        "not installed. Make sure to call `Vue.use(VueRouter)` " +
          "before creating root instance."
      );
    // 将当前实例app存到实例列表中
    this.apps.push(app);

    // set up app destroyed handler
    // https://github.com/vuejs/vue-router/issues/2639
    // 增加 vue 的 destroyed 钩子函数
    app.$once('hook:destroyed', function () {
      // clean out app from this.apps array once destroyed
      // 查找实例列表中是否存在此实例
      var index = this$1$1.apps.indexOf(app);
      // 如果当前实例被记录到了 this.$router.apps 中, 就将其移除
      if (index > -1) { this$1$1.apps.splice(index, 1); }
      // ensure we still have a main app or null if no apps
      // we do not release the router so it can be reused
      // 如果 this.app === app 表明在删除最后一个 vue 实例
      if (this$1$1.app === app) { this$1$1.app = this$1$1.apps[0] || null; }
      // 如果 this.app 为 null，则表示所有 vue 实例都已经被销毁。所以需要销毁 history
      if (!this$1$1.app) { this$1$1.history.teardown(); }
    });

    // main app previously initialized
    // return as we don't need to set up new history listener
    // 如果 this.app 有值，则直接返回。则 this.app 代表记录根 vue 实例
    if (this.app) {
      return
    }
    // 如果 this.app 不存在，则指向 app 实例
    this.app = app;
    // 获取 this.$router mode 对应的 history 对象
    var history = this.history;
    // 如果是浏览器的 history 或 hash 模式
    if (history instanceof HTML5History || history instanceof HashHistory) {
      // 操作初始化滚动 
      // routeOrError 表示要跳转的 route
      var handleInitialScroll = function (routeOrError) {
        // 表示即将要跳出的 route
        var from = history.current;
        // 期望滚动的函数
        var expectScroll = this$1$1.options.scrollBehavior;
        // 如果mode=history，且当前浏览器支持 h5 history， 则表示支持期望滚动函数
        var supportsScroll = supportsPushState && expectScroll;
        // routeOrError 存在 fullPath 属性， 且 supportsScroll 函数存在
        if (supportsScroll && 'fullPath' in routeOrError) {
          handleScroll(this$1$1, routeOrError, from, false);
        }
      };
      // 如果跳转成功，则传递的参数为 route
      // 如果跳转失败，则传递的参数为 error
      var setupListeners = function (routeOrError) {
        history.setupListeners();
        handleInitialScroll(routeOrError);
      };
      /**
       * 此次的跳转是针对浏览器地址栏上的 url 进行跳转。
       * 地址栏可能是根路径: http://localhost:8080/；也可能是某个网页的路径 http://localhost:8080/user/info;
       */
      history.transitionTo(
        // 获取浏览器地址栏上的 url。
        // history.getCurrentLocation()： 返回的是访问地址字符串
        history.getCurrentLocation(),
        // 路径跳转成功的回调
        setupListeners,
        // 路径跳转失败的回调
        setupListeners
      );
    }

    // 在路由变化时，将新的路由对象同步到所有 Vue 实例中，从而触发 Vue 的重新渲染，展示新的页面内容
    history.listen(function (route) {
      this$1$1.apps.forEach(function (app) {
        app._route = route;
      });
    });
  };
  // 注册全局前置守卫
  VueRouter.prototype.beforeEach = function beforeEach (fn) {
    return registerHook(this.beforeHooks, fn)
  };
  // 注册全局解析钩子
  VueRouter.prototype.beforeResolve = function beforeResolve (fn) {
    return registerHook(this.resolveHooks, fn)
  };
  // 注册全局后置钩子
  VueRouter.prototype.afterEach = function afterEach (fn) {
    return registerHook(this.afterHooks, fn)
  };
  // 注册路由初始化完成时的回调通知 
  VueRouter.prototype.onReady = function onReady (cb, errorCb) {
    this.history.onReady(cb, errorCb);
  };
    
  // 注册路由报错时的回调通知 
  VueRouter.prototype.onError = function onError (errorCb) {
    this.history.onError(errorCb);
  };
  // 跳转到新的页面
  VueRouter.prototype.push = function push (location, onComplete, onAbort) {
      var this$1$1 = this;

    // $flow-disable-line
    if (!onComplete && !onAbort && typeof Promise !== 'undefined') {
      return new Promise(function (resolve, reject) {
        this$1$1.history.push(location, resolve, reject);
      })
    } else {
      this.history.push(location, onComplete, onAbort);
    }
  };
  // 重定向到新的页面。replace 会替换掉当前页面所在的浏览器历史记录
  VueRouter.prototype.replace = function replace (location, onComplete, onAbort) {
      var this$1$1 = this;

    // $flow-disable-line
    if (!onComplete && !onAbort && typeof Promise !== 'undefined') {
      return new Promise(function (resolve, reject) {
        this$1$1.history.replace(location, resolve, reject);
      })
    } else {
      this.history.replace(location, onComplete, onAbort);
    }
  };
  // 具体规则参考 html5 history 的 go() 函数。
  VueRouter.prototype.go = function go (n) {
    this.history.go(n);
  };
  // 回退到上一页。
  VueRouter.prototype.back = function back () {
    this.go(-1);
  };
  // 历史记录前进一页
  VueRouter.prototype.forward = function forward () {
    this.go(1);
  };
  // 获取匹配到的组件数组
  VueRouter.prototype.getMatchedComponents = function getMatchedComponents (to) {
    var route = to
      ? to.matched
        ? to
        // 根据 to 的路径参数，创建一个新的 route 对象
        : this.resolve(to).route
      : this.currentRoute;
    /**
     * 上述代码等同于
     *let route;
     *if(to){
     * router = to.matched ? to : this.resolve(to).route
     *} else {
     * router = this.currentRoute
     *}
     */
    // 如果 route 不存在，则返回空数组
    if (!route) {
      return []
    }
    // 如果 route 存在，则返回 route 对应的 record 数组中的每一个 component。
    return [].concat.apply(
      [],
      route.matched.map(function (m) {
        /**
         * 我们配置 compnents 有几种形式：
         * 形式1:component: User
         * 形式2:component: import("xxxxxx")
         * 形式3:components: { default: import("xxxx") }
         * 形式4:components: { default: import("xxxx"), a: xxx, b:xxx }
         * 所以通过 map() 来拷贝每个 route config 中的 components 属性对象。
         */
        return Object.keys(m.components).map(function (key) {
          return m.components[key]
        })
      })
    )
  };
  // 解析给定的路由路径并返回相应的路由对象
  VueRouter.prototype.resolve = function resolve (
    to,
    current,
    append
  ) {
    // 如果 current 这个 route 不存在，则获取当前的路由 route 对象
    current = current || this.history.current;
    // 将 to 对象转成标准的 { path:xxx, name:xxx, query:xxx, params:xxx } 的形式。
    var location = normalizeLocation(to, current, append, this);
    // 根据路径匹配相关配置，然后创建一个新的 route 对象
    var route = this.match(location, current);
    // 获取全路径（这个路径是替换完了动态参数的路径。）
    var fullPath = route.redirectedFrom || route.fullPath;
    // 获取路由的基准路径
    var base = this.history.base;
    // 完整的 url
    var href = createHref(base, fullPath, this.mode);
    return {
      location: location,
      route: route,
      href: href,
      // for backwards compat
      normalizedTo: location,
      resolved: route
    }
  };
  // 返回用户所有的路由配置信息
  VueRouter.prototype.getRoutes = function getRoutes () {
    return this.matcher.getRoutes()
  };

  /**
  * 动态增加路由
  * @param {string | RouteConfig} parentOrRoute parentOrRoute，可以是父路由的 name 值； 也可以是要新添加的路由数据对象
  * @param {RouteConfig} route 要新添加的路由数据对象
  */
  VueRouter.prototype.addRoute = function addRoute (parentOrRoute, route) {
    // 将 route config 数据转换成为 record 对象，然后被添加到 parent record 中
    this.matcher.addRoute(parentOrRoute, route);
    // 如果当前路由状态不是初始状态
    if (this.history.current !== START) {
      // 切换到当前路由
      this.history.transitionTo(this.history.getCurrentLocation());
    }
  };
  // 批量增加路由
  VueRouter.prototype.addRoutes = function addRoutes (routes) {
    {
      warn(false, 'router.addRoutes() is deprecated and has been removed in Vue Router 4. Use router.addRoute() instead.');
    }
    this.matcher.addRoutes(routes);
    if (this.history.current !== START) {
      this.history.transitionTo(this.history.getCurrentLocation());
    }
  };

  Object.defineProperties( VueRouter.prototype, prototypeAccessors );

  var VueRouter$1 = VueRouter;
  // 将钩子函数添加到对应的消息队列，返回一个销毁方法
  function registerHook (list, fn) {
    list.push(fn);
    return function () {
      var i = list.indexOf(fn);
      if (i > -1) { list.splice(i, 1); }
    }
  }


  /**
   * 创建一个 href 跳转路径
   * @param {string} base  base 基础路径
   * @param {string} fullPath 完整路径
   * @param {string} mode 路由模式
   * @returns 完整的路由地址
   */
  function createHref (base, fullPath, mode) {
    // 如果是hash模式，那么 fullPath 是指 hash 地址。
    // 如果是history模式，那么 fullPath 就是 location.pathname 部分。
    var path = mode === 'hash' ? '#' + fullPath : fullPath;
    // 拼接完整路径
    return base ? cleanPath(base + '/' + path) : path
  }

  // We cannot remove this as it would be a breaking change
  VueRouter.install = install;
  VueRouter.version = '3.6.5';
  VueRouter.isNavigationFailure = isNavigationFailure;
  VueRouter.NavigationFailureType = NavigationFailureType;
  VueRouter.START_LOCATION = START;

  // -- 我们使用 spa 应用， Vue 是没有挂到 window 上的。
  // 如果在浏览器中，且将 Vue 挂在到了 window 上。
  if (inBrowser && window.Vue) {
    // 走 vueRouter 的 install 流程
    window.Vue.use(VueRouter);
  }

  return VueRouter$1;

}));
//# sourceMappingURL=vue-router.js.map
