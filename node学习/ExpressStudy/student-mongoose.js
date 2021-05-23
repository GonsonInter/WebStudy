/**
 * 数据操作数据库模块
 */

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/eggcms');

var Schema = mongoose.Schema;

var commentSchema = new Schema({
  name: {
    type: String,
    required: true

  },
  gender: {
    type: String,
    enum: ['0', '1'],
    default: '0'
  },
  age: {
    type: Number
  },
  hobbies: String
})

module.exports = mongoose.model('Student', commentSchema);

