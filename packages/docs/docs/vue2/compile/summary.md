# 总结

至此，模板编译的三大阶段都已经完成了，我们一起从宏观的角度来分析模板编译的整体流程是怎么样的。

首先，我们需要明白，模板编译就是将用户编写的模板通过一系列处理最终生成供Vue实例在挂载时可调用的`render`函数的过程。

简单来说，我写了一个模板字符串，经过模板编译后，输出了`render`函数。

## 整体流程

刚刚说过，模板编译就是将用户编写的模板通过一系列处理最终生成供Vue实例在挂载时可调用的`render`函数的过程。所以我们从Vue实例挂载时开始分析。

我们都知道，Vue实例挂载时会调用`$mount`方法（生命周期部分会详细分析），那么首先看`$mount`方法，简化如下：

```js
// 缓存runtime 版本的$mount
const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && query(el)

  const options = this.$options
  // 如果没有渲染函数时，将template/el编译成渲染函数
  if (!options.render) {
    let template = options.template
    if (template) {
      if (typeof template === 'string') {
        // 如果是#开头，通过选择符获取innerHTML使用
        // 如果是字符串不是#号开头，则是用户手动设置的模板，直接使用
        if (template.charAt(0) === '#') {
          // 使用选择符获取模板
          template = idToTemplate(template)
        }
      // 使用nodeType判断是否为一个真实的dom元素，如果是则使用DOM元素的innerHTML作为模板
      } else if (template.nodeType) {
        template = template.innerHTML
      } else {
        return this
      }
    } else if (el) {
      // 返回el提供的Dom元素的HTML字符串
      template = getOuterHTML(el)
    }
    if (template) {
      const { render, staticRenderFns } = compileToFunctions(template, {
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns
    }
  }
  return mount.call(this, el, hydrating)
}
```

上述代码中可以看出，`$mount`会先判断用户有没有自己手写`render`函数，如果没有，则需要Vue自己根据模板通过`compileToFunctions`函数生成`render`函数。

很明显`compileToFunctions`函数就是我们需要着重分析的部分，先看调用部分

```js
const { render, staticRenderFns } = compileToFunctions(template, {
  shouldDecodeNewlines,
  shouldDecodeNewlinesForHref,
  delimiters: options.delimiters,
  comments: options.comments
}, this)
```

将`template`作为参数调用`compileToFunctions`，就得到了`render`函数，这不就是我们要找的么，我们继续看`compileToFunctions`的来源

```js
// src/platforms/web/compiler/index.js
const { compile, compileToFunctions } = createCompiler(baseOptions)
```

可以看出来`compileToFunctions`是`createCompiler`函数调用完毕后的返回值中解构来的，继续查找`createCompiler`。

```js
// src/compiler/index.js
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {

  // 模板解析阶段：用正则等方式解析 template 模板中的指令、class、style等数据，形成AST
  const ast = parse(template.trim(), options)

  if (options.optimize !== false) {
    // 优化阶段：遍历AST，找出其中的静态节点，并打上标记；
    optimize(ast, options)
  }
  // 代码生成阶段：将AST转换成渲染函数
  const code = generate(ast, options)
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})
```

到这个函数后，就遇到熟悉的部分了，`createCompiler`是调用`createCompilerCreator`函数返回得到的，`createCompilerCreator` 函数接收一个`baseCompile`函数作为参数，`baseCompile`函数内部逻辑就是我们熟悉的模板编译的三个阶段。

那我们看`createCompilerCreator`做了什么事情

```js
// src/compiler/create-compiler.js
export function createCompilerCreator (baseCompile) {
  return function createCompiler (baseOptions) {

  }
}
```

`createCompilerCreator`函数直接返回了`createCompiler`函数，我们继续看`createCompiler`的实现

```js
// src/compiler/create-compiler.js
function createCompiler (baseOptions) {
  function compile (){

  }
  return {
    compile,
    compileToFunctions: createCompileToFunctionFn(compile)
  }
}
```

`createCompiler`函数返回了`compile`和`compileToFunctions`两个值，`compileToFunctions`就是我们最初要找的函数，它是由`createCompileToFunctionFn(compile)`调用实现的，继续查找`createCompileToFunctionFn`的实现

```js
// src/compiler/to-function.js

function createFunction (code, errors) {
  try {
    return new Function(code)
  } catch (err) {
    errors.push({ err, code })
    return noop
  }
}

export function createCompileToFunctionFn (compile) {
  return function compileToFunctions (){
    // compile
    const res = {}
    const compiled = compile(template, options)
    res.render = createFunction(compiled.render, fnGenErrors)
    res.staticRenderFns = compiled.staticRenderFns.map(code => {
      return createFunction(code, fnGenErrors)
    })
    return res
  }
}
```

终于看到了`compileToFunctions`的定义，这一层层嵌套还挺麻烦的。

`compileToFunctions`调用的是传入的参数`compile`进行编译，编译完成后，使用`createFunction`将函数字符串生成可执行的`render`函数，我们再返回看`compile`的实现，`compile`的实现在`createCompiler`函数内部

```js
function compile (
  template: string,
  options?: CompilerOptions
): CompiledResult {
  const finalOptions = Object.create(baseOptions)
  const errors = []
  const tips = []

  const compiled = baseCompile(template, finalOptions)

  compiled.errors = errors
  compiled.tips = tips
  return compiled
}
```

`compile`主要调用了`baseCompile`，而`baseCompile`则是我们上面说过，调用模板编译三个阶段的函数。

```js
function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {

  // 模板解析阶段：用正则等方式解析 template 模板中的指令、class、style等数据，形成AST
  const ast = parse(template.trim(), options)

  if (options.optimize !== false) {
    // 优化阶段：遍历AST，找出其中的静态节点，并打上标记；
    optimize(ast, options)
  }
  // 代码生成阶段：将AST转换成渲染函数
  const code = generate(ast, options)
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
}
```

那么主线逻辑就很清晰了

- `compileToFunctions`函数内部调用了`compile`函数
- 在`compile`函数内部又调用了`baseCompile`函数
- `baseCompile`函数返回的是代码生成阶段生成好的`render`函数字符串
- 在`compileToFunctions`函数内部将`render`函数字符串传给`createFunction`函数从而变成真正的`render`函数
- 最后将其赋值给`options.render`

整体流程图如下

![模板编译整体流程图](@assets/vue2/complieSummary.png)
