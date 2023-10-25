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
        '/vueRouter3/init/instantiate',
        '/vueRouter3/init/mount',
        '/vueRouter3/init/addComponent',
        '/vueRouter3/init/summary',
      ]
    },
    {
      title: '路由匹配',
      collapsable: false, // 可选的, 默认值是 true,
      children: [
        '/vueRouter3/matcher/',
        '/vueRouter3/matcher/matcher',
        '/vueRouter3/matcher/summary',
      ]
    },
    {
      title: '路由模式',
      collapsable: false, // 可选的, 默认值是 true,
      sidebarDepth: 3,
      children: [
        '/vueRouter3/mode/',
        '/vueRouter3/mode/history',
        '/vueRouter3/mode/hash',
        '/vueRouter3/mode/abstract',
      ]
    },
    {
      title: '进阶',
      collapsable: false, // 可选的, 默认值是 true,
      sidebarDepth: 3,
      children: [
        '/vueRouter3/advanced/navigation-guards',
        '/vueRouter3/advanced/route-view',
        '/vueRouter3/advanced/route-link',
      ]
    },
  ]
}