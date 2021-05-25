

module.exports = {
  entry: '',
  output: {
    filename: 'js/[name].js',
    path: '',
    // 所有输出资源的公共路径 --> 所有路径的前缀
    publicPath: '/'
  },
  module: {},
  plugins: [],
  mode: '',

  // 解析模块的规则
  resolve: {
    alias: {
      // 路径别名：有点事简写路径，缺点是路径没有提示
      $css: resolve(__dirname, 'src/css')
    },
    // 可省略的文件后缀名，默认只有js和json
    extensions: ['.js', '.json'],
    // 告诉 webpack 解析模块去哪个目录找，默认是node_modules
    modules: ['node_modules'],
  },

  devServer: {
    // 运行代码的目录
    contentBase: '',
    // 监视contentBase目录下的文件，一旦文件变化就reload,
    watchContentBase: true,
    // 忽略文件
    watchOptions: {
      ignore: /node_modules/
    },
    // 启动gzip压缩
    compress: 'gzip',
    // 端口号
    port: 3000,
    // 域名
    host: '',
    // 自动打开浏览器
    open: true,
    // 开启HMR功能
    hot: true,
    // 不显示启动服务器的日志信息
    clientLogLevel: 'none',
    // 除了一些基本的启动信息，其他内容不显示
    quiet: true,
    // 如果出错了，不要全屏提示
    overlay: false,
    // 服务器代理，解决开发服务器的跨域问题
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        pathRewrite: {
          // 发送请求时，请求路径重写：将/api/xxx --> /xxx  去掉/api
          '^/api': ''
        }
      }
    },

  }
}
