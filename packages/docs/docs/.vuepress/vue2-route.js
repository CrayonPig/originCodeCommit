module.exports = {
  '/vue2/': [
    '/vue2/',
    {
      title: '前期准备',
      collapsable: false, // 可选的, 默认值是 true,
      children: [
        '/vue2/prepare/directory',
        '/vue2/prepare/version',
        '/vue2/prepare/build',
        '/vue2/prepare/entry',
      ]
    },
    {
      title: '变化侦测',
      collapsable: false, // 可选的, 默认值是 true,
      children: [
        '/vue2/reactive/',
        '/vue2/reactive/object',
        '/vue2/reactive/array'
      ]
    },
    {
      title: '虚拟DOM',
      collapsable: false, // 可选的, 默认值是 true,
      children: [
        '/vue2/vnode/',
        '/vue2/vnode/vnode',
        '/vue2/vnode/patch',
        '/vue2/vnode/updateChildren',
        '/vue2/vnode/optimizeUpdateChildren',
        '/vue2/vnode/diffSummary',
      ]
    },
    {
      title: '模板编译',
      collapsable: false, // 可选的, 默认值是 true,
      children: [
        '/vue2/compile/',
        '/vue2/compile/parse',
        '/vue2/compile/parseHtml',
        '/vue2/compile/parseTxt',
        '/vue2/compile/optimize',
        '/vue2/compile/codegen',
        '/vue2/compile/summary',
      ]
    },
    {
      title: '生命周期',
      collapsable: false, // 可选的, 默认值是 true,
      sidebarDepth: 3,
      children: [
        '/vue2/lifecycle/',
        '/vue2/lifecycle/newVue',
        '/vue2/lifecycle/mergeOptions',
        '/vue2/lifecycle/initLifecycle',
        '/vue2/lifecycle/initEvents',
        '/vue2/lifecycle/initRender',
        '/vue2/lifecycle/initInjections',
        '/vue2/lifecycle/initState',
        '/vue2/lifecycle/initProvide',
        '/vue2/lifecycle/templateCompile',
        '/vue2/lifecycle/mount',
        '/vue2/lifecycle/destroy',
      ]
    },
    {
      title: '实例方法',
      collapsable: false, // 可选的, 默认值是 true,
      sidebarDepth: 3,
      children: [
        '/vue2/instanceMethods/data',
        '/vue2/instanceMethods/event',
        '/vue2/instanceMethods/lifecycle',
      ]
    },
    {
      title: '全局API',
      collapsable: false, // 可选的, 默认值是 true,
      sidebarDepth: 3,
      children: [
        '/vue2/globalAPI/',
        '/vue2/globalAPI/extend',
        '/vue2/globalAPI/nextTick',
        '/vue2/globalAPI/set',
        '/vue2/globalAPI/delete',
        '/vue2/globalAPI/directive',
        '/vue2/globalAPI/filter',
        '/vue2/globalAPI/component',
        '/vue2/globalAPI/use',
        '/vue2/globalAPI/mixin',
        '/vue2/globalAPI/compile',
        '/vue2/globalAPI/observable',
        '/vue2/globalAPI/version',
      ]
    },
    {
      title: '过滤器',
      collapsable: false, // 可选的, 默认值是 true,
      children: [
        '/vue2/filter/',
        '/vue2/filter/parse',
        '/vue2/filter/principle',
      ]
    },
  ]
}