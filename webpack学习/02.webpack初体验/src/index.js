/**
 * index.js 入口文件
 *
 * 1.运行指令：
 *  开发环境：webpack ./src/index.js -o ./build/built.js --mode=development
 *    webpack会以webpack ./src/index.js作为入口文件开始打包，输出到./build/built.js，
 *    整体打包环境是开发环境
 *  生产环境：webpack ./src/index.js -o ./build/built.js --mode=production
 *    webpack会以webpack ./src/index.js作为入口文件开始打包，输出到./build/built.js，
 *    整体打包环境是生产环境
 *
 * 2.结论：
 *    - webpack能处理js/json资源，不能处理css/img等其他资源
 *    - 生产环境和开发环境将ES6模块化编译成浏览器能识别的模块化
 *    - 生产环境比开发环境要多一个js代码的压缩
 */

import './index.css';
import './index.less'

function add(x, y) {
  return x + y;
}

console.log(add(1, 2));
