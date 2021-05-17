var express = require('express');
var app = express();
var fs = require('fs');

app.use('/node_modules/', express.static('./node_modules/'));
app.use('/public/', express.static('./public/'));
// 配置模板引擎
app.engine('html', require('express-art-template'));

app.get('/', (req, res) => {
  fs.readFile('./db.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Server error.');
    } else {
      res.render('index.html', {
        fruits: [
          '苹果',
          '香蕉',
          '橘子'
        ],
        students: JSON.parse(data).students
      });
    }
  })
})

app.listen(3000, () => {
  console.log('running 3000...');
})



