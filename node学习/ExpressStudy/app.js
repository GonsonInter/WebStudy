var express = require('express');
var app = express();
var router = require('./router');
var bodyParser = require('body-parser');


app.use('/node_modules/', express.static('./node_modules/'));
app.use('/public/', express.static('./public/'));
// 配置模板引擎
app.engine('html', require('express-art-template'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 挂载路由到 app 服务中
app.use(router);

app.listen(3000, () => {
  console.log('running 3000...');
})



