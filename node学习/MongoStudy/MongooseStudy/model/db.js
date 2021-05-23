/**
 * 这个文件的作用就是连接数据库
 */

var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/eggcms',
    { userNewUrlParser: true }, err => {
      if (err)  return console.log(err);
      console.log('数据库连接成功。');
    })

module.exports = mongoose;
