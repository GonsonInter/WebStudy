var mongoose = require('./db');

var FocusSchema = mongoose.Schema({
  title: {
    type: String,
    trim: true
  },
  pic: String,
  redirect: {
    type: String,
    set(params) {     // 存入数据库的时候进行格式化
      // params可以获取redirect的值，返回的就是redirect在数据库中存储的值
      if (!params)  return '';
      else {
        if (params.indexOf('http://') !== 0 && params.indexOf('https://') !== 0) {
          return 'http://' + params;
        }
        return params;
      }
    }
  },
  status: {
    type: Number,
    default: 1
  }
});


var FocusModel = mongoose.model('Focus', FocusSchema, 'focus');

module.exports = FocusModel;
