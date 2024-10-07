const oracle = require("./oracle-connection.js");

const sql = "select 'test' as c1, 'oracle' as c2 from dual";
oracle
  .queryObject(sql, {}, {})
  .then(function (result) {
    console.log( result.rows[0]["C2"]);
  })
  .catch(function (err) {
    next(err);
  });
