module.exports = {
  '/vue3/': [
    '/vue3/',
    {
      title: '准备工作',
      collapsable: false, // 可选的, 默认值是 true,
      children: [
        '/vue3/prepare/directory',
        '/vue3/prepare/version',
        '/vue3/prepare/build'
      ]
    },
    {
      title: '变化侦测',
      collapsable: false, // 可选的, 默认值是 true,
      children: [
        '/vue3/reactive/',
        '/vue3/reactive/proxy',
        '/vue3/reactive/object',
      ]
    },
  ]
}