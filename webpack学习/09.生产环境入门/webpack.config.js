const {resolve} = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PostcssPresetEnv = require('postcss-preset-env');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');

// 设置nodejs环境变量
process.env.NODE_ENV = 'development;'


module.exports = {
  entry: './src/js/index.js',
  output: {
    filename: 'js/built.js',
    path: resolve(__dirname, 'build')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          // 创建style标签，将样式放入
          // 'style-loader',
          // 这个loader会取代style-loader，作用是提取js中的css成文单独的文件
          MiniCssExtractPlugin.loader,
          // 将css文件整合到js文件中
          'css-loader',
          /**
           * css的兼容性处理：postcss --> postcss-loader --> postcss-preset-env
           * 帮助postcss找到package.json中的browserslist里面的配置，通过配置加载指定的css兼容性样式
           * "browserslist": {
           *    // 开发环境 --> 需要设置nodejs的环境变量：process.env.NODE_ENV = 'development'
                "development": [
                  "last 1 chrome version",
                  "last 1 firefox version",
                  "last 1 safari version"
                ],
                "production": [
                  ">0.2%",
                  "not dead",
                  "not op_mini all"
                ]
              }
           */
          // 使用loader的默认配置
          'postcss-loader',
          // 自定义loader配置
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  PostcssPresetEnv()
                ]
              }
            }
          }
        ]
      },
      /**
       * js语法检查：eslint-loader  eslint
       *    注意：只检查自己写的源代码，第三方的库不检查
       *    需要设置语法检查的规则：
       *      在package.json中eslintConfig中设置，推荐使用airbnb规则
       *      "eslintConfig": {
                "extends": "airbnb-base"
              }
       *      airbnb --> eslint-config-airbnb-base eslint eslint-plugin-import
       */
      {
        test: /\.js$/,
        exclude: /node_modules/,
        // 优先执行
        enforce: 'pre',
        loader: 'eslint-loader',
        options: {
          // 自动修复eslint的错误，默认为false
          fix: true
        }
      },

      /**
       * js的兼容性处理：babel-loader  @babel/core  @babel/preset-env
       *    1. 基本js兼容性处理 --> @babel/preset-env
       *      问题：只能转换基本语法，如promise不能转化
       *    2. 全部的js兼容性处理 --> @babel/polyfill
       *      问题：这个体积太大了
       *    3. 需要做兼容性处理的就按需加载 --> core-js ，现在都用这个
       */
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          // 预设：指示babel做怎样的兼容性处理
          presets: [
            [
              '@babel/preset-env',
              {
                // 按需加载
                useBuiltIns: 'usage',
                // 指定corejs版本，core-js是运行时依赖
                corejs: 3,
                // 指定兼容性做到哪个版本的浏览器
                targets: {
                  chrome: '60',
                  firefox: '60',
                  ie: '9',
                  safari: '10',
                  edge: '17'
                }
              }
            ]
          ],
          //利用 @babel/plugin-transform-runtime 插件还能以沙箱垫片的方式防止污染全局， 并抽离公共的 helper function , 以节省代码的冗余
          plugins: ['@babel/plugin-transform-runtime']
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      // 进行 html 代码的压缩
      minify: {
        // 折叠空格
        collapseWhitespace: true,
        // 移除注释
        removeComments: true
      }
    }),
    // 这个插件专门处理css
    new MiniCssExtractPlugin({
      filename: 'css/built.css'
    }),
    // 压缩css文件，使用默认配置就足够了
    new CssMinimizerWebpackPlugin()
  ],

  // 生产环境下会自动压缩 js 代码，自动使用了UglifyJsPlugin
  mode: 'production'
}
