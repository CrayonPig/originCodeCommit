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
  ]
}