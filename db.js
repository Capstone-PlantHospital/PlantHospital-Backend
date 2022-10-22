const mysql = require("mysql");
const config = require('./config.json')

// const connection = mysql.createConnection({
//   host: config.host,
//   user: config.user,
//   password: config.password,
//   database: config.database,
// });

const connection = mysql.createConnection({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
});

connection.connect((err) => {
  if (err) throw err;
  console.log("DB connect");
});

module.exports = connection;