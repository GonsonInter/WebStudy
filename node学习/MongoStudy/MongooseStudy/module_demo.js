// var User = require('./model/user');
//
// User.find({}, (err, docs) => {
//   if (err)  return console.log(err);
//   console.log(docs);
// })


var Focus = require('./model/focus');

var focus = new Focus({
  title: '      这是另外的一条国际新闻    ',
  pic: 'www.xxx.com/x.png',
  redirect: 'www.baidu.com',
});

focus.save(err => {
  if (err)  return console.log(err);
  Focus.find({}, (err, docs) => {
    if (err)  return console.log(err);
    console.log(docs);
  });
})
