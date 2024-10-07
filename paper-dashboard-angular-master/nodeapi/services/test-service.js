const oracledb = require("oracledb");
const oracleConnection = require("../database/oracle-connection");
const { Logger } = require("../_helpers/logger");
//const appconfig = require("../_config/appconfig.json");

const dbConfig = require("../_helpers/customConfig");
var db_cpaasweb = dbConfig.database.cpaas_web;

function insertCalllog(calllog) {
  /*Cp_ivr_call_data_input_Prc(v_ivr_data_json_in in varchar2,
                                                         n_Status_Out       Out Number) Is */
  let dbConnection;

  let sql = `BEGIN
    Cp_ivr_call_data_input_Prc(:v_ivr_data_json_in,:n_Status_Out);
  END;`;

  let bindParams = {
    v_ivr_data_json_in: JSON.stringify(calllog),
    n_Status_Out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;
        dff;
        resolve(result.dbResult.outBinds.n_Status_Out);
      })
      .catch(function (err) {
        console.log("Catch Block Called !!!");
        Logger.error("call.service.insertCalllog : " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}

function checkDBConnection() {
  const sql = "select 1 as status, 'success' as message from dual";

  return new Promise((resolve, reject) => {
    oracleConnection
      .queryObject(sql, {}, {})
      .then(function (resp) {
        // console.log("testDBConnection  : ", resp);

        resolve(1);
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

module.exports.checkDBConnection = checkDBConnection;
