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
      title: '生命周期',
      collapsable: false, // 可选的, 默认值是 true,
      sidebarDepth: 3,
      children: [
        '/vue2/lifecycle/',
        '/vue2/lifecycle/newVue',
        '/vue2/lifecycle/mergeOptions',
      ]
    },
  ]
}