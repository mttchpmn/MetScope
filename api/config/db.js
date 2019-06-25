const config = require("./config");

const Pool = require("pg").Pool;
const pool = new Pool({
  user: config.db.user,
  host: config.db.host,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port
});

module.exports = pool;
