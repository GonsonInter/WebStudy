/**
 * HMR: Hot Module Replacement 热模块替换/模块热替换
 *    作用：一个模块发生变化，只会重新打包这一个模块，而不是打包所有模块，
 *      极大地提升了构建的速度
 *
 *    样式css文件：可以实现HMR功能，因为style-loader内部实现了；
 *    js文件：默认是没有实现HMR功能的，需要修改js代码，添加支持HMR功能的代码
 *      注意：HMR功能对js的处理，只能处理非入口js文件的其他文件。
 *    html文件：默认不能使用HMR功能，同时会导致问题，html不能惹更新了（不用做HMR）
 *      解决：修改entry入口，将html文件引入
 */

// resolve是用来拼接绝对路径的方法
const {resolve} = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  // webpack配置

  // 入口
  entry: './src/index.ts',
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
        oneOf: [
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
    }),
    new webpack.HotModuleReplacementPlugin()
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
    open: true,
  },

  devtool: 'source-map'
}

/**
 * source-map：一种提供源代码到构建后代码的映射技术
 * （如果构建后代码出错，通过映射可以追踪到源代码的错误）
 *
 * [inline-|hidden-|eval-][nosources-][cheap-[module-]]source-map
 *
 *  - source-map: 外部
 *      能追踪到错误代码的准确信息和源代码的错误位置
 *  - inline-source-map: 内联，只会生成一个内联的source-map
 *      能追踪到错误代码的准确信息和源代码的错误位置
 *  - hidden-source-map: 外部
 *      能找到准确的错误原因，但是不能确定错误位置
 *      不能追踪到源代码的错误位置，只能追踪到构建后的代码的错误位置
 *  - eval-source-map: 每一个文件都会生成一个source-map，生成的都在eval函数中
 *      能找到错误代码的准确信息和源代码的错误位置
 *  - nosources-source-map: 外部
 *      能找到错误代码的准确信息，但是没有任何源代码信息
 *  - cheap-source-map: 外部
 *      能追踪到错误代码的准确信息和源代码的错误位置
 *      只能精确到行
 *  - cheap-module-source-map: 外部
 *      能追踪到错误代码的准确信息和源代码的错误位置
 *      module会将loader的source-map加入
 *
 *  内联和外部的区别：1.是否生成了外部文件；2.内联的构建速度更快
 *
 *  开发环境：速度快，调试友好
 *    速度快：（eval > inline > cheap > ...）
 *       eval-cheap-source-map  eval-source-map
 *    调试更友好：
 *      source-map  cheap-module-source-map  cheap-source-map
 *    建议：
 *      --> eval-source-map --> eval-cheap-module-source-map
 *
 *  生产环境：源代码要不要隐藏？调试要不要更友好？
 *     内联会让代码的体积变大，所以生产环境下不要使用内联
 *     nosources-source-map 全部隐藏
 *     hidden-source-map 只隐藏源代码，会提示构建后的代码错误信息
 *   建议：
 *      --> source-map --> cheap-module-source-map
 */
