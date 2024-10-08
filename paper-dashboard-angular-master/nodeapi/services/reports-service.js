const oracledb = require("oracledb");
const oraclehelperdb = require("../_helpers/oracle-service");
const oracleConnection = require("../database/oracle-connection");
const { Logger } = require("../_helpers/logger");
const appconfig = require("../_config/appconfig.json");
//const db_cpaasweb = appconfig.database.cpaas_web;
const dbConfig = require("../_helpers/customConfig");
const locationDBops = require("../database/location-dbops");
var db_cpaasweb = dbConfig.database.cpaas_web;

function getbotchatdetails(callid) {
  /*vb_live_bot_query_prc(n_call_in in   number,v_json_out out varchar2)*/
  let dbConnection;
  let sql = `BEGIN vb_live_bot_query_prc(:n_call_in, :v_json_out); END;`;

  let bindParams = {
    n_call_in: callid, // Stringify req for input
    v_json_out: {
      dir: oracledb.BIND_OUT,
      type: oracledb.STRING,
      maxSize: 5000,
    }, // Output bind for v_json_out
  };

  console.log(" -- bindParams --", bindParams);

  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;
        const v_json_out = result.dbResult.outBinds.v_json_out;

        resolve({
          v_json_out: v_json_out, // Output from `v_json_out`
        });
      })
      .catch(function (err) {
        Logger.error("Error executing procedure in getbotchatdetails: " + err);
        reject(err);
      });
  }).finally(function () {
    // Release the database connection
    oracleConnection.connRelease(dbConnection);
  });
}

module.exports.getbotchatdetails = getbotchatdetails;
