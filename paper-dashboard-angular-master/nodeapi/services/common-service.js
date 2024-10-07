const oracledb = require("oracledb");
const oraclehelperdb = require("../_helpers/oracle-service");
const oracleConnection = require("../database/oracle-connection");
const { Logger } = require("../_helpers/logger");

const dbConfig = require("../_helpers/customConfig");
var db_cpaasweb = dbConfig.database.cpaas_web;
const locationDBops = require("../database/location-dbops");

function GetAccounts(userid, roleid) {
  let dbConnection;

  let sql = `BEGIN
  Cp_Get_Account_Dtls(:n_User_Id_In,:n_Role_In,:v_Acc_Ref_Cur );
END;`;

  let bindParams = {
    n_User_Id_In: userid,
    n_Role_In: roleid,
    v_Acc_Ref_Cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
  };

  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;
        oracleConnection
          .getCursorData(result.dbResult.outBinds.v_Acc_Ref_Cur, 1000)
          .then(function (cursorResult) {
            resolve(cursorResult);
          })
          .catch(function (err) {
            Logger.error("Error in GetAccounts 01: " + err);
            reject(err);
          });
      })
      .catch(function (err) {
        Logger.error("Error in GetAccounts 02: " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}

function GetAccountSettings(accountid, roleid) {
  let dbConnection;
  // Cp_Get_Account_Settings_Prc(n_AccountId_in        In Number,
  //   n_RoleId_In           In Number,
  //   v_AccSettings_Ref_Cur Out Sys_Refcursor,
  //   n_Status_out out number)

  let sql = `BEGIN
  Cp_Get_Account_Settings_Prc(:n_AccountId_in,:n_RoleId_In,:v_AccSettings_Ref_Cur,:n_Status_out);
END;`;

  let bindParams = {
    n_AccountId_in: accountid,
    n_RoleId_In: roleid,
    v_AccSettings_Ref_Cur: {
      type: oracledb.DB_TYPE_CURSOR,
      dir: oracledb.BIND_OUT,
    },
    n_Status_out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;
        oracleConnection
          .getCursorData(result.dbResult.outBinds.v_AccSettings_Ref_Cur, 500)
          .then(function (cursorResult) {
            resolve({
              status: result.dbResult.outBinds.n_Status_out,
              data: cursorResult,
            });
          })
          .catch(function (err) {
            Logger.error("common-service.GetAccountSettings 1 : " + err);
            reject(err);
          });
      })
      .catch(function (err) {
        Logger.error("common-service.GetAccountSettings 2 : " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}

function GetServices(userid, roleid, accId) {
  let dbConnection;
  let sql = `BEGIN
    Cp_Get_Service_Dtls(:n_User_Id_In,:n_Role_In,:n_Acc_Id_In,:v_Acc_Ref_Cur );
END;`;

  let bindParams = {
    n_User_Id_In: userid,
    n_Role_In: roleid,
    n_Acc_Id_In: accId,
    v_Acc_Ref_Cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
  };

  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;
        oracleConnection
          .getCursorData(result.dbResult.outBinds.v_Acc_Ref_Cur, 1000)
          .then(function (cursorResult) {
            resolve(cursorResult);
          })
          .catch(function (err) {
            Logger.error("Error in GetServices : " + err);
            reject(err);
          });
      })
      .catch(function (err) {
        Logger.error("Error in GetServices : " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}

function GetObjectList(flowid) {
  try {
    let dbConnection;
    let sql = `BEGIN
      Cp_Object_details_out_Prc(:n_flow_Id_In,:c_ob_details );
END;`;

    exeOptions = { outFormat: oracledb.OBJECT };
    let bindParams = {
      n_flow_Id_In: flowid,
      c_ob_details: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
    };

    return new Promise(function (resolve, reject) {
      oracleConnection
        .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
        .then(function (result) {
          dbConnection = result.dbConnection;
          oracleConnection
            .getCursorData(result.dbResult.outBinds.c_ob_details, 1000)
            .then(function (cursorResult) {
              resolve(cursorResult);
            })
            .catch(function (err) {
              Logger.error("Error in GetObjectList : " + err);
              reject(err);
            });
        })
        .catch(function (err) {
          Logger.error("Error in GetObjectList : " + err);
          reject(err);
        });
    }).finally(function () {
      oracleConnection.connRelease(dbConnection);
    });
  } catch (e) {
    Logger.error(
      "common.service.GetObjectList() : " + JSON.stringify(e.message)
    );
  }
}

function GetServiceNumbersbyflowid(flowid, type) {
  try {
    let dbConnection;
    /*Cp_Service_Number_Out_Prc(n_flow_Id_In  In Number,
                                                      v_Dni_Cur_Out Out Sys_Refcursor) Is*/

    let sql = `BEGIN
    Cp_Service_Number_Out_Prc(:n_flow_Id_In,:n_type_in,:v_Dni_Cur_Out);
END;`;

    exeOptions = { outFormat: oracledb.OBJECT };
    let bindParams = {
      n_flow_Id_In: flowid,
      n_type_in: type,
      v_Dni_Cur_Out: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
    };

    return new Promise(function (resolve, reject) {
      oracleConnection
        .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
        .then(function (result) {
          dbConnection = result.dbConnection;
          oracleConnection
            .getCursorData(result.dbResult.outBinds.v_Dni_Cur_Out, 1000)
            .then(function (cursorResult) {
              resolve(cursorResult);
            })
            .catch(function (err) {
              Logger.error("Error in GetServiceNumbersbyflowid : " + err);
              reject(err);
            });
        })
        .catch(function (err) {
          Logger.error("Error in GetServiceNumbersbyflowid : " + err);
          reject(err);
        });
    }).finally(function () {
      oracleConnection.connRelease(dbConnection);
    });
  } catch (e) {
    Logger.error(
      "common.service.GetServiceNumbersbyflowid() : " +
        JSON.stringify(e.message)
    );
  }
}

function GetCircle(flowid, accId, call_type) {
  /*
   Cp_Circle_Out_Prc(n_account_id_in in number,
                                              n_Flow_Id_In    In Number,
                                              n_call_type_in  in number,
                                              
                                              v_Circle_Out Out Sys_Refcursor)


     */
  call_type = call_type ? call_type : 1;
  let dbConnection;
  let sql = `BEGIN
  Cp_Circle_Out_Prc(:n_account_id_in,:n_Flow_Id_In,:n_call_type_in,:v_Circle_Out);
  END;`;

  let bindParams = {
    n_account_id_in: accId,
    n_Flow_Id_In: flowid,
    n_call_type_in: call_type,
    v_Circle_Out: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
  };

  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(async function (result) {
        dbConnection = result.dbConnection;
        circle = await oracleConnection.getCursorData(
          result.dbResult.outBinds.v_Circle_Out,
          500
        );
        resolve(circle);
      })
      .catch(function (err) {
        Logger.error("common-service.GetCircle : " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}

function GetCirclebyDNI(dni, accid, type) {
  /*
  Cp_dni_circle_out_Prc(v_dni_In         In varchar2,
                                                  n_account_id_in  in number,
                                                  n_type_in        in number,
                                                  v_circle_key_out out varchar2,
                                                  n_sts_out        out number) Is

     */
  let dbConnection;
  let sql = `BEGIN
  Cp_dni_circle_out_Prc(:v_dni_In,:n_account_id_in,:n_type_in,:v_circle_key_out,:n_sts_out);
  END;`;

  let bindParams = {
    v_dni_In: dni,
    n_account_id_in: accid,
    n_type_in: type,
    v_circle_key_out: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
    n_sts_out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(async function (result) {
        dbConnection = result.dbConnection;
        resultOut = {
          status: result.dbResult.outBinds.n_sts_out,
          circle: result.dbResult.outBinds.v_circle_key_out,
        };
        resolve(resultOut);
      })
      .catch(function (err) {
        Logger.error("common-service.GetCirclebyDNI : " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}

function GetFlows(userid, roleid, accId) {
  // Cp_Get_Flow_Dtls(n_User_Id_In In Number,
  //   n_Role_In    In Number,
  //   n_Acc_Id_In  In Number,
  //   v_Ref_Cur    Out Sys_Refcursor)
  let dbConnection;
  let sql = `BEGIN
  Cp_Get_Flow_Dtls(:n_User_Id_In,:n_Role_In,:n_Acc_Id_In,:v_Ref_Cur );
END;`;

  let bindParams = {
    n_User_Id_In: userid,
    n_Role_In: roleid,
    n_Acc_Id_In: accId,
    v_Ref_Cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
  };

  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;
        oracleConnection
          .getCursorData(result.dbResult.outBinds.v_Ref_Cur, 1000)
          .then(function (cursorResult) {
            resolve(cursorResult);
          })
          .catch(function (err) {
            Logger.error("common.service.GetFlows : " + err);
            reject(err);
          });
      })
      .catch(function (err) {
        Logger.error("common.service.GetFlows : " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}

function getAllDni(accId, type, flowid) {
  /* Cp_get_all_dni_Prc(n_acc_Id_In In Number,
                         n_Type_In   In Number,
                         Res_Cur_Out Out Sys_Refcursor) Is

  --n_Type_In=1 For flow activation case
  --n_Type_In=2 For c2c outbound call case
*/
  let dbConnection;
  let sql = `BEGIN
  Cp_get_all_dni_Prc(:n_acc_Id_In,:n_flowid_in,:n_Type_In,:Res_Cur_Out);
END;`;

  let bindParams = {
    n_acc_Id_In: accId,
    n_flowid_in: flowid,
    n_Type_In: type,
    Res_Cur_Out: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
  };

  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;
        oracleConnection
          .getCursorData(result.dbResult.outBinds.Res_Cur_Out, 1000)
          .then(function (cursorResult) {
            resolve(cursorResult);
          })
          .catch(function (err) {
            Logger.error("common.service.getAllDni 1 : " + err);
            reject(err);
          });
      })
      .catch(function (err) {
        Logger.error("common.service.getAllDni 2 : " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}
function GetCirclebyDNIforReport(dni, accid) {
  let dbConnection;
  let sql = `BEGIN
  Cp_circle_dni_out_Prc(:v_dni_In,:n_account_id_in,:v_circle_key_out,:n_sts_out);
  END;`;

  let bindParams = {
    v_dni_In: dni,
    n_account_id_in: accid,
    v_circle_key_out: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
    n_sts_out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };
  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(async function (result) {
        dbConnection = result.dbConnection;
        resultOut = {
          status: result.dbResult.outBinds.n_sts_out,
          circle: result.dbResult.outBinds.v_circle_key_out,
        };
        resolve(resultOut);
      })
      .catch(function (err) {
        Logger.error("common-service.GetCirclebyDNIforReport : " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}
function CallTransfer(calldetails, loc) {
  // let dbConnection;
  let sql = `BEGIN
  cp_c2c_call_transfer_prc(:v_json_in,:n_Status_Out,:v_Status_Out);
  END;`;

  let bindParams = {
    v_json_in: JSON.stringify(calldetails),
    n_Status_Out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
    v_Status_Out: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
  };
  return locationDBops
    .executeDBProcedure(loc, sql, bindParams)
    .then((result) => {
      return {
        status: result.outBinds.n_Status_Out,
        message: result.outBinds.v_Status_Out,
      };
    })
    .catch(function (err) {
      Logger.error("common-service.CallTransfer() : " + err);
      throw(err);
    });
  // let connectionstring = dbConfig.database[db_location];

  // return new Promise(async function (resolve, reject) {
  //   await oracleConnection
  //     .createpoolLocation(connectionstring)
  //     .catch((error) => {
  //       console.log(error);
  //       reject(error);
  //     });
  //   oracleConnection
  //     .executeProcedure(connectionstring.poolAlias, sql, bindParams)
  //     .then(function (result) {
  //       dbConnection = result.dbConnection;

  //       resolve({
  //         status: result.dbResult.outBinds.n_Status_Out,
  //         message: result.dbResult.outBinds.v_Status_Out,
  //       });
  //     })
  //     .catch(function (err) {
  //       Logger.error("common-service.CallTransfer() : " + err);
  //       reject(err);
  //     });
  // }).finally(function () {
  //   oracleConnection.connRelease(dbConnection);
  // });
}

function GetReportstatus() {
  /*cp_load_default_Tabls_prc(ref_cur out sys_refcursor*/
  let dbConnection;

  let sql = `BEGIN
  cp_load_default_Tabls_prc(:ref_cur);
END;`;

  let bindParams = {
    ref_cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
  };
  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;
        oracleConnection
          .getCursorData(result.dbResult.outBinds.ref_cur, 1000)
          .then(function (cursorResult) {
            resolve(cursorResult);
          })
          .catch(function (err) {
            Logger.error("Error in GetReportstatus 01: " + err);
            reject(err);
          });
      })
      .catch(function (err) {
        Logger.error("Error in GetReportstatus 02: " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}

module.exports.GetAccounts = GetAccounts;
module.exports.GetServices = GetServices;
module.exports.GetObjectList = GetObjectList;
module.exports.GetServiceNumbersbyflowid = GetServiceNumbersbyflowid;
module.exports.GetCircle = GetCircle;
module.exports.GetCirclebyDNI = GetCirclebyDNI;
module.exports.GetFlows = GetFlows;
module.exports.GetAccountSettings = GetAccountSettings;
module.exports.getAllDni = getAllDni;
module.exports.GetCirclebyDNIforReport = GetCirclebyDNIforReport;
module.exports.CallTransfer = CallTransfer;
module.exports.GetReportstatus = GetReportstatus;
