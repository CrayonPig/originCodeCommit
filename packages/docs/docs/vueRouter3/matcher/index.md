# 路由介绍

`Vue Route` 初始化完毕后，就要进入路由匹配环节了，在分析之前，我们先回顾`Vue Route`中关于路由匹配有哪些使用方法

## 静态路由

  静态路由是指在路由配置中提前定义好的路由规则，这些规则在应用程序初始化时就已经确定，并且在运行时不会发生变化。每个静态路由都映射到一个特定的组件，当用户在应用程序中导航到相应的路由路径时，将会加载对应的组件。

### 用法回顾

  ```js
  const routes = [
    { path: '/home', component: Home },
    { path: '/about', component: About },
  ];

  // 创建路由实例
  const router = new VueRouter({
    routes,
  });
  ```

  如上述示例，`/home`、`/about`就是静态路由

### 匹配思路

  静态路由的匹配规则较为简单，既然路由规则`path`保持不变，那就直接根据`path`去匹配路由规则，匹配成功就加载对应的组件。伪代码如下：

  ```js
    const routes = [
      { path: '/home', component: Home },
      { path: '/about', component: About },
    ];

    const pathMap = {};

    routes.forEach(route => {
      pathMap[route.path] = route;
    })

    console.log(pathMap['/home'])
  ```

## 动态路由

  动态路由是指在路由配置中根据某些参数或条件来动态生成路由规则的一种方式。相对于静态路由，在运行时可以根据需要添加、删除或修改路由规则，从而实现更灵活的路由配置。

### 用法回顾

  ```js
  // 配置动态路由
  const routes = [
    { path: '/user/:id', component: User },
    { path: '/product/:id', component: Product },
    { path: '*', component: NotFound } // 处理未匹配的路径
  ];

  // 创建路由实例
  const router = new VueRouter({
    routes,
  });
  ```

  在上面的例子中，我们使用了动态路由参数 `:id`，它会匹配任意的路径，例如 `/user/123` 或者 `/product/456`。当用户访问这些路径时，`User` 组件和 `Product` 组件将根据不同的参数 `id` 来渲染不同的内容。

### 匹配思路

  动态路由的匹配思路是，当用户访问一个路径时，先根据 `path` 生成正则，再利用正则匹配当前路径，如果匹配成功，就说明是该路由。伪代码如下：

  ```js
  const pagePath = '/user/123'
  const regex = /.../

  const m = pagePath.match(regex)

  if(m) {
    console.log('就是这个路由') 
  } else {
    console.log('此路由不匹配，换下一个') 
  }
  ```

## 命名路由

  命名路由是在 Vue Router 中给特定路由规则添加一个`name` 属性，以便在编程式导航或模板中更方便地引用和跳转到该路由。

  ```js
  // 配置命名路由
  const routes = [
    { path: '/', component: Home, name: 'home' },
    { path: '/about', component: About, name: 'about' },
    { path: '/contact', component: Contact, name: 'contact' },
  ];

  // 创建路由实例
  const router = new VueRouter({
    routes,
  });
  ```

  在上面的例子中，我们给每个路由配置添加了一个 `name` 属性，分别为 `'home'`、`'about'` 和 `'contact'`。通过命名路由，我们可以更加清晰地管理路由跳转，避免硬编码路径，从而使路由配置更加可维护和易读。

### 匹配思路

  命名路由的匹配思路跟静态路由类似，直接根据`name`去匹配路由规则，匹配成功就加载对应的组件

  ```js
    const routes = [
      { path: '/', component: Home, name: 'home' },
      { path: '/about', component: About, name: 'about' },
      { path: '/contact', component: Contact, name: 'contact' },
    ];

    const nameMap = {};

    routes.forEach(route => {
      nameMap[route.name] = route;
    })

    console.log(nameMap['home'])
  ```

## 嵌套路由

  嵌套路由是在 `Vue Router` 在路由配置中使用 `children` 属性将一个路由规则嵌套在另一个路由规则下的一种方式。通过使用嵌套路由，我们可以在父路由的组件内部定义子路由的规则，从而实现更复杂的页面布局和组织方式。

### 用法回顾

  ```js
  // 配置嵌套路由
  const routes = [
    {
      path: '/',
      component: Layout,
      children: [
        { path: '', component: Home }, // 父路由的默认子路由
        { path: 'about', component: About },
        { path: 'contact', component: Contact },
      ],
    },
  ];

  // 创建路由实例
  const router = new VueRouter({
    routes,
  });
  ```

  在上面的例子中，我们定义了一个名为 `Layout` 的父组件，该组件用于容纳子路由。在 `children` 属性下，我们定义了三个子路由规则，分别对应于 `Home`、`About` 和 `Contact` 组件。

### 匹配思路

  嵌套路由看着复杂一些，其实我们只需要根据`children`属性进行递归处理，然后再按照上述路由匹配思路进行匹配，伪代码如下

  ```js
  const routes = [
    {
      path: '/',
      component: Layout,
      children: [
        { path: '', component: Home }, // 父路由的默认子路由
        { path: 'about', component: About },
        { path: 'contact', component: Contact },
      ],
    },
  ];

  const nameMap = {};
  const pathMap = {};

  function loopMatcher(routes) {
    routes.forEach(route => {
      pathMap[route.path] = route;
      if(route.name) {
        nameMap[route.name] = route;
      }
      // 有children递归匹配
      if(route.children) {
        loopMatcher(route.children)
      }
    })
  }
  ```

上述分析的思路都较为简单，但在实际开发过程中，不仅会存在上述条件的组合，而且还有一些其他的情况需要处理，比如重定向和别名等等。接下来我分析源码，看上述分析的思路是否正确。
