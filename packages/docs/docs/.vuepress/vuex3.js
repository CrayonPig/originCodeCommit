module.exports = {
  '/vuex3/': [
    '/vuex3/',
    {
      title: '准备工作',
      collapsable: false, // 可选的, 默认值是 true,
      children: [
        '/vuex3/prepare/directory',
        '/vuex3/prepare/build',
        '/vuex3/prepare/entry',
      ]
    },
    {
      title: '初始化',
      collapsable: false, // 可选的, 默认值是 true,
      children: [
        '/vuex3/init/',
        '/vuex3/init/install',
      ]
    },
    {
      title: 'Store 实例化',
      collapsable: false, // 可选的, 默认值是 true,
      children: [
        '/vuex3/store/',
        '/vuex3/store/initModules',
        '/vuex3/store/installModules',
        '/vuex3/store/initVm',
        '/vuex3/store/summary',
      ]
    },
  ]
}