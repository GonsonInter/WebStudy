// 1. 引入mongoose
const mongoose = require('mongoose');

// 2. 链接mongo数据库
mongoose.connect('mongodb://127.0.0.1:27017/eggcms', err => {
  if (err)  return console.log(err);
  console.log('数据库连接成功');
});

// 3. 操作users表（集合），定义一个schema。schema里面的对象和数据库表中的字段需要一一对应
var UserSchema = mongoose.Schema({
  name: String,
  age: Number,
  status: {
    type: Number,
    default: 1
  }
});

// 4. 定义数据库模型，操作数据库。
//    model里面的第一个参数要注意：1.首字母大写。2.要和数据库表（collection）名称对应
var User = mongoose.model('User', UserSchema);

// 5. 查询users的数据
User.find({}, (err, doc) => {
  if (err)  return console.log(err);
  console.log(doc);
});

// // 6. 增加数据
// // 6.1 首先要实例化一个Model， 通过实例化 User Model 创建增加的数据
// var u = new User({
//   name: '李四',
//   age: 20,
//   status: 1
// });
// // 6.2 调用实例的 save() 方法
// u.save(err => {
//   if (err)  return console.log(err);
//   console.log('插入成功');
// });

// // 7. 更新数据
// User.updateOne({ '_id': '60a4c293a21fad4ce8b072ab' },
//     { 'name': '张三' }, err => {
//     if (err)  return console.log(err);
//     console.log('修改成功');
// });

// 8. 删除数据
User.deleteOne({ 'name': '李四' }, err => {
  if (err) return console.log(err);
  console.log('删除成功');
})
