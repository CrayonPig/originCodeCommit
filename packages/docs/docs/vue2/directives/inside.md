# 内置指令

上文中，我们说 Vue 中内置了一些指令，这些指令是在模板渲染阶段被处理的。在模板解析阶段，Vue将指令解析到`AST`上，然后使用`AST`生成函数字符串的过程中实现内置指令的功能。

本小节我们一起分析下这些内置指令的实现原理。

## v-if、v-else

### 用法回顾

`v-if` 指令用于条件性地渲染一块内容。这块内容只会在指令的表达式返回 `truthy` 值的时候被渲染。

也可以用 `v-else` 添加一个“else 块”

这两者用于根据表达式的真假条件来动态地添加或删除 DOM 元素。当表达式为真时，元素会被渲染；当表达式为假时，元素将从 DOM 中移除。

示例：

```html
<div>
  <p v-if="isShow">这是一个条件渲染的示例</p>
  <p v-else>当条件不满足时显示这段文字</p>
</div>
```

### 原理分析
