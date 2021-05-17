var http = require('http');
var fs = require('fs');
var url = require('url');


var server = http.createServer();

/**
 * 1、结合fs发送文件中的数据
 * 2、Content-Type
 *    https://tool.oschina.net/commons
 *    不同的资源对应不同的Content-Type
 */

server.on('request', function (req, res) {
  var parseObj = url.parse(req.url, true);
  var pathname = parseObj.pathname;

  let comments = [
    {
      name: 'aaa',
      message: 'adwadwadwad'
    }, {
      name: 'bbb',
      message: 'wadwadadawdwadvfvs'
    }
  ]

  if (pathname === '/' || pathname === '/index') {
    fs.readFile('./resources/index.html', (err, data) => {
      if (err) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('读取文件失败，请稍后重试。');
      } else {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(data);
      }
    })
  } else if (pathname === '/gsjt') {
    fs.readFile('./resources/gsjt.jpg', (err, data) => {
      if (err) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('读取图片失败，请稍后重试。');
      } else {
        res.setHeader('Content-Type', 'image/jpg');
        res.end(data);
      }
    })
  } else if (pathname === '/login') {
    res.end('login page');
  } else if (pathname === '/products') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});

    let products = [
      {
        name: '苹果X',
        price: 10000
      }, {
        name: '菠萝X',
        price: 8888
      }, {
        name: '锤子',
        price: 1000
      }
    ];

    res.end(JSON.stringify(products));
  } else if (pathname === '/form') {

    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    fs.readFile('./form.html', function (err, data) {
      if (err) {
        res.end('表单请求失败');
      } else {
        res.end(data);
      }
    })
  } else if (pathname === '/comment') {

    console.log(parseObj.query);

  } else {
    res.end('404 Not Found.');
  }
})

// 绑定端口号
server.listen(80, function () {
  console.log('服务器建立成功了，通过http://localhost:80来访问');
})
