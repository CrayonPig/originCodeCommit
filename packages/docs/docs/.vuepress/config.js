const path = require("path");
const vue2Route = require("./vue2-route");
const vueRouteV3Route = require("./vue-router3");
const vueXV3Route = require("./vuex3");

module.exports = {
  title: "前端源码解读",
  description:
    "前端源码解读文档;使用过程中如碰到问题，请到Github进行提问。 https://github.com/CrayonPig/originCodeCommit",
  dest: "../../dist/",
  plugins: ['@vuepress/medium-zoom'],
  markdown: {
    lineNumbers: true,
    extendMarkdown: (md) => {
      const options = {
        btnText: '复制代码', // 'copy' | button text
        successText: '成功', // 'copy success' | copy-success text
      };
      md.use(require("markdown-it-copy"), options);
    },
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@assets': path.resolve(__dirname, "../../assets")
      },
    },
  },
  extraWatchFiles: [
    '.vuepress/*.js',
  ],
  themeConfig: {
    nav: [
      { text: 'Vue2',link: '/vue2/' },
      { text: 'Vue Route V3',link: '/vueRouter3/' },
      { text: 'VueX V3',link: '/vuex3/' },
      { text: "GitHub", link: "https://github.com/CrayonPig/originCodeCommit" },
    ],
    sidebar: {
      ...vue2Route,
      ...vueRouteV3Route,
      ...vueXV3Route
    },
  },
};
