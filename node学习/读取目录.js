var fs = require('fs');
var http = require('http');
var path = require('path');

fs.readdir('C:/', (err, files) => {
  if (err) {
    return console.log('目录不存在');
  }

  // console.log(files);
})


http
  .createServer(function (req, res) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('服务启动了');
  })
    // .listen(3000, function () {
    //   console.log('running on 3000...');
    // });


console.log(path.dirname('./server.js'))
