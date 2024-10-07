const oracledb = require("oracledb");
const oraclehelperdb = require("../_helpers/oracle-service");
const oracleConnection = require("../database/oracle-connection");
const { Logger } = require("../_helpers/logger");
const appconfig = require("../_config/appconfig.json");
//const db_cpaasweb = appconfig.database.cpaas_web;
const dbConfig = require("../_helpers/customConfig");
var db_cpaasweb = dbConfig.database.cpaas_web;
const locationDBops = require("../database/location-dbops");

function setFlag(
  accountid,
  userid,
  c2cflag,
  dtmfflag,
  wraptime,
  c2cdialtimeout,
  recordingFlag
) {
  /**  cp_account_configuration_prc(n_acc_id_in              in number,
                                                         n_user_id_in             in number,
                                                         n_c2c_agent_base_flag_in in number,
                                                         n_send_dtmf_flg_in in number,
                                                         n_record_b4_dial
                                                                                            out number) is */
  let dbConnection;
  let sql = `BEGIN
  cp_account_configuration_prc(:n_acc_id_in,:n_user_id_in,:n_c2c_agent_base_flag_in,:n_send_dtmf_flg_in,:n_wrap_time_in,:n_c2c_dial_timeout_in,:n_record_b4_dial,:n_status_out);
  END;`;
  let bindParams = {
    n_acc_id_in: accountid,
    n_user_id_in: userid,
    n_c2c_agent_base_flag_in: c2cflag ? 1 : 0,
    n_send_dtmf_flg_in: dtmfflag ,
    n_wrap_time_in: wraptime,
    n_c2c_dial_timeout_in: c2cdialtimeout,
    n_record_b4_dial:recordingFlag,
    n_status_out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };
  return new Promise(async function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;
        resolve({
          status: result.dbResult.outBinds.n_status_out,
        });
      })
      .catch(function (err) {
        Logger.error("configuration-service.setFlag() 1: " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}

function setFlaginLocation(accountid, userid, c2cflag, c2cdialtimeout, loc,recordingFlag) {
  /**  cp_account_configuration_prc(n_acc_id_in              in number,
                                                         n_user_id_in             in number,
                                                         n_c2c_agent_base_flag_in in number,
                                                         n_c2c_dial_timeout_in    in number,
                                                         n_record_b4_dial
                                                          n_status_out out number) */
  let sql = `BEGIN
  cp_account_configuration_prc(:n_acc_id_in,:n_user_id_in,:n_c2c_agent_base_flag_in,:n_c2c_dial_timeout_in,:n_record_b4_dial,:n_status_out);
  END;`;
  let bindParams = {
    n_acc_id_in: accountid,
    n_user_id_in: userid,
    n_c2c_agent_base_flag_in: c2cflag ? 1 : 0,
    n_c2c_dial_timeout_in: c2cdialtimeout,
    n_record_b4_dial:recordingFlag,
    n_status_out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };
  // let connectionString = dbConfig.database[loc];

  // return new Promise(async function (resolve, reject) {
  //   await oracleConnection
  //     .createpoolLocation(connectionString)
  //     .catch(function (e) {
  //       reject(e);
  //     });
  //   oracleConnection
  //     .executeProcedure(connectionString.poolAlias, sql, bindParams)
  //     .then(function (result) {
  //       dbConnection = result.dbConnection;

  //       resolve({
  //         status: result.dbResult.outBinds.n_status_out,
  //       });
  //     })
  //     .catch(function (err) {
  //       Logger.error("configuration-service.setFlaginLocation() 1: " + err);
  //       reject(err);
  //     });
  // })
  // .finally(function () {
  //   oracleConnection.connRelease(dbConnection);
  // });
  locationDBops
    .executeDBProcedure(loc, sql, bindParams)
    .then((result) => {
      return result.outBinds.n_status_out;
    })
    .catch(function (err) {
      Logger.error("configuration-service.setFlaginLocation() 1: " + err);
      throw err;
    });
}

function checkFlag(accountid) {
  /** cp_account_configuration_out_prc(n_account_id        in number,
                                                             n_c2c_base_flag_out out number,
                                                             n_send_dtmf_flg_out out number)
                                                             n_record_b4_dial_out is */
  let dbConnection;
  let sql = `BEGIN
  cp_account_configuration_out_prc(:n_account_id,:n_c2c_base_flag_out,:n_send_dtmf_flg_out,:n_wrap_time_out,:n_record_b4_dial_out,:n_c2c_dial_timeout);
  END;`;
  let bindParams = {
    n_account_id: accountid,
    n_c2c_base_flag_out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
    n_send_dtmf_flg_out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
    n_wrap_time_out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
    n_record_b4_dial_out:{type: oracledb.NUMBER, dir: oracledb.BIND_OUT},
    n_c2c_dial_timeout: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
   
  };

  return new Promise(async function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;
        resolve({
          c2cflag:
            result.dbResult.outBinds.n_c2c_base_flag_out == 1 ? true : false,
          senddtmfFlag:
            result.dbResult.outBinds.n_send_dtmf_flg_out,
          wraptime: result.dbResult.outBinds.n_wrap_time_out,
          recordflag:result.dbResult.outBinds.n_record_b4_dial_out,
          c2cdialtimeout: result.dbResult.outBinds.n_c2c_dial_timeout,
        });
      })
      .catch(function (err) {
        Logger.error("configuration-service.checkFlag() 1: " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}

function getobdConfiguration(accid) {
  /*  Cp_C2C_Get_Api_Configuration_Prc(n_Acc_Id_In    In Number,
                                       v_Api_Conf_Cur Out Sys_Refcursor,
                                       n_Status_Out   Out Number) Is
  */
  let dbConnection;
  let sql = `BEGIN
   Cp_OBD_Get_Api_Configuration_Prc(:n_Acc_Id_In,:v_Api_Conf_Cur,:n_Status_Out);
  END;`;

  let bindParams = {
    n_Acc_Id_In: accid,
    v_Api_Conf_Cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
    n_Status_Out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };
  //console.log(bindParams,"b1");
  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        //  console.log(result,"b2");
        dbConnection = result.dbConnection;

        oracleConnection
          .getCursorData(result.dbResult.outBinds.v_Api_Conf_Cur, 500)
          .then(function (cursorResult) {
            //console.log(cursorResult,"cr");
            resolve({
              status: result.dbResult.outBinds.n_Status_Out,
              ctc_config: cursorResult,
            });
          })
          .catch(function (err) {
            Logger.error("configService.getobdConfiguration() : " + err);
            reject(err);
          });
      })
      .catch(function (err) {
        Logger.error("configService.getobdConfiguration() : " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}

function getPullReportConfiguration(accid) {
  /*  Cp_C2C_Get_Api_Configuration_Prc(n_Acc_Id_In    In Number,
                                       v_Api_Conf_Cur Out Sys_Refcursor,
                                       n_Status_Out   Out Number) Is
  */
  let dbConnection;
  let sql = `BEGIN
  Cp_Get_pull_report_Api_Config_Prc(:n_Acc_Id_In,:v_Api_Conf_Cur,:n_Status_Out);
  END;`;

  let bindParams = {
    n_Acc_Id_In: accid,
    v_Api_Conf_Cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
    n_Status_Out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;
        oracleConnection
          .getCursorData(result.dbResult.outBinds.v_Api_Conf_Cur, 500)
          .then(function (cursorResult) {
            resolve({
              status: result.dbResult.outBinds.n_Status_Out,
              ctc_config: cursorResult,
            });
          })
          .catch(function (err) {
            Logger.error("configService.getPullReportConfiguration() : " + err);
            reject(err);
          });
      })
      .catch(function (err) {
        Logger.error("configService.getPullReportConfiguration() : " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}
function configureobd(obd_jsonString) {
  let dbConnection;
  let sql = `BEGIN
  cp_obd_api_configure_prc(:v_json_in,:n_status_out);
    END;`;

  let bindParams = {
    v_json_in: obd_jsonString,
    n_status_out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };
   //console.log(bindParams, "bp");
  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;
     //    console.log(result.dbResult.outBinds.n_status_out,"111");
        resolve({ status: result.dbResult.outBinds.n_status_out });
      })
      .catch(function (err) {
        Logger.error("configService.configureobd() : " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}
function pullreportconfigure(pullreport_jsonString) {
  let dbConnection;
  let sql = `
    BEGIN
      cp_pull_report_configure_prc(:v_json_in, :n_status_out);
    END;`;

  let bindParams = {
    v_json_in: {
      val: pullreport_jsonString,
      type: oracledb.DB_TYPE_VARCHAR,
      maxSize: 4000,
      dir: oracledb.BIND_IN,
    },
    n_status_out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;
        // console.log(result.dbResult.outBinds.n_status_out, "pullq1");
        resolve({ status: result.dbResult.outBinds.n_status_out });
      })
      .catch(function (err) {
        Logger.error("configService.pullreportconfigure() : " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}
function ttsconfigure(accid, tts_json, userid, config_type) {
  /**cp_tts_configuration_prc(n_acc_id     in number,
                                                     n_user_id_in in number,
                                                     v_json_in    in varchar2,
                                                     n_status_out out number) is 
                                                     
                                                     //1.80
                                                     cp_tts_configuration_prc(n_acc_id      in number,
                                                     n_user_id_in  in number,
                                                     v_json_in     in varchar2,
                                                     n_config_type in number,
                                                     n_status_out  out number) is*/
  let dbConnection;
  let sql = `BEGIN
  cp_tts_configuration_prc(:n_acc_id,:n_user_id_in,:v_json_in,:n_config_type,:n_status_out);
    END;`;

  let bindParams = {
    n_acc_id: accid,
    n_user_id_in: userid,
    v_json_in: JSON.stringify(tts_json),
    n_config_type: config_type,
    n_status_out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  return new Promise(async function (resolve, reject) {
    await oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;

        resolve({ status: result.dbResult.outBinds.n_status_out });
      })
      .catch(function (err) {
        Logger.error("configService.ttsconfigure() : " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}

function ttsconfigureinLocation(accid, tts_json, userid, loc, config_type) {
  /**cp_tts_configuration_prc(n_acc_id     in number,
                                                     n_user_id_in in number,
                                                     v_json_in    in varchar2,
                                                     n_status_out out number) is */
  let sql = `BEGIN
  cp_tts_configuration_prc(:n_acc_id,:n_user_id_in,:v_json_in,:n_config_type,:n_status_out);
    END;`;

  let bindParams = {
    n_acc_id: accid,
    n_user_id_in: userid,
    v_json_in: JSON.stringify(tts_json),
    n_config_type: config_type,
    n_status_out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  // let connectionString = dbConfig.database[loc];

  // return new Promise(async function (resolve, reject) {
  //   await oracleConnection.createpoolLocation(connectionString);

  //   oracleConnection
  //     .executeProcedure(connectionString.poolAlias, sql, bindParams)
  //     .then(function (result) {
  //       dbConnection = result.dbConnection;

  //       resolve(result.dbResult.outBinds.n_status_out);
  //     })
  //     .catch(function (err) {
  //       Logger.error("configService.ttsconfigureinLocation() : " + err);
  //       reject(err);
  //     });
  // })
  // .finally(function () {
  //   oracleConnection.connRelease(dbConnection);
  // });
  locationDBops
    .executeDBProcedure(loc, sql, bindParams)
    .then((result) => {
      return result.outBinds.n_status_out;
    })
    .catch(function (err) {
      Logger.error("configService.ttsconfigureinLocation() : " + err);
      throw err;
    });
}

function schemareportconfigure(schemareport_jsonString) {
  let dbConnection;
  let sql = `BEGIN
  cp_schema_api_configure_prc(:v_json_in,:n_status_out);
    END;`;

  let bindParams = {
    v_json_in: schemareport_jsonString,
    n_status_out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };
  //console.log(bindParams, "bpscheme");
  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;
        //console.log(result.dbResult.outBinds.n_status_out, "schemaq1");
        resolve({ status: result.dbResult.outBinds.n_status_out });
      })
      .catch(function (err) {
        Logger.error("configService.schemareportconfigure : " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}
function GetSchemaaConfiguration(accid) {
  /*  Cp_C2C_Get_Api_Configuration_Prc(n_Acc_Id_In    In Number,
                                       v_Api_Conf_Cur Out Sys_Refcursor,
                                       n_Status_Out   Out Number) Is
  */
  let dbConnection;
  let sql = `BEGIN
  Cp_Get_Schema_Api_Config_Prc(:n_Acc_Id_In,:v_Api_Conf_Cur,:n_Status_Out);
  END;`;

  let bindParams = {
    n_Acc_Id_In: accid,
    v_Api_Conf_Cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
    n_Status_Out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };
  // console.log(bindParams, "schemaqwer");
  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;
        oracleConnection
          .getCursorData(result.dbResult.outBinds.v_Api_Conf_Cur, 500)
          .then(function (cursorResult) {
            resolve({
              status: result.dbResult.outBinds.n_Status_Out,
              ctc_config: cursorResult,
            });
          })
          .catch(function (err) {
            Logger.error("configService.GetSchemaaConfiguration() : " + err);
            reject(err);
          });
      })
      .catch(function (err) {
        Logger.error("configService.GetSchemaaConfiguration() : " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}

function GetTTSConfiguration(accid) {
  /*  cp_tts_configuration_out_prc(n_acc_id    in number,
                                                         v_json_out  out varchar2,
                                                         n_status_out out number) is
  */
  let dbConnection;
  let sql = `BEGIN
  cp_tts_configuration_out_prc(:n_acc_id,:v_json_out,:n_status_out);
  END;`;

  let bindParams = {
    n_acc_id: accid,
    v_json_out: {
      type: oracledb.STRING,
      dir: oracledb.BIND_OUT,
      maxSize: 4000,
    },
    n_status_out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;

        resolve({
          status: result.dbResult.outBinds.n_status_out,
          tts: result.dbResult.outBinds.v_json_out,
        });
      })
      .catch(function (err) {
        Logger.error("configService.GetTTSConfiguration() : " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}
function GetSTTConfiguration(accid) {
  /*  cp_stt_configuration_out_prc(n_acc_id => :n_acc_id,
                               v_json_out => :v_json_out,
                               n_status_out => :n_status_out);
  */
  let dbConnection;
  let sql = `BEGIN
  cp_stt_configuration_out_prc(:n_acc_id,:v_json_out,:n_status_out);
  END;`;

  let bindParams = {
    n_acc_id: accid,
    v_json_out: {
      type: oracledb.STRING,
      dir: oracledb.BIND_OUT,
      maxSize: 4000,
    },
    n_status_out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  //  console.log("bindParams GetSTTConfiguration",bindParams);

  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;
        // console.log("GetSTTConfiguration",{
        //   status: result.dbResult.outBinds.n_status_out,
        //   stt: result.dbResult.outBinds.v_json_out,
        // });
        resolve({
          status: result.dbResult.outBinds.n_status_out,
          stt: result.dbResult.outBinds.v_json_out,
        });
      })
      .catch(function (err) {
        Logger.error("configService.GetSTTConfiguration() : " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}
function obdtymConfiguration(obdconfig) {
  /**cp_account_time_configure_prc(v_json_in varchar2(500),
                                                           n_status_out out number) is*/
  let dbConnection;
  let sql = `BEGIN
  cp_account_time_configure_prc(:v_json_in,:n_status_out);
    END;`;

  let bindParams = {
    v_json_in: JSON.stringify(obdconfig),
    n_status_out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };
  // console.log("bindParams",bindParams);

  return new Promise(async function (resolve, reject) {
    await oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;
        //  console.log("result",{ status: result.dbResult.outBinds.n_status_out });
        resolve({ status: result.dbResult.outBinds.n_status_out });
      })
      .catch(function (err) {
        Logger.error("configService.obdtymConfiguration() : " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}
function obdtymConfigurationinLocation(loc, obdconfig) {
  /**cp_account_time_configure_prc(v_json_in varchar2(500),
                                                           n_status_out out number) */
  // let dbConnection;
  let sql = `BEGIN
  cp_account_time_configure_prc(:v_json_in,:n_status_out);
    END;`;

  let bindParams = {
    v_json_in: JSON.stringify(obdconfig),
    n_status_out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  // let connectionString = dbConfig.database[loc];

  // return new Promise(async function (resolve, reject) {
  //   await oracleConnection.createpoolLocation(connectionString);

  //   oracleConnection
  //     .executeProcedure(connectionString.poolAlias, sql, bindParams)
  //     .then(function (result) {
  //       dbConnection = result.dbConnection;

  //       resolve(result.dbResult.outBinds.n_status_out);
  //     })
  //     .catch(function (err) {
  //       Logger.error("configService.obdtymConfigurationinLocation() : " + err);
  //       reject(err);
  //     });
  // })
  // .finally(function () {
  //   oracleConnection.connRelease(dbConnection);
  // });
  locationDBops
    .executeDBProcedure(loc, sql, bindParams)
    .then((result) => {
      return result.outBinds.n_status_out;
    })
    .catch(function (err) {
      Logger.error("configService.obdtymConfigurationinLocation() : " + err);
      throw(err);
    });
}
function GetobdtymConfiguration(accid) {
  /*  cp_account_time_rebind_prc (
    n_account_id_in IN NUMBER,
   v_json_out  out varchar2
)
  */
  //
  let dbConnection;
  let sql = `BEGIN
  cp_account_time_rebind_prc(:n_account_id_in,:v_json_out);
  END;`;

  let bindParams = {
    n_account_id_in: accid,
    v_json_out: {
      type: oracledb.STRING,
      dir: oracledb.BIND_OUT,
      maxSize: 5000,
    },
  };
  // console.log("bindParams",bindParams);
  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;
        // console.log("result",{
        // time:JSON.parse(result.dbResult.outBinds.v_json_out),
        // });
        resolve({
          time: JSON.parse(result.dbResult.outBinds.v_json_out),
        });
      })
      .catch(function (err) {
        Logger.error("configService.GetobdtymConfiguration() : " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}
module.exports.checkFlag = checkFlag;
module.exports.setFlag = setFlag;
module.exports.getobdConfiguration = getobdConfiguration;
module.exports.configureobd = configureobd;
module.exports.pullreportconfigure = pullreportconfigure;
module.exports.getPullReportConfiguration = getPullReportConfiguration;
module.exports.schemareportconfigure = schemareportconfigure;
module.exports.GetSchemaaConfiguration = GetSchemaaConfiguration;
module.exports.ttsconfigure = ttsconfigure;
module.exports.GetTTSConfiguration = GetTTSConfiguration;
module.exports.ttsconfigureinLocation = ttsconfigureinLocation;
module.exports.setFlaginLocation = setFlaginLocation;
module.exports.GetSTTConfiguration = GetSTTConfiguration;
module.exports.obdtymConfiguration = obdtymConfiguration;
module.exports.obdtymConfigurationinLocation = obdtymConfigurationinLocation;
module.exports.GetobdtymConfiguration = GetobdtymConfiguration;
