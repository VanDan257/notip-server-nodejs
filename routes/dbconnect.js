var mysql = require("mysql2");
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "app125201",
});

module.exports = connection;
