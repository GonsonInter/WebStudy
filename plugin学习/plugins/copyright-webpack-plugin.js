class CopyrightWebpackPlugin {
  constructor () {
    console.log('插件被使用了');
  }
  apply (compiler) {   // 其中compiler为webpack实例

  }
}

module.exports = CopyrightWebpackPlugin;
