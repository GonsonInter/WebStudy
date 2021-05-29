/**
 * 开发环境的基本配置，目的是让代码运行即可
 * 运行项目的指令：
 *  - webpack：会将打包的结果输出
 *  - npx webpack-dev-server 只会在内存中编译打包，没有输出
 */

const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'js/built.js',
    path: resolve(__dirname, 'build')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader']
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'url-loader',
        options: {
          limit: 8 * 1024,
          name: '[hash:10].[ext]',
          esModule: false,
          outputPath: 'imgs'
        }
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        options: {
          esModule: false,
          outputPath: 'media'
        }
      },
      {
        exclude: /\.(html|js|css|less|jpg|png|gif)/,
        loader: 'url-loader'
      }
    ]
  },
  plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html'
      })
  ],
  mode: 'development',

  devServer: {
    contentBase: resolve(__dirname, 'build'),
    compress: true,
    port: 3000,
    open: true
  }
}
