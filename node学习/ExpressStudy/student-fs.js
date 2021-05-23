/**
 * 数据操作文件模块
 */

var dbPath = './db.json';
var fs = require('fs');

/**
 * 查找学生
 */
exports.find = function (id) {
  return new Promise((resolve, reject) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        if (!id) {
          resolve(JSON.parse(data));
        } else {
          let {students} = JSON.parse(data);
          resolve(students.find(item => item.id + '' === id + ''));
        }
      }
    })
  });
}

/**
 * 保存学生
 */
exports.save = async function (stu) {
  try {
    var data = await exports.find();
    if (data.students.length) {
      let lastId = data.students[data.students.length - 1].id;
      stu.id = lastId + 1;
    } else {
      stu.id = 1;
    }
    data.students.push(stu);
    fs.writeFile(dbPath, JSON.stringify(data), err => {
    })
  } catch (e) {
    console.log(e);
  }
}

/**
 * 更新学生
 */
exports.updateById = async function (stu) {
  let {students} = await exports.find();
  let s = students.find(item => item.id + '' === stu.id + '');
  for (let key in stu) {
    s[key] = stu[key];
  }
  s.id = parseInt(s.id + '');
  let fileData = JSON.stringify({
    students
  })
  fs.writeFile(dbPath, fileData, err => {
  });
}

/**
 * 删除学生
 */
exports.deleteById = async function (id) {
  let {students} = await exports.find();
  let tid = students.findIndex(item => item.id + '' === id + '');
  students.splice(tid, 1);
  fs.writeFile(dbPath, JSON.stringify({students}), err => {
  })
}
