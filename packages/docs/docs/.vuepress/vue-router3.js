module.exports = {
  '/vueRouter3/': [
    '/vueRouter3/',
    {
      title: '准备工作',
      collapsable: false, // 可选的, 默认值是 true,
      children: [
        '/vueRouter3/prepare/directory',
        '/vueRouter3/prepare/build',
        '/vueRouter3/prepare/entry',
      ]
    },
    {
      title: '初始化',
      collapsable: false, // 可选的, 默认值是 true,
      children: [
        '/vueRouter3/init/',
        '/vueRouter3/init/install',
      ]
    },
  ]
}