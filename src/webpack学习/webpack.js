const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const babel = require('@babel/core');
const path = require('path');


let ID = 0;

/**
 * 解析文件以及其依赖
 * @param filename
 * @returns {{filename, code, id: number, dependencies: []}}
 */
function createAsset(filename) {

  // 读取文件内容
  const content = fs.readFileSync(filename, 'utf8');

  // 转化为抽象语法树
  const ast = parser.parse(content, {
    sourceType: 'module'
  });

  // 遍历抽象语法树, 找到依赖
  const dependencies = [];
  traverse(ast, {
    ImportDeclaration: ({ node }) => {
      dependencies.push(node.source.value);
    }
  })

  // 将ES6代码转化为ES5代码
  const { code } = babel.transformFromAstSync(ast, null, {
    presets: ['@babel/preset-env'],
  })

  let id = ID ++;

  return {
    id,
    filename,
    code,
    dependencies
  }
}

/**
 * 构建模块依赖图
 * @param entry
 */
function createGraph(entry) {
  // 解析入口文件
  const mainAsset = createAsset(entry);
  const queue = [mainAsset];
  for (const asset of queue) {

    const dirname = path.dirname(asset.filename);

    asset.mapping = {};

    asset.dependencies.forEach(relativePath => {
      const absolutePath = path.join(dirname, relativePath);
      const child = createAsset(absolutePath);
      asset.mapping[relativePath] = child.id;
      queue.push(child);
    })
  }

  return queue;
}

/**
 * 打包
 * @param graph
 */
function bundle(graph) {
  let modules = '';
  graph.forEach(mod => {
    modules += `
      ${mod.id}: [
        function(require, module, exports) {
          ${mod.code}
        }, 
        ${JSON.stringify(mod.mapping)}
      ],
    `;
  })

  const result = `
    (function(modules) {
      function require(id) {
         const [fn, mapping] = modules[id];
         
         function localRequire(relativePath) {
           return require(mapping[relativePath]);
         }
         
         const module = {
           exports: {}
         }
         
         fn(localRequire, module, module.exports);
         
         return module.exports;
      }
      require(0);
    })({${modules}});
  `;

  return result;
}

const graph = createGraph('./src/index.js');
let bd = bundle(graph);
console.log(bd);
