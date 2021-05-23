
// Express提供了一种方式专门用来包装路由
var express = require('express');
// var Students = require('../student-fs');
var Students = require('../student-mongoose');

var router = express.Router();

router.get('/', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  Students.find().then(data => {
    res.render('index.html', {
      fruits: [
          '苹果',
          '香蕉',
          '橘子'
      ],
      // students: data.students
      students: data
    })
  })
});
router.get('/students', (req, res) => {
  res.redirect('/');
});
router.get('/students/new', (req, res) => {
  res.render('new.html');
});
router.post('/students/new', (req, res) => {
  // console.log(req.body);
  // Students.save(req.body).then(r => res.redirect('/'));
  var stu = new Students(req.body);
  stu.save().then(r => {
    console.log(r);
    res.redirect('/');
  });
});
router.get('/students/edit', (req, res) => {
  // console.log(req.query);
  // Students.find(req.query).then(student => {
  //   res.render('edit.html', {
  //     student
  //   })
  // })

  Students.findById(req.query.id.substring(1, req.query.id.length - 1)).then(student => {
    res.render('edit.html', {
      student
    })
  })

});
router.post('/students/edit', (req, res) => {
  // console.log(req.body)

  // Students.find(req.query.id).then(student => {
  //   // console.log(student);
  //   Students.updateById(req.body).then(r => {
  //     res.redirect('/');
  //   });
  // })

  console.log(req.body);
  req.body._id = req.body._id.substring(1, req.body._id.length - 1);
  Students.updateOne({ _id: req.body._id }, req.body).then(r => {
    console.log('更新成功');
    res.redirect('/');
  })

});
router.get('/students/delete', (req, res) => {
  // Students.deleteById(req.query.id).then(r => res.redirect('/'));

  console.log(req.query);
  Students.deleteOne({_id: req.query.id.substring(1, req.query.id.length - 1)}).then(r => {
    res.redirect('/');
  });
});

module.exports = router;
