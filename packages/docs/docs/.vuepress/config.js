const path = require("path");
const vue2Route = require("./vue2-route");

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
      { text: "GitHub", link: "https://github.com/CrayonPig/originCodeCommit" },
    ],
    sidebar: {
      ...vue2Route
    },
  },
};
