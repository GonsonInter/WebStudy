/**
 * 这个文件负责和user表做映射，配置schema和model
 */

var mongoose = require('./db');
var UserSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  age: Number,
  status: {
    type: Number,
    default: 1
  }
});

var UserModel = mongoose.model('Users', UserSchema, 'users');

module.exports = UserModel;
