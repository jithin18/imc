const oracledb = require("oracledb");
const { resolve } = require("path");
const oracleConnection = require("../database/oracle-connection");
//const appconfig = require("../_config/appconfig.json");
const { Logger } = require("../_helpers/logger");
const dbConfig = require("../_helpers/customConfig");
var db_cpaasweb = dbConfig.database.cpaas_web;

function AuthUser(userid, roleid, type) {
  //type - 1 login,9 - logout

  options = { outFormat: oracledb.OBJECT };

  let dbConnection;
  sql = `BEGIN
  Cp_Web_Login_Details_Prc(:n_Type_In,:n_Role_In,:n_User_Id_In, :n_Login_Id_In_Out,:v_Location_Out, :n_Status_Out );
END;`;

  bindParams = {
    n_Type_In: type,
    n_User_Id_In: userid,
    n_Role_In: roleid,
    n_Login_Id_In_Out: { type: oracledb.STRING, dir: oracledb.BIND_INOUT },
    v_Location_Out: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
    n_Status_Out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  //------------------------------//
  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;
        resolve(result.dbResult);
      })
      .catch(function (err) {
        Logger.error("login-db.AuthUser : () : " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}

function getCursorData(cursor) {

  let aPromise = new Promise(async function (resolve, reject) {
    const resultSet = cursor;
    let row;
    row = await resultSet.getRows(100);

    resolve(row);
  });
  return aPromise;
}

module.exports.AuthUser = AuthUser;
module.exports.getCursorData = getCursorData;
