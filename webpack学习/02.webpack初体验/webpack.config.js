/**
 * webpack.config.js  webpack的配置文件
 *  作用：只是webpack干哪些活（当运行webpack指令的时候，会加载里面的配置）
 *
 *  所有构建工具都是基于nodejs平台的，使用commonjs模块化规范
 */

// resolve是用来拼接绝对路径的方法
const {resolve} = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // webpack配置

  // 入口
  entry: './src/index.js',
  // 输出
  output: {
    // 输出文件名
    filename: 'built.js',
    // 输出路径
    path: resolve(__dirname, 'build')
  },

  // loader配置
  module: {
    rules: [
      // 详细的loader配置
      // 不同文件必须配置不同的loader处理
      {
        // 匹配哪些文件
        test: /\.css$/,
        use: [
          // 创建style标签，将js中的样式资源插入，并添加到head标签中生效
          'style-loader',
          // 将css文件变成commonjs模块加载到js中，里面的内容是字符串
          'css-loader'
        ]
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          // 加载less文件，需要下载less-loader和less
          'less-loader'
        ]
      },
      {
        // 处理图片资源
        test: /\.(jpg|png|gif)$/,
        // 这个loader只能处理 css 中以 url() 加载的图片，不能处理img标签的图片
        loader: 'url-loader',
        options: {
          // 图片大小小于8kb，就会被base64处理
          // base64的优点：减少了请求的数量（减轻了服务器的压力）
          // 缺点：图片体积会更大（文件请求速度变慢）
          // 需要下载url-loader和file-loader，因为前者依赖于后者
          limit: 8 * 1024,
          // 问题：url-loader默认使用es6模块化解析，而需要使用commonjs进行解析
          esModule: false,
          name: '[hash:10].[ext]'
        }
      },
      {
        // 这个用来处理 html 中的图片
        test: /\.html$/,
        // 处理html文件的img图片（负责引入img，从而能被url-loader处理）
        loader: 'html-loader',
        options: {
          // 使用commonjs进行解析
          esModule: false
        }
      },
      {
        // 处理其他的资源
        exclude: /\.(css|js|gif|html|less|)$/
      }
    ],

  },

  // plugins的配置
  plugins: [
    // 详细的插件配置
    // html-webpack-plugin
    // 功能：默认会创建一个空的html文件，引入打包输出的所有资源（js/css）
    // 需求：需要有结构的html文件
    new HtmlWebpackPlugin({
      // 复制文件，并自动引入打包生成的资源
      template: './src/index.html'
    })
  ],

  // 模式
  mode: 'development',

  // 开发服务器 devServer：用来自动化（自动编译，自动打开和刷新浏览器）
  // 特点：只会在内存中编译打包，不会有任何输出
  // 需要下载webpack-dev-server
  // 启动 devServer 的指令(webpack 5)为：npx webpack serve
  devServer: {
    // 构建后的项目路径
    contentBase: resolve(__dirname, 'build'),
    // 启动gzip压缩
    compress: true,
    port: 3000,
    // 自动打开浏览器（本地的默认浏览器），默认为false
    open: true
  }
}
