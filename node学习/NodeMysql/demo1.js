var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'users'
});

connection.connect();

connection.query(`insert into users values (null, "admin", "123456");`, (err, res, fields) => {
  if (err)  throw err;
  console.log('The solution is: ', res);
})


connection.end();
