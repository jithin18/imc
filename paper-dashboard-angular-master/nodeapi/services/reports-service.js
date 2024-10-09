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

function getOngoingCalls() {
  /**create or replace procedure vb_ongoing_call_report_prc (
                                                   ref_cur_out out sys_refcursor) */
  let dbConnection;
  let sql = `BEGIN vb_ongoing_call_report_prc(:ref_cur_out); END;`;

  let bindParams = {
    ref_cur_out: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }, // Output bind for ref_cur_out cursor
  };

console.log("bindParams ",bindParams);
  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        // Fetch the cursor data from `ref_cur_out`

       // console.log("result ", result);

        oracleConnection
          .getCursorData(result.dbResult.outBinds.ref_cur_out, 500)
          .then(function (cursorResult) {
            // Resolve both `v_json_out` and the cursor data
            dbConnection = result.dbConnection;

            resolve({
              ref_cur_out: cursorResult, // Cursor data
            });
          })
          .catch(function (e) {
            Logger.error("Error fetching cursor data in getOngoingCalls: " + e);
            reject(err);
          });
      })
      .catch(function (err) {
        Logger.error("Error executing procedure in getOngoingCalls: " + err);
        reject(err);
      });
  }).finally(function () {
    // Release the database connection
    oracleConnection.connRelease(dbConnection);
  });
}

function getcallhistory(req) {

  let dbConnection;
  let sql = `BEGIN vb_call_history_prc(:v_in_json, :ref_cur_out); END;`;

  // Prepare bind parameters for input and output
  let bindParams = {
      v_in_json: { val: JSON.stringify(req), dir: oracledb.BIND_IN, type: oracledb.STRING }, // Stringify req for input
      ref_cur_out: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } // Output bind for ref_cur_out cursor
  };

  return new Promise(function (resolve, reject) {
      // Execute the procedure
      oracleConnection
          .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
          .then(function (result) {
              dbConnection = result.dbConnection; // Store the connection
              
              // Fetch the cursor data from `ref_cur_out`
              oracleConnection
                  .getCursorData(result.dbResult.outBinds.ref_cur_out, 500)
                  .then(function (cursorResult) {
                      // Resolve with the cursor data
                      
                      
                      resolve({
                          ref_cur_out: cursorResult // Cursor data
                      });
                  })
                  .catch(function (err) {
                      Logger.error("Error fetching cursor data in getpeakhourcallbarchart: " + err);
                      reject(err);
                  });
          })
          .catch(function (err) {
              Logger.error("Error executing procedure in getpeakhourcallbarchart: " + err);
              reject(err);
          });
  }).finally(function () {
      // Release the database connection
      if (dbConnection) {
          oracleConnection.connRelease(dbConnection);
      }
  });
}

module.exports.getbotchatdetails = getbotchatdetails;
module.exports.getOngoingCalls = getOngoingCalls;
module.exports.getcallhistory = getcallhistory;
