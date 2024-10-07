const oracledb = require("oracledb");
const oraclehelperdb = require("../_helpers/oracle-service");
const oracleConnection = require("../database/oracle-connection");
const { Logger } = require("../_helpers/logger");
const moment = require("moment");

const dbConfig = require("../_helpers/customConfig");
var db_cpaasweb = dbConfig.database.cpaas_web;
const locationDBops = require("../database/location-dbops");

async function getIncomingCallLog(
  loc,
  filterData,
  user,
  flagdownldrecord,
  resp
) {
  /*  
    Cp_Ivr_incoming_Call_Report_Prc(n_Account_Id_In   In Number, --*
                                                            n_Flowid_in       in number,
                                                            n_Role_Id_In      In Number,
                                                            n_userid_in       in number,
                                                            v_Date_In         In Varchar2, --*
                                                            n_flag_in         In number default 1, --record file--
                                                            v_Search_Key_in   in Varchar2,
                                                            v_ivr_numbers_in  in varchar2,
                                                            v_Search_Value_in in Varchar2,
                                                            n_Status_Out      Out Number,
                                                            Ref_Cur           Out Sys_Refcursor) Is
*/
  let sql = `BEGIN
  cp_ivr_incoming_call_report_prc(:n_Account_Id_In,:n_Flowid_in,:n_Role_Id_In,:n_userid_in,:v_Date_In,
    :n_flag_in,:v_Search_Key_in,:v_ivr_numbers_in,:v_Search_Value_in,:n_Status_Out,:Ref_Cur);
END;`;

  let bindParams = {
    n_Account_Id_In: filterData.AccountId,
    n_Flowid_in: filterData.FlowId,
    n_Role_Id_In: user.role,
    n_userid_in: user.userid,
    v_Date_In:
      filterData.FromDate.toString() + " - " + filterData.ToDate.toString(),
    n_flag_in: flagdownldrecord,
    v_Search_Key_in: filterData.SearchKey,
    v_ivr_numbers_in: filterData.dni.includes("0")
      ? "-1"
      : filterData.dni.toString(),
    v_Search_Value_in: filterData.SearchValue,
    n_Status_Out: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
    Ref_Cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
  };
  let exeOptions = {
    prefetchRows: 1000,
    fetchArraySize: 1000,
    outFormat: oracledb.OBJECT,
  };
  await locationDBops
    .executeDBStreaming(loc, sql, bindParams, "Ref_Cur", exeOptions, resp)
    .catch(function (err) {
      return resp.status(500).json({ status: 500, message: err });
    });

  //let connectionstring = dbConfig.database[loc];

  // return new Promise(async function (resolve, reject) {
  //   await oracleConnection
  //     .createpoolLocation(connectionstring)
  //     .catch((error) => {
  //       console.log(error);
  //       reject(error);
  //     });

  //   oracleConnection
  //     .executeProcedure(connectionstring.poolAlias, sql, bindParams, exeOptions)
  //     .then(async function (result) {
  //       dbConnection = result.dbConnection;
  //       count = result.dbResult.outBinds.n_count_out;
  //       if (count > 5000 && flag == 1) {
  //         oracleConnection.connRelease(dbConnection);
  //         resolve({ count });
  //       } else if (count < 5000 || flag == 2) {
  //         const cursor = result.dbResult.outBinds.Ref_Cur;
  //         const queryStream = cursor.toQueryStream();
  //         resolve({ queryStream, dbConnection, count });
  //       }
  //     })
  //     .catch(function (err) {
  //       Logger.error("reportService.getIncomingCallLog() : " + err);
  //       reject(err);
  //     });
  // }).finally(function () {
  //   // oracleConnection.connRelease(dbConnection);
  // });
}

function getIncomingCalllogDownload(loc, filterData, user) {
  /*   Cp_Ivr_incoming_Call_Report_Prc(n_Account_Id_In   In Number,
                                                            n_Flowid_in       in number,
                                                            n_Role_Id_In      In Number,
                                                            v_Date_In         In Varchar2,
                                                            v_Search_Key_in   in Varchar2,
                                                            v_Search_Value_in Varchar2,
                                                            n_Status_Out      Out Number,
                                                            Ref_Cur           Out Sys_Refcursor)
*/

  let dbConnection;
  let sql = `BEGIN
Cp_Ivr_incoming_Call_Report_dwnload_Prc(:n_Account_Id_In,:n_Flowid_in,:n_Role_Id_In,:n_userid_in,:v_Date_In,
  :v_Search_Key_in,:v_Search_Value_in,:n_Status_Out,:Ref_Cur);
END;`;

  let bindParams = {
    n_Account_Id_In: filterData.AccountId,
    n_userid_in: user.userid,
    n_Flowid_in: filterData.FlowId,
    n_Role_Id_In: user.role,
    v_Date_In:
      filterData.FromDate.toString() + " - " + filterData.ToDate.toString(),
    v_Search_Key_in: filterData.SearchKey,
    v_Search_Value_in: filterData.SearchValue,
    n_Status_Out: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
    Ref_Cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
  };

  let exeOptions = {
    prefetchRows: 1000,
    fetchArraySize: 1000,
    outFormat: oracledb.OBJECT,
  };

  let connectionstring = dbConfig.database[loc];

  return new Promise(async function (resolve, reject) {
    await oracleConnection
      .createpoolLocation(connectionstring)
      .catch((error) => {
        console.log(error);
        reject(error);
      });
    oracleConnection
      .executeProcedure(connectionstring.poolAlias, sql, bindParams, exeOptions)
      .then(async function (result) {
        dbConnection = result.dbConnection;

        const cursor = result.dbResult.outBinds.Ref_Cur;
        const queryStream = cursor.toQueryStream();
        resolve({ queryStream, dbConnection });
      })
      .catch(function (err) {
        Logger.error("reportService.getIncomingCalllogDownload() : " + err);
        reject(err);
      });
  }).finally(function () {
    // oracleConnection.connRelease(dbConnection);
  });
}

function getIncomingCallHierarchy(loc, filterData, user) {
  /*Cp_Ivr_incoming_hierarchy_Report_Prc(n_Account_Id_In   In Number,
                                         n_Flowid_in       in number,
                                         n_Role_Id_In      In Number,
                                         n_userid_in       in number,
                                         v_Date_In         In Varchar2,
                                         v_Search_Key_in   in Varchar2,
                                         v_Role_name_in  in Varchar2,
                                         v_Search_Value_in Varchar2,
                                         n_Status_Out      Out Number,
                                         Ref_Cur           Out Sys_Refcursor)
    */

  let dbConnection;
  let sql = `BEGIN
  Cp_Ivr_incoming_hierarchy_Report_Prc(:n_Account_Id_In,:n_Flowid_in,:n_Role_Id_In,:n_userid_in,:v_Date_In,
    :v_Search_Key_in,:v_Role_name_in,:v_Search_Value_in,:n_Status_Out,:Ref_Cur);
END;`;

  let bindParams = {
    n_Account_Id_In: filterData.AccountId,
    n_Flowid_in: filterData.FlowId,
    n_Role_Id_In: user.role,
    n_userid_in: filterData.UserRole,
    v_Date_In:
      filterData.FromDate.toString() + " - " + filterData.ToDate.toString(),
    v_Search_Key_in: filterData.SearchKey,
    v_Role_name_in: filterData.UserRole,
    v_Search_Value_in: filterData.SearchValue,
    n_Status_Out: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
    Ref_Cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
  };
  let exeOptions = {
    prefetchRows: 500,
    fetchArraySize: 500,
    outFormat: oracledb.OBJECT,
  };
  let connectionstring = dbConfig.database[loc];

  return new Promise(async function (resolve, reject) {
    await oracleConnection
      .createpoolLocation(connectionstring)
      .catch((error) => {
        console.log(error);
        reject(error);
      });
    oracleConnection
      .executeProcedure(connectionstring.poolAlias, sql, bindParams, exeOptions)
      .then(async function (result) {
        dbConnection = result.dbConnection;
        const cursor = result.dbResult.outBinds.Ref_Cur;

        const queryStream = cursor.toQueryStream();
        resolve({ queryStream, dbConnection });
      })
      .catch(function (err) {
        console.log("reportService.getIncomingCallHierarchy() 02 : " + err);
        Logger.error("reportService.getIncomingCallHierarchy() : " + err);
        reject(err);
      });
  }).finally(function () {
    // oracleConnection.connRelease(dbConnection);
  });
}

//filterBy
function getFilterBy(filterData, user) {
  let dbConnection;
  let sql = `BEGIN
  cpaas_get_role_name_prc(:n_user_id_in,:n_Flowid_in,:Ref_Cur);
END;`;

  let bindParams = {
    n_user_id_in: user.userid,
    n_Flowid_in: filterData.FlowId,

    Ref_Cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
  };

  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;
        oracleConnection
          .getCursorData(result.dbResult.outBinds.Ref_Cur, 500)
          .then(function (cursorResult) {
            resolve(cursorResult);
          })
          .catch(function (err) {
            Logger.error("reportService.getFilterBy() : " + err);
            reject(err);
          });
      })
      .catch(function (err) {
        Logger.error("reportService.getFilterBy() 02: " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}

async function getOutboundCallLog(
  loc,
  filterData,
  user,
  flagdownldrecord,
  resp
) {
  /*Cp_Ivr_outbound_Call_Report_Prc(n_Account_Id_In   In Number,
                                                            n_Flowid_in       in number,
                                                            n_Role_Id_In      In Number,
                                                            n_userid_in       in number,
                                                            n_campaign_id_in  in number,
                                                            v_Date_In         In Varchar2,
                                                            v_Search_Key_in   in Varchar2,
                                                            v_Search_Value_in Varchar2,
                                                            n_Status_Out      Out Number,
                                                            Ref_Cur           Out Sys_Refcursor)
   Cp_Ivr_outbound_Call_Report_Prc(n_Account_Id_In   In Number,
                                                            n_Flowid_in       in number,
                                                            n_Role_Id_In      In Number,
                                                            n_userid_in       in number,
                                                            n_campaign_id_in  in number,
                                                            v_Date_In         In Varchar2,
                                                            v_Search_Key_in   in Varchar2,
                                                            v_ivr_numbers_in  in varchar2,
                                                            v_Search_Value_in Varchar2,
                                                            n_Status_Out      Out Number,
                                                            Ref_Cur           Out Sys_Refcursor) Is
*/
  // let dbConnection;
  let sql = `BEGIN
  Cp_Ivr_outbound_Call_Report_Prc(:n_Account_Id_In, :n_Flowid_in,:n_Role_Id_In,:n_userid_in,:n_campaign_id_in,:v_Date_In,
    :n_flag_in,:v_Search_Key_in,:v_ivr_numbers_in,:v_Search_Value_in,:n_Status_Out,:Ref_Cur);
END;`;
  let bindParams = {
    n_Account_Id_In: filterData.AccountId,
    n_Flowid_in: filterData.FlowId,
    n_Role_Id_In: user.role,
    n_userid_in: user.userid,
    n_campaign_id_in: filterData.CampaignId,
    v_Date_In:
      filterData.FromDate.toString() + " - " + filterData.ToDate.toString(),
    n_flag_in: flagdownldrecord,
    v_Search_Key_in: filterData.SearchKey,
    v_ivr_numbers_in: filterData.dni.includes("0")
      ? "-1"
      : filterData.dni.toString(),
    v_Search_Value_in: filterData.SearchValue,
    n_Status_Out: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
    Ref_Cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
  };
  let exeOptions = {
    prefetchRows: 1000,
    fetchArraySize: 1000,
    outFormat: oracledb.OBJECT,
  };
  // let connectionstring = dbConfig.database[loc];
  // return new Promise(async function (resolve, reject) {
  //   await oracleConnection
  //     .createpoolLocation(connectionstring)
  //     .catch((error) => {
  //       console.log(error);
  //       reject(error);
  //     }); //added
  //   oracleConnection
  //     .executeProcedure(connectionstring.poolAlias, sql, bindParams)
  //     .then(function (result) {
  //       dbConnection = result.dbConnection;
  //       count = result.dbResult.outBinds.n_count_out;
  //       if (count > 5000 && flag == 1) {
  //         oracleConnection.connRelease(dbConnection);
  //         resolve({ count });
  //       } else if (count < 5000 || flag == 2) {
  //         const cursor = result.dbResult.outBinds.Ref_Cur;
  //         const queryStream = cursor.toQueryStream();
  //         resolve({ queryStream, dbConnection });
  //       }
  //     })
  //     .catch(function (err) {
  //       Logger.error("reportService.getOutboundCallLog() : " + err);
  //       reject(err);
  //     });
  // }).finally(function () {
  //   // oracleConnection.connRelease(dbConnection);
  // });
  await locationDBops
    .executeDBStreaming(loc, sql, bindParams, "Ref_Cur", exeOptions, resp)
    .catch(function (err) {
      return resp.status(500).json({ status: 500, message: err });
    });
}

//getoutboundcallhierarchy
function getOutboundCallHierarchy(loc, filterData, user) {
  /* Cp_Ivr_outbound_hierarchy_Report_Prc(n_Account_Id_In   In Number,
                                           n_Flowid_in       in number,
                                            n_Role_Id_In      In Number,
                                                n_userid_in       in number,
                                              v_Date_In         In Varchar2,
                                           v_Search_Key_in   in Varchar2,
                                          v_Role_name_in    in Varchar2,
                                            v_Search_Value_in Varchar2,
                                              n_Status_Out      Out Number,
                                            Ref_Cur           Out Sys_Refcursor) Is



                            Cp_Ivr_outbound_hierarchy_Report_Prc(n_Account_Id_In   In Number,
                                                                 n_Flowid_in       in number,
                                                                 n_Role_Id_In      In Number,
                                                                 n_userid_in       in number,
                                                                 n_campaign_id_in  in number,
                                                                 v_Date_In         In Varchar2,
                                                                 v_Search_Key_in   in Varchar2,
                                                                 v_Role_name_in    in Varchar2,
                                                                 v_Search_Value_in Varchar2,
                                                                 n_Status_Out      Out Number,
                                                                 Ref_Cur           Out Sys_Refcursor)
 
 */
  let dbConnection;
  let sql = `BEGIN
  Cp_Ivr_outbound_hierarchy_Report_Prc(:n_Account_Id_In,:n_Flowid_in,:n_Role_Id_In,:n_userid_in,:n_campaign_id_in,:v_Date_In,
:v_Search_Key_in,:v_Role_name_in,:v_Search_Value_in,:n_Status_Out,:Ref_Cur);
END;`;

  let bindParams = {
    n_Account_Id_In: filterData.AccountId,
    n_Flowid_in: filterData.FlowId,
    n_Role_Id_In: user.role,
    n_userid_in: user.userid,
    n_campaign_id_in: filterData.CampaignId,
    v_Date_In:
      filterData.FromDate.toString() + " - " + filterData.ToDate.toString(),
    v_Search_Key_in: filterData.SearchKey,
    v_Role_name_in: filterData.UserRole,
    v_Search_Value_in: filterData.SearchValue,
    n_Status_Out: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
    Ref_Cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
  };
  let exeOptions = {
    prefetchRows: 1000,
    fetchArraySize: 1000,
    outFormat: oracledb.OBJECT,
  };
  let connectionstring = dbConfig.database[loc];

  return new Promise(async function (resolve, reject) {
    await oracleConnection
      .createpoolLocation(connectionstring)
      .catch((error) => {
        console.log(error);
        reject(error);
      });
    oracleConnection
      .executeProcedure(connectionstring.poolAlias, sql, bindParams, exeOptions)
      .then(async function (result) {
        dbConnection = result.dbConnection;
        const cursor = result.dbResult.outBinds.Ref_Cur;

        const queryStream = cursor.toQueryStream();
        resolve({ queryStream, dbConnection });
      })
      .catch(function (err) {
        console.log("reportService.getOutboundCallHierarchy() 02 : " + err);
        Logger.error("reportService.getOutboundCallHierarchy() : " + err);
        reject(err);
      });
  }).finally(function () {
    // oracleConnection.connRelease(dbConnection);
  });
}

//getFeedback

function getFeedback(filterData, user, isdownload) {
  /*   cp_get_form_answer_dtls(n_Account_Id_In   in number,
                                                    n_Role_Id_In      in number,
                                                    n_userid_in       in number,
                                                    n_form_id         IN NUMBER,
                                                    n_flow_id         IN NUMBER,
                                                    n_agent_id_in     IN NUMBER,
                                                    v_date_in         IN VARCHAR2,
                                                    n_display_in      in number,
                                                    question_dtls_cur OUT SYS_REFCURSOR,
                                                    answer_dtls_cur   OUT SYS_REFCURSOR) IS

  */
  let dbConnection;
  let agentid = user.agentid ? user.agentid : -1;

  let sql = `BEGIN
  cp_get_form_answer_dtls(:n_Account_Id_In,:n_Role_Id_In,:n_userid_in,:n_form_id,:n_flow_id,:n_agent_id_in,:v_date_in,:n_display_in,:question_dtls_cur,: answer_dtls_cur);
END;`;

  let bindParams = {
    n_Account_Id_In: filterData.AccountId,
    n_Role_Id_In: user.role,
    n_userid_in: user.userid,
    n_form_id: filterData.FormId,
    n_flow_id: filterData.FlowId,
    n_agent_id_in: agentid,
    v_date_in:
      filterData.FromDate.toString() + " - " + filterData.ToDate.toString(),
    n_display_in: isdownload,
    question_dtls_cur: {
      type: oracledb.DB_TYPE_CURSOR,
      dir: oracledb.BIND_OUT,
    },
    answer_dtls_cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
  };

  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;
        oracleConnection
          .getCursorData(result.dbResult.outBinds.question_dtls_cur, 500)
          .then(function (questionresult) {
            oracleConnection
              .getCursorData(result.dbResult.outBinds.answer_dtls_cur, 500)
              .then(function (answerresult) {
                resolve({ header: questionresult, body: answerresult });
              })
              .catch(function (err) {
                Logger.error("reportService.getFeedback() 01: " + err);
                reject(err);
              });
          })
          .catch(function (err) {
            Logger.error("reportService.getFeedback() 02: " + err);
            reject(err);
          });
      })
      .catch(function (err) {
        Logger.error("reportService.getFeedback() 03: " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}

//formfilter

function getFormFilter(filterData) {
  /* cp_get_form_list_prc(n_account_id IN NUMBER
                          v_form_cur    OUT SYS_REFCURSOR)
     */

  let dbConnection;
  let sql = `BEGIN
  cp_get_form_list_prc(:n_account_id_In,: v_form_cur);
END;`;

  let bindParams = {
    n_account_id_In: filterData.AccountId,

    v_form_cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
  };

  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;
        oracleConnection
          .getCursorData(result.dbResult.outBinds.v_form_cur, 500)
          .then(function (cursorResult) {
            resolve(cursorResult);
          })
          .catch(function (err) {
            Logger.error("reportService.getFormFilter() 01: " + err);
            reject(err);
          });
      })
      .catch(function (err) {
        Logger.error("reportService.getFormFilter() 02: " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}

//outboundfilter

function getOutboundFilter(filterData) {
  // CP_OBD_CAMPAIGN_OUT_PRC(n_account_id_in in number,
  //                             n_flow_id_in    in number,
  //                             ref_cur         out sys_refcursor,
  //                             n_status_out    out number) is

  let dbConnection;
  let sql = `BEGIN
  CP_OBD_CAMPAIGN_OUT_PRC(:n_account_id_in,:n_flow_id_in,:ref_cur,:n_status_out);
END;`;

  let bindParams = {
    n_account_id_in: filterData.AccountId,
    n_flow_id_in: filterData.FlowId,

    ref_cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
    n_Status_Out: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
  };

  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;
        oracleConnection
          .getCursorData(result.dbResult.outBinds.ref_cur, 500)
          .then(function (cursorResult) {
            resolve(cursorResult);
          })
          .catch(function (err) {
            Logger.error("reportService.getOutboundFilter() 01: " + err);
            reject(err);
          });
      })
      .catch(function (err) {
        Logger.error("reportService.getOutboundFilter() 02: " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}

//CLICKTOCALL

async function getClick2CallLog(loc, filterData, user, flagdownldrecord, resp) {
  // let dbConnection;
  let sql = `BEGIN
    Cp_Ivr_c2c_Call_Report_Prc(
      :n_Account_Id_In, :v_dni_in, :n_Role_Id_In, :n_userid_in, :v_Date_In,
      :v_Search_Key_in, :v_Search_Value_in, :n_flag_in, :n_Status_Out, :Ref_Cur
    );
  END;`;

  let bindParams = {
    n_Account_Id_In: filterData.AccountId,
    v_dni_in: filterData.dni.includes("0") ? "-1" : filterData.dni.toString(),
    n_Role_Id_In: user.role,
    n_userid_in: user.userid,
    v_Date_In:
      filterData.FromDate.toString() + " - " + filterData.ToDate.toString(),
    v_Search_Key_in: filterData.SearchKey,
    v_Search_Value_in: filterData.SearchValue,
    n_flag_in: flagdownldrecord,
    n_Status_Out: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
    Ref_Cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
  };
  let exeOptions = {
    prefetchRows: 1000,
    fetchArraySize: 1000,
    outFormat: oracledb.OBJECT,
  };

  // let connectionstring = dbConfig.database[loc];
  // return new Promise(async function (resolve, reject) {
  //   await oracleConnection
  //     .createpoolLocation(connectionstring)
  //     .catch((error) => {
  //       console.log(error);
  //       reject(error);
  //     });

  //   oracleConnection
  //     .executeProcedure(connectionstring.poolAlias, sql, bindParams, exeOptions)
  //     .then(function (result) {
  //       dbConnection = result.dbConnection;
  //       count = result.dbResult.outBinds.n_count_out;
  //       if (count > 5000 && flag == 1) {
  //         oracleConnection.connRelease(dbConnection);
  //         resolve({ count });
  //       } else if (count < 5000 || flag == 2) {
  //         const cursor = result.dbResult.outBinds.Ref_Cur;
  //         const queryStream = cursor.toQueryStream();
  //         resolve({ queryStream, dbConnection, count });
  //       }
  //     })
  //     .catch(function (err) {
  //       Logger.error("reportService.getAgentCallLog() : " + err);
  //       reject(err);
  //     });
  // }).finally(function () {
  //   //oracleConnection.connRelease(dbConnection);
  // });
  await locationDBops
    .executeDBStreaming(loc, sql, bindParams, "Ref_Cur", exeOptions, resp)
    .catch(function (err) {
      return resp.status(500).json({ status: 500, message: err });
    });
}

async function getAgentCallLog(
  loc,
  filterData,
  user,
  recorddownloadflag,
  resp
) {
  /*
CREATE OR REPLACE Procedure Cp_Ivr_Agent_initiated_Call_Report_Prc(n_Account_Id_In   In Number,
                                                                   n_Flowid_in       in number,
                                                                   n_Role_Id_In      In Number,
                                                                   n_userid_in       in number,
                                                                   v_agentno_in      in varchar2,
                                                                   v_Date_In         In Varchar2,
                                                                   v_Search_Key_in   in Varchar2,
                                                                   v_Search_Value_in in Varchar2,
                                                                    n_flag_in         In number,  --record file--
                                                                   -- v_ivr_numbers_in  in Varchar2,
                                                                   n_Status_Out Out Number,
                                                                   Ref_Cur      Out Sys_Refcursor) Is 
 Cp_Ivr_Agent_initiated_Call_Report_Prc(n_Account_Id_In   In Number,
                                                                   n_Flowid_in       in number,
                                                                   n_Role_Id_In      In Number,
                                                                   n_userid_in       in number,
                                                                   v_agentno_in      in varchar2,
                                                                   v_Date_In         In Varchar2,
                                                                   v_Search_Key_in   in Varchar2,
                                                                   v_Search_Value_in in Varchar2,
                                                                   n_flag_in         In number default 1, --record file--
                                                                   -- v_ivr_numbers_in  in Varchar2,
                                                                   n_Status_Out Out Number,
                                                                   Ref_Cur      Out Sys_Refcursor) Is                                                              
                                                                   
*/
  // let dbConnection;
  let sql = `BEGIN
  Cp_Ivr_Agent_initiated_Call_Report_Prc(:n_Account_Id_In,:n_Flowid_in,:n_Role_Id_In,:n_userid_in,:v_agentno_in,:v_Date_In,
    :v_Search_Key_in,:v_Search_Value_in,:n_flag_in,:n_Status_Out,:Ref_Cur);
END;`;

  let bindParams = {
    n_Account_Id_In: filterData.AccountId,
    n_Flowid_in: filterData.FlowId,
    n_Role_Id_In: user.role,
    n_userid_in: user.userid,
    v_agentno_in: filterData.AgentNo,
    v_Date_In:
      filterData.FromDate.toString() + " - " + filterData.ToDate.toString(),
    v_Search_Key_in: filterData.SearchKey,
    v_Search_Value_in: filterData.SearchValue,
    n_flag_in: recorddownloadflag,
    n_Status_Out: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
    Ref_Cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
  };

  let exeOptions = {
    prefetchRows: 1000,
    fetchArraySize: 1000,
    outFormat: oracledb.OBJECT,
  };

  // let connectionstring = dbConfig.database[loc];

  // return new Promise(async function (resolve, reject) {
  //   await oracleConnection
  //     .createpoolLocation(connectionstring)
  //     .catch((error) => {
  //       console.log(error);
  //       reject(error);
  //     });

  //   oracleConnection
  //     .executeProcedure(connectionstring.poolAlias, sql, bindParams, exeOptions)
  //     .then(function (result) {
  //       dbConnection = result.dbConnection;
  //       count = result.dbResult.outBinds.n_count_out;
  //       if (count > 5000 && flag == 1) {
  //         oracleConnection.connRelease(dbConnection);
  //         resolve({ count });
  //       } else if (count < 5000 || flag == 2) {
  //         const cursor = result.dbResult.outBinds.Ref_Cur;
  //         const queryStream = cursor.toQueryStream();
  //         resolve({ queryStream, dbConnection, count });
  //       }
  //     })
  //     .catch(function (err) {
  //       Logger.error("reportService.getAgentCallLog() : " + err);
  //       reject(err);
  //     });
  // }).finally(function () {
  //   // oracleConnection.connRelease(dbConnection);
  // });
  await locationDBops
    .executeDBStreaming(loc, sql, bindParams, "Ref_Cur", exeOptions, resp)
    .catch(function (err) {
      return resp.status(500).json({ status: 500, message: err });
    });
}

async function getAgentPerformanceLog(loc, filterData, user, resp) {
  //added connection string
  /*Cp_Ivr_agent_perfomance_Report_Prc(n_Account_Id_In  In Number,
                                                   n_Role_Id_In     In Number,
                                                   n_dni_In         In Number,
                                                   v_Hunting_Num_In In Varchar2,
                                                   v_Category_In    In Varchar2,
                                                   v_Date_In        In Varchar2,
                                                   n_Circle_In      In Number,
                                                   v_Circle_In      In Varchar2,
                                                   n_Status_Out     Out Number,
                                                   Ref_Cur          Out Sys_Refcursor,
                                                   Record_Cur       Out Sys_Refcursor) Is

Cp_Ivr_agent_perfomance_Report_Prc(n_Account_Id_In   In Number,
                                                                    n_Flowid_in       in number,
                                                                    n_Role_Id_In      In Number,
                                                                    n_userid_in       in number,                                                                    
                                                                    v_Date_In         In Varchar2,
                                                                    v_Search_Key_in   in Varchar2,
                                                                    n_call_type_in    in number,
                                                                    v_Search_Value_in Varchar2,
                                                                    n_Status_Out      Out Number,
                                                                    Ref_Cur           Out Sys_Refcursor) Is

*/
  // let dbConnection;
  let sql = `BEGIN
  Cp_Ivr_agent_perfomance_Report_Prc(:n_Account_Id_In,:n_Flowid_in,:n_Role_Id_In,:n_userid_in,:v_Date_In,
    :v_Search_Key_in,: n_call_type_in,:v_Search_Value_in,:n_Status_Out,:Ref_Cur);
END;`;

  let bindParams = {
    n_Account_Id_In: filterData.AccountId,
    n_userid_in: user.userid,
    n_Flowid_in: filterData.FlowId,
    n_Role_Id_In: user.role,
    v_Date_In:
      filterData.FromDate.toString() + " - " + filterData.ToDate.toString(),
    v_Search_Key_in: filterData.SearchKey,
    n_call_type_in: filterData.call_type,
    v_Search_Value_in: filterData.SearchValue,
    n_Status_Out: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
    Ref_Cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
  };
  let exeOptions = {
    prefetchRows: 1000,
    fetchArraySize: 1000,
    outFormat: oracledb.OBJECT,
  };

  // let connectionstring = dbConfig.database[loc];

  // return new Promise(async function (resolve, reject) {
  //   await oracleConnection
  //     .createpoolLocation(connectionstring)
  //     .catch((error) => {
  //       console.log(error);
  //       reject(error);
  //     }); //added line
  //   oracleConnection
  //     .executeProcedure(connectionstring.poolAlias, sql, bindParams, exeOptions) //replaced with connection string
  //     .then(function (result) {
  //       dbConnection = result.dbConnection;
  //       // oracleConnection
  //       //   .getCursorData(result.dbResult.outBinds.Ref_Cur, 1000)
  //       //   .then(function (cursorResult) {
  //       //     resolve(cursorResult);
  //       //   })
  //       //   .catch(function (err) {
  //       //     Logger.error("reportService.getAgentPerformanceLog() : " + err);
  //       //   });
  //       const cursor = result.dbResult.outBinds.Ref_Cur;
  //       const queryStream = cursor.toQueryStream();
  //       resolve({ queryStream, dbConnection });
  //     })
  //     .catch(function (err) {
  //       Logger.error("reportService.getAgentPerformanceLog() : " + err);
  //       reject(err);
  //     });
  // }).finally(function () {
  //   // oracleConnection.connRelease(dbConnection);
  // });

  await locationDBops
    .executeDBStreaming(loc, sql, bindParams, "Ref_Cur", exeOptions, resp)
    .catch(function (err) {
      return resp.status(500).json({ status: 500, message: err });
    });
}

async function getAgentBreakSummary(loc, filterData, user, resp) {
  /*cp_break_summary_report_prc(n_Account_id_in in number,
                                                        n_Flow_id_in    in number,
                                                        n_agent_id_in   in number,
                                                        n_user_id_in    in number,
                                                        v_Date_In       In Varchar2,
                                                        Ref_cur         out sys_refcursor,
                                                        n_status_out    out number) is
*/
  // let dbConnection;
  let sql = `BEGIN
  cp_break_summary_report_prc(:n_Account_id_in,:n_Flow_id_in,:n_agent_id_in,:n_user_id_in,:v_Date_In,
    :Ref_cur,:n_status_out);
END;`;

  let bindParams = {
    n_Account_id_in: filterData.AccountId,
    n_Flow_id_in: filterData.FlowId,
    n_agent_id_in: filterData.AgentId,
    n_user_id_in: user.userid,
    v_Date_In:
      filterData.FromDate.toString() + " - " + filterData.ToDate.toString(),
    Ref_cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
    n_status_out: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
  };

  let exeOptions = {
    prefetchRows: 1000,
    fetchArraySize: 1000,
    outFormat: oracledb.OBJECT,
  };
  await locationDBops
    .executeDBStreaming(loc, sql, bindParams, "Ref_cur", exeOptions, resp)
    .catch(function (err) {
      return resp.status(500).json({ status: 500, message: err });
    });

  // let connectionString = dbConfig.database[loc];

  // return new Promise(async function (resolve, reject) {
  //   await oracleConnection
  //     .createpoolLocation(connectionString)
  //     .catch((error) => {
  //       console.log(error);
  //       reject(error);
  //     });
  //   oracleConnection
  //     .executeProcedure(connectionString.poolAlias, sql, bindParams, exeOptions)

  //     .then(function (result) {
  //       dbConnection = result.dbConnection;
  //       // console.log("result.dbResult.outBinds : ",result.dbResult.outBinds);
  //       const cursor = result.dbResult.outBinds.Ref_cur;
  //       // const status=result.dbResult.outBinds.n_status_out;
  //       const queryStream = cursor.toQueryStream();
  //       resolve({ queryStream, dbConnection });

  //       // oracleConnection
  //       //   .getCursorData(result.dbResult.outBinds.Ref_cur, 1000)
  //       //   .then(function (cursorResult) {
  //       //     resp = {
  //       //       status: result.dbResult.outBinds.n_status_out,
  //       //       data:{ queryStream, dbConnection} ,
  //       //     };
  //       //     resolve(resp);
  //       //   })
  //       //   .catch(function (err) {
  //       //     Logger.error(
  //       //       "reportService.getAgentBreakSummary() : Pool : " +
  //       //       connectionString.poolAlias +
  //       //       " : " +
  //       //       err
  //       //     );
  //       //   });
  //     })
  //     .catch(function (err) {
  //       Logger.error(
  //         "reportService.getAgentBreakSummary() : Pool : " +
  //           connectionString.poolAlias +
  //           " : " +
  //           err
  //       );
  //       reject(err);
  //     });
  // }).finally(function () {
  //   // oracleConnection.connRelease(dbConnection);
  // });
}

async function getAgentBreakDetails(loc, filterData, user, resp) {
  /*cp_break_detail_report_prc(n_Account_id_in in number,
                                                       n_Flow_id_in    in number,
                                                       n_agent_id_in   in number,
                                                       n_user_id_in    in number,
                                                       v_Date_In       In Varchar2,
                                                       Ref_cur         out sys_refcursor,
                                                       n_status_out    out number) is
*/
  // let dbConnection;
  let sql = `BEGIN
cp_break_detail_report_prc(:n_Account_id_in,:n_Flow_id_in,:n_agent_id_in,:n_user_id_in,:v_Date_In,
  :Ref_cur,:n_status_out);
END;`;

  let bindParams = {
    n_Account_id_in: filterData.AccountId,
    n_Flow_id_in: filterData.FlowId,
    n_agent_id_in: filterData.AgentId,
    n_user_id_in: user.userid,
    v_Date_In:
      filterData.FromDate.toString() + " - " + filterData.ToDate.toString(),
    Ref_cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
    n_status_out: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
  };
  let exeOptions = {
    prefetchRows: 1000,
    fetchArraySize: 1000,
    outFormat: oracledb.OBJECT,
  };

  await locationDBops
    .executeDBStreaming(loc, sql, bindParams, "Ref_cur", exeOptions, resp)
    .catch(function (err) {
      return resp.status(500).json({ status: 500, message: err });
    });
  // let connectionString = dbConfig.database[loc];

  // return new Promise(async function (resolve, reject) {
  //   await oracleConnection
  //     .createpoolLocation(connectionString)
  //     .catch((error) => {
  //       console.log(error);
  //       reject(error);
  //     });
  //   oracleConnection
  //     .executeProcedure(connectionString.poolAlias, sql, bindParams, exeOptions)
  //     .then(function (result) {
  //       dbConnection = result.dbConnection;
  //       const cursor = result.dbResult.outBinds.Ref_cur;
  //       const queryStream = cursor.toQueryStream();

  //       resolve({ queryStream, dbConnection });
  //       // oracleConnection
  //       //   .getCursorData(result.dbResult.outBinds.Ref_cur, 1000)
  //       //   .then(function (cursorResult) {
  //       //     console.log("cursorResult",cursorResult);
  //       //     resp = {
  //       //       status: result.dbResult.outBinds.n_status_out,
  //       //       data: cursorResult,
  //       //     };
  //       //     resolve(resp);
  //       //   })
  //       //   .catch(function (err) {
  //       //     Logger.error(
  //       //       "reportService.getAgentBreakSummary() : Pool : " +
  //       //       connectionString.poolAlias +
  //       //       " : " +
  //       //       err
  //       //     );
  //       //   });
  //     })
  //     .catch(function (err) {
  //       Logger.error(
  //         "reportService.getAgentBreakSummary() : Pool : " +
  //           connectionString.poolAlias +
  //           " : " +
  //           err
  //       );
  //       reject(err);
  //     });
  // }).finally(function () {
  //   // oracleConnection.connRelease(dbConnection);
  // });
}

async function getAgentLoginSummary(loc, filterData, user, resp) {
  /*Cp_agent_login_summary_report_Prc(n_Account_Id_In In Number,
                                                              n_Flowid_in     in number,
                                                              n_agent_id_in   in number,
                                                              n_user_id_in    in number,
                                                              v_Date_In       In Varchar2,
                                                              
                                                              Ref_Cur      Out Sys_Refcursor,
                                                              n_status_out out number) Is
*/
  // let dbConnection;
  let sql = `BEGIN
  Cp_agent_login_summary_report_Prc(:n_Account_id_in,:n_Flow_id_in,:n_agent_id_in,:n_user_id_in,:v_Date_In,
    :Ref_cur,:n_status_out);
END;`;

  let bindParams = {
    n_Account_id_in: filterData.AccountId,
    n_Flow_id_in: filterData.FlowId,
    n_agent_id_in: filterData.AgentId,
    n_user_id_in: user.userid,
    v_Date_In:
      filterData.FromDate.toString() + " - " + filterData.ToDate.toString(),
    Ref_cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
    n_status_out: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
  };
  let exeOptions = {
    prefetchRows: 1000,
    fetchArraySize: 1000,
    outFormat: oracledb.OBJECT,
  };
  await locationDBops
    .executeDBStreaming(loc, sql, bindParams, "Ref_cur", exeOptions, resp)
    .catch(function (err) {
      return resp.status(500).json({ status: 500, message: err });
    });
  // let connectionString = dbConfig.database[loc];

  // return new Promise(async function (resolve, reject) {
  //   await oracleConnection
  //     .createpoolLocation(connectionString)
  //     .catch((error) => {
  //       console.log(error);
  //       reject(error);
  //     });
  //   oracleConnection
  //     .executeProcedure(connectionString.poolAlias, sql, bindParams, exeOptions)
  //     .then(function (result) {
  //       dbConnection = result.dbConnection;
  //       const cursor = result.dbResult.outBinds.Ref_cur;
  //       const queryStream = cursor.toQueryStream();

  //       resolve({ queryStream, dbConnection });
  //     })
  //     .catch(function (err) {
  //       Logger.error(
  //         "reportService.getAgentLoginSummary() : Pool : " +
  //           connectionString.poolAlias +
  //           " : " +
  //           err
  //       );
  //       reject(err);
  //     });
  // }).finally(function () {
  //   // oracleConnection.connRelease(dbConnection);
  // });
}

async function getAgentLoginDetails(loc, filterData, user, resp) {
  /*Cp_agent_login_detail_report_Prc(n_Account_Id_In In Number,
                                                             n_Flowid_in     in number,
                                                             n_agent_id_in   in number,
                                                             v_Date_In       In Varchar2,
                                                             
                                                             Ref_Cur      Out Sys_Refcursor,
                                                             n_status_out out number) Is

*/
  // let dbConnection;
  let sql = `BEGIN
  Cp_agent_login_detail_report_Prc(:n_Account_id_in,:n_Flow_id_in,:n_agent_id_in,:n_user_id_in,:v_Date_In,
  :Ref_cur,:n_status_out);
END;`;

  let bindParams = {
    n_Account_id_in: filterData.AccountId,
    n_Flow_id_in: filterData.FlowId,
    n_agent_id_in: filterData.AgentId,
    n_user_id_in: user.userid,
    v_Date_In:
      filterData.FromDate.toString() + " - " + filterData.ToDate.toString(),
    Ref_cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
    n_status_out: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
  };
  let exeOptions = {
    prefetchRows: 1000,
    fetchArraySize: 1000,
    outFormat: oracledb.OBJECT,
  };
  await locationDBops
    .executeDBStreaming(loc, sql, bindParams, "Ref_cur", exeOptions, resp)
    .catch(function (err) {
      return resp.status(500).json({ status: 500, message: err });
    });
  // let connectionString = dbConfig.database[loc];

  // return new Promise(async function (resolve, reject) {
  //   await oracleConnection
  //     .createpoolLocation(connectionString)
  //     .catch((error) => {
  //       console.log(error);
  //       reject(error);
  //     });
  //   oracleConnection
  //     .executeProcedure(connectionString.poolAlias, sql, bindParams, exeOptions)
  //     .then(function (result) {
  //       dbConnection = result.dbConnection;
  //       const cursor = result.dbResult.outBinds.Ref_cur;
  //       const queryStream = cursor.toQueryStream();

  //       resolve({ queryStream, dbConnection });
  //     })
  //     .catch(function (err) {
  //       Logger.error("reportService.getAgentLoginDetails() : " + err);
  //       reject(err);
  //     });
  // }).finally(function () {
  //   // oracleConnection.connRelease(dbConnection);
  // });
}

function getAgents(flowid, accid, type, userid) {
  /* Cp_DropDwn_Report_agent_List_Prc(n_Flow_Id_In         In Number,
                                                             n_Type_In            In Number,
                                                             v_Agent_List_Cur_Out Out Sys_Refcursor)
 
  --n_Type_In 
 1-agent,2-supervoesor

 //22/03/23
 Cp_DropDwn_Report_agent_List_Prc(n_account_id         in number,
                                                             n_user_id_in         in number,
                                                             n_Flow_Id_In         In Number,
                                                             n_Type_In            In Number,
                                                             v_Agent_List_Cur_Out Out Sys_Refcursor) Is
 */
  let dbConnection;
  let sql = `BEGIN
  Cp_DropDwn_Report_agent_List_Prc(:n_account_id,:n_user_id_in,:n_Flow_Id_In,:n_Type_In,:v_Agent_List_Cur_Out );
END;`;

  let bindParams = {
    n_account_id: accid,
    n_user_id_in: userid,
    n_Flow_Id_In: flowid,
    n_Type_In: type,
    v_Agent_List_Cur_Out: {
      type: oracledb.DB_TYPE_CURSOR,
      dir: oracledb.BIND_OUT,
    },
  };

  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;
        oracleConnection
          .getCursorData(result.dbResult.outBinds.v_Agent_List_Cur_Out, 1000)
          .then(function (cursorResult) {
            resolve(cursorResult);
          })
          .catch(function (err) {
            Logger.error("reportService.getAgents 1: " + err);
            reject(err);
          });
      })
      .catch(function (err) {
        Logger.error("reportService.getAgents 2: " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}

async function getSMSSummary(loc, filterData, user, resp) {
  /* cp_sms_send_summary_report_prc(n_Account_id_in in number,
                                                           n_Flow_id_in    in number,
                                                           n_sender_id_in  in varchar2,
                                                           v_Date_In       In Varchar2,
                                                           n_userid_in     in number,
                                                           Ref_cur         out sys_refcursor,
                                                           n_status_out    out number) is
*/
  // let dbConnection;
  let sql = `BEGIN
  cp_sms_send_summary_report_prc(:n_Account_id_in,:n_Flow_id_in,:n_sender_id_in,:v_Date_In,:n_userid_in,
    :Ref_cur,:n_status_out);
END;`;

  let bindParams = {
    n_Account_id_in: filterData.AccountId,
    n_Flow_id_in: filterData.FlowId,
    n_sender_id_in: filterData.AgentId,
    v_Date_In:
      filterData.FromDate.toString() + " - " + filterData.ToDate.toString(),
    n_userid_in: user.userid,
    Ref_cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
    n_status_out: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
  };
  let exeOptions = {
    prefetchRows: 500,
    fetchArraySize: 500,
    outFormat: oracledb.OBJECT,
  };
  await locationDBops
    .executeDBStreaming(loc, sql, bindParams, "Ref_cur", exeOptions, resp)
    .catch(function (err) {
      return resp.status(500).json({ status: 500, message: err });
    });
  // let connectionString = dbConfig.database[loc];
  // return new Promise(async function (resolve, reject) {
  //   await oracleConnection
  //     .createpoolLocation(connectionString)
  //     .catch((error) => {
  //       console.log(error);
  //       reject(error);
  //     });
  //   oracleConnection
  //     .executeProcedure(connectionString.poolAlias, sql, bindParams, exeOptions)
  //     .then(function (result) {
  //       dbConnection = result.dbConnection;
  //       const cursor = result.dbResult.outBinds.Ref_cur;
  //       const queryStream = cursor.toQueryStream();

  //       resolve({ queryStream, dbConnection });
  //     })
  //     .catch(function (err) {
  //       Logger.error(
  //         "reportService.getSMSSummary() : Pool : " +
  //           connectionString.poolAlias +
  //           " : " +
  //           err
  //       );
  //       reject(err);
  //     });
  // }).finally(function () {
  //   // oracleConnection.connRelease(dbConnection);
  // });
}

async function getSMSDetails(loc, filterData, user, resp) {
  /*cp_sms_send_details_report_prc(n_Account_id_in in number,
                                                           n_Flow_id_in    in number,
                                                           n_sender_id_in  in varchar2,
                                                           n_userid_in in  number,
                                                           v_Date_In       In Varchar2,
                                                           Ref_cur         out sys_refcursor,
                                                           n_status_out    out number) is
*/
  // let dbConnection;
  let sql = `BEGIN
  cp_sms_send_details_report_prc(:n_Account_id_in,:n_Flow_id_in,:n_sender_id_in,:n_userid_in,:v_Date_In,
  :Ref_cur,:n_status_out);
END;`;

  let bindParams = {
    n_Account_id_in: filterData.AccountId,
    n_Flow_id_in: filterData.FlowId,
    n_sender_id_in: filterData.AgentId,
    n_userid_in: user.userid,
    v_Date_In:
      filterData.FromDate.toString() + " - " + filterData.ToDate.toString(),
    Ref_cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
    n_status_out: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
  };
  let exeOptions = {
    prefetchRows: 500,
    fetchArraySize: 500,
    outFormat: oracledb.OBJECT,
  };
  await locationDBops
    .executeDBStreaming(loc, sql, bindParams, "Ref_cur", exeOptions, resp)
    .catch(function (err) {
      return resp.status(500).json({ status: 500, message: err });
    });
  // let connectionString = dbConfig.database[loc];

  // return new Promise(async function (resolve, reject) {
  //   await oracleConnection.createpoolLocation(connectionString);
  //   oracleConnection
  //     .executeProcedure(connectionString.poolAlias, sql, bindParams, exeOptions)
  //     .then(function (result) {
  //       dbConnection = result.dbConnection;
  //       const cursor = result.dbResult.outBinds.Ref_cur;
  //       const queryStream = cursor.toQueryStream();

  //       resolve({ queryStream, dbConnection });
  //     })
  //     .catch(function (err) {
  //       Logger.error("reportService.getSMSDetails() : " + err);
  //       reject(err);
  //     });
  // }).finally(function () {
  //   // oracleConnection.connRelease(dbConnection);
  // });
}

function getVoiceRecordings(loc, filterData, user) {
  try {
    /*   cp_Bulk_Voice_Download_Prc(n_Account_Id_In      In Number,
                                                       n_Flowid_in          in number,
                                                       n_Role_Id_In         In Number,
                                                       n_userid_in          in number,
                                                       n_call_type_in in number,
                                                       v_Date_In            In Varchar2,
                                                       v_Search_Key_in      in Varchar2,
                                                       v_Search_Value_in    Varchar2,
                                                       n_Status_Out         Out Number,
                                                       Call_Id_Data_Out_Cur Out Sys_Refcursor) 
*/

    // let dbConnection;
    let sql = `BEGIN
  cp_Bulk_Voice_Download_Prc(:n_Account_Id_In,:n_Flowid_in,:n_Role_Id_In,:n_userid_in,:n_call_type_in,:v_Date_In,
    :v_Search_Key_in,:v_Search_Value_in,:n_Status_Out,:Call_Id_Data_Out_Cur);
END;`;

    let bindParams = {
      n_Account_Id_In: filterData.AccountId,
      n_Flowid_in: filterData.FlowId,
      n_Role_Id_In: user.role,
      n_userid_in: user.userid,
      n_call_type_in: filterData.call_type,
      v_Date_In:
        filterData.FromDate.toString() + " - " + filterData.ToDate.toString(),
      v_Search_Key_in: filterData.SearchKey,
      v_Search_Value_in: filterData.SearchValue,
      n_Status_Out: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
      Call_Id_Data_Out_Cur: {
        type: oracledb.DB_TYPE_CURSOR,
        dir: oracledb.BIND_OUT,
      },
    };
    return locationDBops
      .executeDBReadcursor(
        loc,
        sql,
        bindParams,
        exeOptions,
        "Call_Id_Data_Out_Cur",
        ["n_Status_Out"]
      )
      .then((result) => {
        if (result && result.cursorData) {
          return result.cursorData;
        } else return [];
      });
  } catch (e) {
    Logger.error(
      "campaign.service.EditCampaignLocation() : " + JSON.stringify(e.message)
    );
  }
  // let connectionstring = dbConfig.database[loc];

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
  //       oracleConnection
  //         .getCursorData(result.dbResult.outBinds.Call_Id_Data_Out_Cur, 500)
  //         .then(function (cursorResult) {
  //           resolve(cursorResult);
  //         })
  //         .catch(function (err) {
  //           Logger.error("reportService.getVoiceRecordings() : " + err);
  //           reject(err);
  //         });
  //     })
  //     .catch(function (err) {
  //       console.log("reportService.getVoiceRecordings() : " + err);
  //       reject(err);
  //     });
  // }).finally(function () {
  //   oracleConnection.connRelease(dbConnection);
  // });
}

//getvoicerecordingdownload
function getVoiceRecordingDownload(filterData, user) {
  /*cp_bulk_download_prc(N_ACCOUNT_ID_IN   IN NUMBER,
                                                 N_FLOW_ID_IN      IN NUMBER,
                                                 N_USER_ID_IN      IN NUMBER,
                                                 V_INSERT_DATE_IN  IN VARCHAR2,
                                                 N_CALL_TYPE_IN    IN NUMBER,
                                                 N_TYPE_IN         IN NUMBER,
                                                 N_ROLE_ID_IN      IN NUMBER,
                                                 v_Search_Key_in   in Varchar2,
                                                 v_Search_Value_in Varchar2,
                                                 n_insert_id_out   out number,
                                                 REF_CUR           OUT SYS_REFCURSOR,
                                                 N_STATUS_OUT      OUT NUMBER) IS
*/
  let dbConnection;
  let sql = `BEGIN
  cp_bulk_download_prc(:N_ACCOUNT_ID_IN,:N_FLOW_ID_IN,:N_USER_ID_IN,:V_INSERT_DATE_IN,:N_CALL_TYPE_IN,:N_TYPE_IN,:N_ROLE_ID_IN,:v_Search_Key_in,:v_Search_Value_in,:n_insert_id_out,
    :REF_CUR,:N_STATUS_OUT);
END;`;

  let bindParams = {
    N_ACCOUNT_ID_IN: filterData.AccountId,
    N_FLOW_ID_IN: filterData.FlowId,
    N_USER_ID_IN: user.userid,
    V_INSERT_DATE_IN:
      filterData.FromDate.toString() + " - " + filterData.ToDate.toString(),
    N_CALL_TYPE_IN: filterData.call_type,
    N_TYPE_IN: filterData.Type,
    N_ROLE_ID_IN: filterData.Type,
    v_Search_Key_in: filterData.SearchKey,
    v_Search_Value_in: filterData.SearchValue,
    n_insert_id_out: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
    REF_CUR: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
    N_STATUS_OUT: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
  };

  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;
        oracleConnection
          .getCursorData(result.dbResult.outBinds.REF_CUR, 500)
          .then(function (cursorResult) {
            resolve({
              status: result.dbResult.outBinds.N_STATUS_OUT,
              insertId: result.dbResult.outBinds.n_insert_id_out,
              data: cursorResult,
            });
          })
          .catch(function (err) {
            Logger.error("reportService.getVoiceRecordingDownload() : " + err);
            reject(err);
          });
      })
      .catch(function (err) {
        Logger.error("reportService.getVoiceRecordingDownload() : " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}
function getStatusUpdate(filename, filepath, insert_id, status, user) {
  /*   
  cp_bulk_voice_path_update_prc(                          v_file_name_in in varchar2,
                                                          v_file_path_in in varchar2,
                                                          n_insert_id    in number,
                                                          n_status_in    in number,

                                                          
                                                          n_status_out   out number) is
*/
  let dbConnection;
  let sql = `BEGIN
  cp_bulk_voice_path_update_prc(:v_file_name_in,:v_file_path_in,:n_insert_id,:n_status_in,:n_status_out);
END;`;

  let bindParams = {
    v_file_name_in: filename,
    v_file_path_in: filepath,
    n_insert_id: insert_id,
    n_status_in: status,

    n_status_out: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
  };

  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;

        resolve(result.dbResult.outBinds.n_status_out);
      })
      .catch(function (err) {
        Logger.error("reportService.getStatusUpdate() : " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}

function getCompleted(filterData) {
  /*   
  

  cp_bulk_voice_path_out_prc(n_insert_id     in number,
                                                       v_file_path_out OUT VARCHAR2,

                                                       n_status_out out number) is                                                   


*/
  let dbConnection;
  let sql = `BEGIN
  cp_bulk_voice_path_out_prc(:n_insert_id,:v_file_path_out,:n_status_out);
END;`;

  let bindParams = {
    n_insert_id: filterData.Id,
    v_file_path_out: { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_OUT },
    n_status_out: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
  };

  //console.log(bindParams);

  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;

        // console.log(result);
        resolve({
          status: result.dbResult.outBinds.n_status_out,
          filepath: result.dbResult.outBinds.v_file_path_out,
        });
      })
      .catch(function (err) {
        Logger.error("reportService.getCompleted() : " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}

function getDNIList(accId, flowId, reporttype) {
  /**cp_account_dni_dtls_out_prc(n_accid_in  in number,
                                             n_flow_id_in in number,
                                             refcur      out Sys_Refcursor) 
                                             
                                         1.60 patch01    
    cp_account_dni_dtls_out_prc(n_accid_in   in number,
                                                        n_flow_id_in in number,
                                                        n_type_in    in number,
                                                        refcur       out Sys_Refcursor)                                         
                                             */
  let dbConnection;
  let sql = `BEGIN
  cp_account_dni_dtls_out_prc(:n_accid_in,:n_flow_id_in,:n_type_in,:refcur);
END;`;

  let bindParams = {
    n_accid_in: accId,
    n_flow_id_in: flowId,
    n_type_in: reporttype,
    refcur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
  };

  //  console.log(bindParams);

  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;
        oracleConnection
          .getCursorData(result.dbResult.outBinds.refcur, 1000)
          .then(function (cursorResult) {
            //  console.log("cursorResult",cursorResult);
            resolve({
              data: cursorResult,
            });
          })
          .catch(function (err) {
            Logger.error("reportService.getDNIList() : " + err);
            reject(err);
          });
      })
      .catch(function (err) {
        Logger.error("reportService.getDNIList() : " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}

function insertBulkReportRequest(filterData, user) {
  /*cp_bulk_report_download_prc(N_ACCOUNT_ID_IN   IN NUMBER,
                                                        N_FLOW_ID_IN      IN NUMBER,
                                                        N_USER_ID_IN      IN NUMBER,
                                                        V_request_DATE_IN IN VARCHAR2,
                                                        N_report_TYPE_IN  IN NUMBER,
                                                        N_TYPE_IN         IN NUMBER,
                                                        N_ROLE_ID_IN      IN NUMBER,
                                                        v_Search_Key_in   in Varchar2,
                                                        v_Search_Value_in Varchar2,
                                                        v_ivr_number_in   in varchar2,
                                                        n_campaign_id_in  in number,
                                                        n_insert_id_out   out number,
                                                        REF_CUR           OUT SYS_REFCURSOR,
                                                        N_STATUS_OUT      OUT NUMBER) IS

      cp_bulk_report_download_prc(N_ACCOUNT_ID_IN   IN NUMBER,
                                                        N_FLOW_ID_IN      IN NUMBER,
                                                        N_USER_ID_IN      IN NUMBER,
                                                        V_request_DATE_IN IN VARCHAR2,
                                                        N_report_TYPE_IN  IN NUMBER,
                                                        N_TYPE_IN         IN NUMBER,
                                                        N_ROLE_ID_IN      IN NUMBER,
                                                        v_Search_Key_in   in Varchar2,
                                                        v_Search_Value_in Varchar2,
                                                        v_ivr_number_in   in varchar2,
                                                        n_campaign_id_in  in number,
                                                        n_sms_type_in     in number,
                                                        n_insert_id_out   out number,
                                                        REF_CUR           OUT SYS_REFCURSOR,
                                                        N_STATUS_OUT      OUT NUMBER) IS  
                                                        
      create or replace procedure cp_bulk_report_download_prc(N_ACCOUNT_ID_IN   IN NUMBER,
                                                        N_FLOW_ID_IN      IN NUMBER,
                                                        N_USER_ID_IN      IN NUMBER,
                                                        V_request_DATE_IN IN VARCHAR2,
                                                        N_report_TYPE_IN  IN NUMBER,
                                                        N_TYPE_IN         IN NUMBER,
                                                        N_ROLE_ID_IN      IN NUMBER,
                                                        n_agent_no_in     IN number,
                                                        n_sender_id_in    IN NUMBER,
                                                        v_Search_Key_in   IN Varchar2,
                                                        v_Search_Value_in IN  Varchar2,
                                                        v_ivr_number_in   IN varchar2,
                                                        n_campaign_id_in  IN number,
                                                        n_sms_type_in     IN number,
                                                        n_insert_id_out   OUT number,
                                                        REF_CUR           OUT SYS_REFCURSOR,
                                                        N_STATUS_OUT      OUT NUMBER) IS                                
*/
  let dbConnection;
  let sql = `BEGIN
  cp_bulk_report_download_prc(:N_ACCOUNT_ID_IN,:N_FLOW_ID_IN,:N_USER_ID_IN,:V_request_DATE_IN,:N_report_TYPE_IN,:N_TYPE_IN,:N_ROLE_ID_IN,:n_agent_no_in,:n_sender_id_in,:v_Search_Key_in,:v_Search_Value_in,:v_ivr_number_in,:n_campaign_id_in,:n_sms_type_in,:n_insert_id_out,
  :REF_CUR,:N_STATUS_OUT);
END;`;

  let bindParams = {
    N_ACCOUNT_ID_IN: filterData.AccountId,
    N_FLOW_ID_IN: filterData.FlowId,
    N_USER_ID_IN: user.userid,
    V_request_DATE_IN:
      filterData.FromDate.toString() + " - " + filterData.ToDate.toString(),
    N_report_TYPE_IN: filterData.ReportType,
    N_TYPE_IN: filterData.Type,
    N_ROLE_ID_IN: user.role,
    n_agent_no_in: filterData.AgentNo,
    n_sender_id_in: filterData.AgentId,
    v_Search_Key_in: filterData.SearchKey,
    v_Search_Value_in: filterData.SearchValue,
    v_ivr_number_in: filterData.dni?.includes("0")
      ? "-1"
      : filterData.dni.toString(),
    n_campaign_id_in: filterData.CampaignId,
    n_sms_type_in: filterData.smstype,
    n_insert_id_out: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
    REF_CUR: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
    N_STATUS_OUT: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
  };

  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;
        oracleConnection
          .getCursorData(result.dbResult.outBinds.REF_CUR, 500)
          .then(function (cursorResult) {
            // console.log("cursorResult insertBulkReportRequest",cursorResult);

            resolve({
              status: result.dbResult.outBinds.N_STATUS_OUT,
              insertId: result.dbResult.outBinds.n_insert_id_out,
              data: cursorResult,
            });
          })
          .catch(function (err) {
            Logger.error("reportService.insertBulkReportRequest() : " + err);
            reject(err);
          });
      })
      .catch(function (err) {
        Logger.error("reportService.insertBulkReportRequest() : " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}

function getCompletedreportpathout(filterData) {
  /*   
  
 cp_bulk_report_path_out_prc(n_insert_id     in number,
                                                       v_file_path_out OUT VARCHAR2,
                                                       n_status_out out number) is                                               


*/
  let dbConnection;
  let sql = `BEGIN
  cp_bulk_report_path_out_prc(:n_insert_id,:v_file_path_out,:n_status_out);
END;`;

  let bindParams = {
    n_insert_id: filterData.Id,
    v_file_path_out: { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_OUT },
    n_status_out: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
  };
  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;

        resolve({
          status: result.dbResult.outBinds.n_status_out,
          filepath: result.dbResult.outBinds.v_file_path_out,
        });
      })
      .catch(function (err) {
        Logger.error("reportService.getCompletedreportpathout() : " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}

// for version 1.51
//APIreport
async function getAPIreports(loc, filterData, user, resp) {
  // cp_api_report_downlaod_show_prc(n_acc_id_in       number,
  //                                 n_flow_id_in      number,
  //                                 v_date_in         varchar2,
  //                                 v_Search_Key_in   varchar2,
  //                                 v_Search_Value_in varchar2,
  //                                 n_Status_Out      out number,
  //                                 report_cur        out sys_refcursor)
  // let dbConnection;
  let sql = `BEGIN
  cp_api_report_downlaod_show_prc(:n_acc_id_in,:n_flow_id_in,:v_date_in,:v_Search_Key_in,:v_Search_Value_in,:n_Status_Out,:report_cur);
  END;`;
  let bindParams = {
    n_acc_id_in: filterData.AccountId,
    n_flow_id_in: filterData.FlowId,
    v_date_in:
      filterData.FromDate.toString() + " - " + filterData.ToDate.toString(),
    v_Search_Key_in: filterData.SearchKey,
    v_Search_Value_in: filterData.SearchValue,
    n_Status_Out: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
    report_cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
  };
  let exeOptions = {
    prefetchRows: 1000,
    fetchArraySize: 1000,
    outFormat: oracledb.OBJECT,
  };
  await locationDBops
    .executeDBStreaming(loc, sql, bindParams, "report_cur", exeOptions, resp)
    .catch(function (err) {
      return resp.status(500).json({ status: 500, message: err });
    });
  // let connectionstring = dbConfig.database[loc];
  // return new Promise(async function (resolve, reject) {
  //   await oracleConnection
  //     .createpoolLocation(connectionstring)
  //     .catch((error) => {
  //       console.log(error);
  //       reject(error);
  //     });

  //   oracleConnection
  //     .executeProcedure(connectionstring.poolAlias, sql, bindParams, exeOptions)
  //     .then(async function (result) {
  //       dbConnection = result.dbConnection;

  //       const cursor = result.dbResult.outBinds.report_cur;

  //       const queryStream = cursor.toQueryStream();
  //       resolve({ queryStream, dbConnection });
  //     })
  //     .catch(function (err) {
  //       Logger.error("reportService.getAPIreports() : " + err);
  //       reject(err);
  //     });
  // }).finally(function () {
  //   // oracleConnection.connRelease(dbConnection);
  // });
}

//progressive report

async function getProgressiveCallLog(
  loc,
  filterData,
  user,
  flagdownldrecord,
  resp
) {
  /*create or replace procedure Cp_IVR_c2c_progressive_dial_Report_Prc(n_Account_Id_In   In Number,
                                                       v_dni_in          in varchar2,
                                                       n_Role_Id_In      In Number,
                                                       n_userid_in       in number,
                                                       v_Date_In         In Varchar2,
                                                       v_Search_Key_in   in Varchar2,
                                                       v_Search_Value_in in Varchar2,
                                                       n_flag_in         In number default 1,
                                                       n_Status_Out Out Number,
                                                       Ref_Cur      Out Sys_Refcursor)

*/
  // let dbConnection;
  let sql = `BEGIN
  Cp_IVR_c2c_progressive_dial_Report_Prc(:n_Account_Id_In,:v_dni_in,:n_Role_Id_In,:n_userid_in,:v_Date_In,
    :v_Search_Key_in,:v_Search_Value_in,:n_flag_in,:n_Status_Out,:Ref_Cur);
END;`;

  let bindParams = {
    n_Account_Id_In: filterData.AccountId,
    v_dni_in: filterData.dni.includes("0") ? "-1" : filterData.dni.toString(),
    n_Role_Id_In: user.role,
    n_userid_in: user.userid,
    v_Date_In:
      filterData.FromDate.toString() + " - " + filterData.ToDate.toString(),
    v_Search_Key_in: filterData.SearchKey,
    v_Search_Value_in: filterData.SearchValue,
    n_flag_in: flagdownldrecord,
    n_Status_Out: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
    Ref_Cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
  };
  let exeOptions = {
    prefetchRows: 1000,
    fetchArraySize: 1000,
    outFormat: oracledb.OBJECT,
  };
  await locationDBops
    .executeDBStreaming(loc, sql, bindParams, "Ref_Cur", exeOptions, resp)
    .catch(function (err) {
      return resp.status(500).json({ status: 500, message: err });
    });
  // let connectionstring = dbConfig.database[loc];

  // return new Promise(async function (resolve, reject) {
  //   await oracleConnection
  //     .createpoolLocation(connectionstring)
  //     .catch((error) => {
  //       console.log(error);
  //       reject(error);
  //     });

  //   oracleConnection
  //     .executeProcedure(connectionstring.poolAlias, sql, bindParams, exeOptions)
  //     .then(function (result) {
  //       dbConnection = result.dbConnection;
  //       // oracleConnection
  //       //   .getCursorData(result.dbResult.outBinds.Ref_Cur, 1000)
  //       //   .then(function (cursorResult) {
  //       //     resolve(cursorResult);
  //       //   })
  //       //   .catch(function (err) {
  //       //     Logger.error("reportService.getAgentCallLog() : " + err);
  //       //   });
  //       const cursor = result.dbResult.outBinds.Ref_Cur;
  //       const queryStream = cursor.toQueryStream();
  //       resolve({ queryStream, dbConnection });
  //     })
  //     .catch(function (err) {
  //       Logger.error("reportService.getProgressiveCallLog : " + err);
  //       reject(err);
  //     });
  // }).finally(function () {
  //   // oracleConnection.connRelease(dbConnection);
  // });
}
// for 1.60
async function getOutboundSummaryCallLog(loc, filterData, user, resp) {
  /*cp_ivr_outbound_call_summary_report_out_prc(n_Account_Id_In In Number,
                                                               n_Flowid_in     in number,
                                                               n_userid_in     in number,
                                                               n_campaign_id_in in number,
                                                               n_Role_Id_In    in number,
                                                               v_Date_In       In Varchar2,
                                                               v_ivr_numbers_in in varchar2,
                                                               n_Status_Out    Out Number,
                                                               Ref_Cur         Out Sys_Refcursor)                                                      
*/
  // let dbConnection;
  let sql = `BEGIN
  cp_ivr_outbound_call_summary_report_out_prc(:n_Account_Id_In,:n_Flowid_in,:n_userid_in,:n_campaign_id_in,:n_Role_Id_In,:v_Date_In,
   :v_ivr_numbers_in,:n_Status_Out,:Ref_Cur);
END;`;
  let bindParams = {
    n_Account_Id_In: filterData.AccountId,
    n_Flowid_in: filterData.FlowId,
    n_userid_in: user.userid,
    n_campaign_id_in: filterData.CampaignId,
    n_Role_Id_In: user.role,
    v_Date_In:
      filterData.FromDate.toString() + " - " + filterData.ToDate.toString(),
    v_ivr_numbers_in: filterData.dni.includes("0")
      ? "-1"
      : filterData.dni.toString(),
    n_Status_Out: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
    Ref_Cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
  };
  let exeOptions = {
    prefetchRows: 1000,
    fetchArraySize: 1000,
    outFormat: oracledb.OBJECT,
  };
  await locationDBops
    .executeDBStreaming(loc, sql, bindParams, "Ref_Cur", exeOptions, resp)
    .catch(function (err) {
      return resp.status(500).json({ status: 500, message: err });
    });
  // let connectionstring = dbConfig.database[loc];
  // return new Promise(async function (resolve, reject) {
  //   await oracleConnection
  //     .createpoolLocation(connectionstring)
  //     .catch((error) => {
  //       console.log(error);
  //       reject(error);
  //     }); //added
  //   oracleConnection
  //     .executeProcedure(connectionstring.poolAlias, sql, bindParams)
  //     .then(function (result) {
  //       dbConnection = result.dbConnection;

  //       const cursor = result.dbResult.outBinds.Ref_Cur;
  //       const queryStream = cursor.toQueryStream();
  //       resolve({ queryStream, dbConnection });
  //     })
  //     .catch(function (err) {
  //       Logger.error("reportService.getOutboundSummaryCallLog() : " + err);
  //       reject(err);
  //     });
  // }).finally(function () {
  //   // oracleConnection.connRelease(dbConnection);
  // });
}

async function getIncomingSummaryCallLog(loc, filterData, user, resp) {
  /*  
                                                            
      cp_ivr_incoming_call_summary_report_out_prc(n_Account_Id_In  In Number,
                                                               n_Flowid_in      in number,
                                                               n_Role_Id_In     In Number,
                                                               n_userid_in      in number,
                                                               v_Date_In        In Varchar2,
                                                               v_ivr_numbers_in in varchar2,
                                                               n_Status_Out     Out Number,
                                                               Ref_Cur          Out Sys_Refcursor)
*/
  // let dbConnection;
  let sql = `BEGIN
  cp_ivr_incoming_call_summary_report_out_prc(:n_Account_Id_In,:n_Flowid_in,:n_Role_Id_In,:n_userid_in,:v_Date_In,
   :v_ivr_numbers_in,:n_Status_Out,:Ref_Cur);
END;`;

  let bindParams = {
    n_Account_Id_In: filterData.AccountId,
    n_Flowid_in: filterData.FlowId,
    n_Role_Id_In: user.role,
    n_userid_in: user.userid,
    v_Date_In:
      filterData.FromDate.toString() + " - " + filterData.ToDate.toString(),
    v_ivr_numbers_in: filterData.dni.includes("0")
      ? "-1"
      : filterData.dni.toString(),
    n_Status_Out: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
    Ref_Cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
  };
  let exeOptions = {
    prefetchRows: 1000,
    fetchArraySize: 1000,
    outFormat: oracledb.OBJECT,
  };
  await locationDBops
    .executeDBStreaming(loc, sql, bindParams, "Ref_Cur", exeOptions, resp)
    .catch(function (err) {
      return resp.status(500).json({ status: 500, message: err });
    });
}
// let connectionstring = dbConfig.database[loc];

// return new Promise(async function (resolve, reject) {
//   await oracleConnection
//     .createpoolLocation(connectionstring)
//     .catch((error) => {
//       console.log(error);
//       reject(error);
//     });

//   oracleConnection
//     .executeProcedure(connectionstring.poolAlias, sql, bindParams, exeOptions)
//     .then(async function (result) {
//       dbConnection = result.dbConnection;

//       const cursor = result.dbResult.outBinds.Ref_Cur;

//       const queryStream = cursor.toQueryStream();
//       resolve({ queryStream, dbConnection });
//     })
//     .catch(function (err) {
//       Logger.error("reportService.getIncomingSummaryCallLog() : " + err);
//       reject(err);
//     });
// }).finally(function () {
//   // oracleConnection.connRelease(dbConnection);
// });

async function getClick2CallLogSummary(loc, filterData, user, resp) {
  /*create or replace procedure cp_ivr_c2c_call_summary_report_out_prc(n_Account_Id_In In Number,
                                                                   n_Role_Id_In     In Number,
                                                                   n_userid_in      in number,
                                                                   v_Date_In        In Varchar2,
                                                                   v_ivr_numbers_in in varchar2,
                                                                   n_Status_Out     Out Number,
                                                                   Ref_Cur          Out Sys_Refcursor)
*/
  let sql = `BEGIN
  cp_ivr_c2c_call_summary_report_out_prc(:n_Account_Id_In,:n_Role_Id_In,:n_userid_in,:v_Date_In,
    :v_ivr_numbers_in,:n_Status_Out,:Ref_Cur);
END;`;

  let bindParams = {
    n_Account_Id_In: filterData.AccountId,
    n_Role_Id_In: user.role,
    n_userid_in: user.userid,
    v_Date_In:
      filterData.FromDate.toString() + " - " + filterData.ToDate.toString(),
    v_ivr_numbers_in: filterData.dni.includes("0")
      ? "-1"
      : filterData.dni.toString(),
    n_Status_Out: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
    Ref_Cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
  };

  let exeOptions = {
    prefetchRows: 1000,
    fetchArraySize: 1000,
    outFormat: oracledb.OBJECT,
  };
  await locationDBops
    .executeDBStreaming(loc, sql, bindParams, "Ref_Cur", exeOptions, resp)
    .catch(function (err) {
      return resp.status(500).json({ status: 500, message: err });
    });
  // let connectionstring = dbConfig.database[loc];

  // return new Promise(async function (resolve, reject) {
  //   await oracleConnection
  //     .createpoolLocation(connectionstring)
  //     .catch((error) => {
  //       console.log(error);
  //       reject(error);
  //     });

  //   oracleConnection
  //     .executeProcedure(connectionstring.poolAlias, sql, bindParams, exeOptions)
  //     .then(function (result) {
  //       dbConnection = result.dbConnection;
  //       // oracleConnection
  //       //   .getCursorData(result.dbResult.outBinds.Ref_Cur, 1000)
  //       //   .then(function (cursorResult) {
  //       //     resolve(cursorResult);
  //       //   })
  //       //   .catch(function (err) {
  //       //     Logger.error("reportService.getAgentCallLog() : " + err);
  //       //   });
  //       const cursor = result.dbResult.outBinds.Ref_Cur;
  //       const queryStream = cursor.toQueryStream();
  //       resolve({ queryStream, dbConnection });
  //     })
  //     .catch(function (err) {
  //       Logger.error("reportService.getClick2CallLogSummary() : " + err);
  //       reject(err);
  //     });
  // }).finally(function () {
  //   // oracleConnection.connRelease(dbConnection);
  // });
}

async function getProgressiveCallSummaryLog(loc, filterData, user, resp) {
  /* cp_ivr_c2c_progressive_call_summary_report_out_prc(n_Account_Id_In  In Number,
                                                                  n_Role_Id_In     In Number,
                                                                   n_userid_in      in number,
                                                                   v_Date_In        In Varchar2,
                                                                   v_ivr_numbers_in in varchar2,
                                                                   n_Status_Out     Out Number,
                                                                   Ref_Cur          Out Sys_Refcursor) is
*/
  // let dbConnection;
  let sql = `BEGIN
  cp_ivr_c2c_progressive_call_summary_report_out_prc(:n_Account_Id_In,:n_Role_Id_In,:n_userid_in,:v_Date_In,
    :v_ivr_numbers_in,:n_Status_Out,:Ref_Cur);
END;`;

  let bindParams = {
    n_Account_Id_In: filterData.AccountId,
    n_Role_Id_In: user.role,
    n_userid_in: user.userid,
    v_Date_In:
      filterData.FromDate.toString() + " - " + filterData.ToDate.toString(),
    v_ivr_numbers_in: filterData.dni.includes("0")
      ? "-1"
      : filterData.dni.toString(),
    n_Status_Out: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
    Ref_Cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
  };
  let exeOptions = {
    prefetchRows: 1000,
    fetchArraySize: 1000,
    outFormat: oracledb.OBJECT,
  };
  await locationDBops
    .executeDBStreaming(loc, sql, bindParams, "Ref_Cur", exeOptions, resp)
    .catch(function (err) {
      return resp.status(500).json({ status: 500, message: err });
    });
  // let connectionstring = dbConfig.database[loc];

  // return new Promise(async function (resolve, reject) {
  //   await oracleConnection
  //     .createpoolLocation(connectionstring)
  //     .catch((error) => {
  //       console.log(error);
  //       reject(error);
  //     });

  //   oracleConnection
  //     .executeProcedure(connectionstring.poolAlias, sql, bindParams, exeOptions)
  //     .then(function (result) {
  //       dbConnection = result.dbConnection;
  //       // oracleConnection
  //       //   .getCursorData(result.dbResult.outBinds.Ref_Cur, 1000)
  //       //   .then(function (cursorResult) {
  //       //     resolve(cursorResult);
  //       //   })
  //       //   .catch(function (err) {
  //       //     Logger.error("reportService.getAgentCallLog() : " + err);
  //       //   });
  //       const cursor = result.dbResult.outBinds.Ref_Cur;
  //       const queryStream = cursor.toQueryStream();
  //       resolve({ queryStream, dbConnection });
  //     })
  //     .catch(function (err) {
  //       Logger.error("reportService.getProgressiveCallSummaryLog : " + err);
  //       reject(err);
  //     });
  // }).finally(function () {
  //   // oracleConnection.connRelease(dbConnection);
  // });
}

function getbaseCount(accId, camp_id, date, dni) {
  // cp_obd_web_account_total_base(n_acc_id  number,
  //   n_camp_id number,
  //   v_date_in varchar2,
  //   n_total   out number)

  // cp_obd_web_account_total_base(n_acc_id  number,
  //                               n_camp_id number,
  //                                v_date_in varchar2,
  //                                v_dni_in  varchar2,
  //                                n_total   out number)
  let dbConnection;
  let sql = `BEGIN
  cp_obd_web_account_total_base(:n_acc_id,:n_camp_id,:v_date_in,:v_dni_in,:n_total);
END;`;

  let bindParams = {
    n_acc_id: accId,
    n_camp_id: camp_id,
    v_date_in: date,
    v_dni_in: dni,
    n_total: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
  };
  //  console.log("bindParams",bindParams);
  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;
        // console.log("result.dbResult.outBinds.n_total",result.dbResult.outBinds.n_total);
        resolve(result.dbResult.outBinds.n_total);
      })
      .catch(function (err) {
        Logger.error("reportService.getbaseCount() 02: " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}

function getAccounts(loc) {
  //cp_account_list_prc( ref_cur out sys_refcursor)
  let dbConnection;
  let sql = `BEGIN
  cp_account_list_prc(:ref_cur);
END;`;

  let bindParams = {
    ref_cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
  };

  let exeOptions = {
    prefetchRows: 1000,
    fetchArraySize: 1000,
    outFormat: oracledb.OBJECT,
  };
  return locationDBops
    .executeDBReadcursor(loc, sql, bindParams, exeOptions, "ref_cur", [])
    .then((cursorResult) => {
      // console.log("cursorResult",cursorResult);

      if (cursorResult) {
        // console.log("cursorResult.cursorData getAccounts",cursorResult.cursorData);
        resp = {
          data: cursorResult.cursorData,
        };
        return resp;
      } else return [];
    })
    .catch(function (err) {
      Logger.error("reports.service.getAccounts() 01 : " + err);
      throw err;
    });
  // let connectionString = dbConfig.database[loc];
  // console.log("connectionString",connectionString);

  // return new Promise(async function (resolve, reject) {
  //   await oracleConnection.createpoolLocation(connectionString);
  //   oracleConnection
  //     .executeProcedure(connectionString.poolAlias, sql, bindParams)
  //     .then(function (result) {
  //       dbConnection = result.dbConnection;
  //       oracleConnection
  //         .getCursorData(result.dbResult.outBinds.ref_cur, 1000)
  //         .then(function (cursorResult) {
  //           resp = {
  //             data: cursorResult,
  //           };
  //           // console.log("result",resp = {
  //           //   data: cursorResult,
  //           // });
  //           resolve(resp);
  //         })
  //         .catch(function (err) {
  //           Logger.error("reportService.GetAccounts() : " + err);
  //           reject(err);
  //         });
  //     })
  //     .catch(function (err) {
  //       Logger.error("reportService.GetAccounts() : " + err);
  //       reject(err);
  //     });
  // }).finally(function () {
  //   oracleConnection.connRelease(dbConnection);
  // });
}

function getserveripDetails(loc) {
  //cp_sever_ip_list_prc( ref_cur out sys_refcursor)is
  let dbConnection;
  let sql = `BEGIN
  cp_sever_ip_list_prc(:ref_cur);
END;`;

  let bindParams = {
    ref_cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
  };

  let exeOptions = {
    prefetchRows: 1000,
    fetchArraySize: 1000,
    outFormat: oracledb.OBJECT,
  };
  return locationDBops
    .executeDBReadcursor(loc, sql, bindParams, exeOptions, "ref_cur", [])
    .then((cursorResult) => {
      // console.log("cursorResult",cursorResult);

      if (cursorResult) {
        // console.log("cursorResult.cursorData getserveripDetails",cursorResult.cursorData);
        resp = {
          data: cursorResult.cursorData,
        };
        return resp;
      } else return [];
    })
    .catch(function (err) {
      Logger.error("reports.service.getserveripDetails() 01 : " + err);
      throw err;
    });
  // console.log("connectionString getserveripDetails",connectionString);

  // return new Promise(async function (resolve, reject) {
  //   await oracleConnection.createpoolLocation(connectionString);
  //   oracleConnection
  //     .executeProcedure(connectionString.poolAlias, sql, bindParams)
  //     .then(function (result) {
  //       dbConnection = result.dbConnection;
  //       oracleConnection
  //         .getCursorData(result.dbResult.outBinds.ref_cur, 1000)
  //         .then(function (cursorResult) {
  //           resp = {
  //             data: cursorResult,
  //           };
  //           // console.log("result",resp = {
  //           //   data: cursorResult,
  //           // });
  //           resolve(resp);
  //         })
  //         .catch(function (err) {
  //           Logger.error("reportService.getserveripDetails() : " + err);
  //           reject(err);
  //         });
  //     })
  //     .catch(function (err) {
  //       Logger.error("reportService.getserveripDetails() : " + err);
  //       reject(err);
  //     });
  // }).finally(function () {
  //   oracleConnection.connRelease(dbConnection);
  // });
}

async function getChannelUtillaccountReport(loc, accountrprtJSON, resp) {
  /*  
                                                            
      cp_accountwise_chnl_util_report_prc(v_json_in varchar2,ref_cur out sys_refcursor)


*/
  // let dbConnection;
  let sql = `BEGIN
  cp_accountwise_chnl_util_report_prc(:v_json_in,:ref_cur);
END;`;

  let bindParams = {
    v_json_in: JSON.stringify(accountrprtJSON),
    ref_cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
  };
  let exeOptions = {
    prefetchRows: 1000,
    fetchArraySize: 1000,
    outFormat: oracledb.OBJECT,
  };
  await locationDBops
    .executeDBStreamingPullreport(
      loc,
      sql,
      bindParams,
      "ref_cur",
      exeOptions,
      resp
    )
    .catch(function (err) {
      return resp.status(500).json({ status: 500, message: err });
    });
  // let connectionstring = dbConfig.database[loc];

  // return new Promise(async function (resolve, reject) {
  //   await oracleConnection
  //     .createpoolLocation(connectionstring)
  //     .catch((error) => {
  //       console.log(error);
  //       reject(error);
  //     });

  //   oracleConnection
  //     .executeProcedure(connectionstring.poolAlias, sql, bindParams, exeOptions)
  //     .then(async function (result) {
  //       console.log("result", result);
  //       dbConnection = result.dbConnection;

  //       const cursor = result.dbResult.outBinds.ref_cur;

  //       const queryStream = cursor.toQueryStream();
  //       resolve({ queryStream, dbConnection });
  //     })
  //     .catch(function (err) {
  //       Logger.error("reportService.getChannelUtillaccountReport() : " + err);
  //       reject(err);
  //     });
  // }).finally(function () {
  //   // oracleConnection.connRelease(dbConnection);
  // });
}

async function getChannelUtillserverReport(loc, serverrprtJSON, resp) {
  /*  
                                                            
       cp_serverwise_chnl_util_report_prc(v_json_in varchar2,ref_cur out sys_refcursor)is


*/
  // let dbConnection;
  let sql = `BEGIN
  cp_serverwise_chnl_util_report_prc(:v_json_in,:ref_cur);
END;`;

  let bindParams = {
    v_json_in: JSON.stringify(serverrprtJSON),
    ref_cur: { type: oracledb.DB_TYPE_CURSOR, dir: oracledb.BIND_OUT },
  };
  // console.log("bindParams",bindParams);
  let exeOptions = {
    prefetchRows: 1000,
    fetchArraySize: 1000,
    outFormat: oracledb.OBJECT,
  };
  await locationDBops
    .executeDBStreamingPullreport(
      loc,
      sql,
      bindParams,
      "ref_cur",
      exeOptions,
      resp
    )
    .catch(function (err) {
      return resp.status(500).json({ status: 500, message: err });
    });
  // let connectionstring = dbConfig.database[loc];

  // return new Promise(async function (resolve, reject) {
  //   await oracleConnection
  //     .createpoolLocation(connectionstring)
  //     .catch((error) => {
  //       console.log(error);
  //       reject(error);
  //     });

  //   oracleConnection
  //     .executeProcedure(connectionstring.poolAlias, sql, bindParams, exeOptions)
  //     .then(async function (result) {
  //       console.log("result", result);
  //       dbConnection = result.dbConnection;

  //       const cursor = result.dbResult.outBinds.ref_cur;

  //       const queryStream = cursor.toQueryStream();
  //       resolve({ queryStream, dbConnection });
  //     })
  //     .catch(function (err) {
  //       Logger.error("reportService.getChannelUtillserverReport() : " + err);
  //       reject(err);
  //     });
  // }).finally(function () {
  //   // oracleConnection.connRelease(dbConnection);
  // });
}
module.exports.getIncomingCallLog = getIncomingCallLog;
module.exports.getOutboundCallLog = getOutboundCallLog;
module.exports.getAgentCallLog = getAgentCallLog;
module.exports.getAgentPerformanceLog = getAgentPerformanceLog;
module.exports.getAgentBreakSummary = getAgentBreakSummary;
module.exports.getAgentBreakDetails = getAgentBreakDetails;
module.exports.getAgentLoginSummary = getAgentLoginSummary;
module.exports.getAgentLoginDetails = getAgentLoginDetails;
module.exports.getAgents = getAgents;
module.exports.getSMSSummary = getSMSSummary;
module.exports.getSMSDetails = getSMSDetails;
module.exports.getVoiceRecordings = getVoiceRecordings;
module.exports.getFilterBy = getFilterBy;
module.exports.getIncomingCallHierarchy = getIncomingCallHierarchy;
module.exports.getOutboundCallHierarchy = getOutboundCallHierarchy;
module.exports.getFeedback = getFeedback;
module.exports.getFormFilter = getFormFilter;
module.exports.getOutboundFilter = getOutboundFilter;
module.exports.getVoiceRecordingDownload = getVoiceRecordingDownload;
module.exports.getStatusUpdate = getStatusUpdate;
module.exports.getCompleted = getCompleted;
module.exports.getClick2CallLog = getClick2CallLog;
module.exports.getIncomingCalllogDownload = getIncomingCalllogDownload;
module.exports.getDNIList = getDNIList;
module.exports.insertBulkReportRequest = insertBulkReportRequest;
module.exports.getCompletedreportpathout = getCompletedreportpathout;
// for version 1.51
module.exports.getAPIreports = getAPIreports;
module.exports.getProgressiveCallLog = getProgressiveCallLog;
// for version 1.60
module.exports.getOutboundSummaryCallLog = getOutboundSummaryCallLog;
module.exports.getIncomingSummaryCallLog = getIncomingSummaryCallLog;
module.exports.getClick2CallLogSummary = getClick2CallLogSummary;
module.exports.getProgressiveCallSummaryLog = getProgressiveCallSummaryLog;
module.exports.getbaseCount = getbaseCount;

//for version 1.80
module.exports.getAccounts = getAccounts;
module.exports.getserveripDetails = getserveripDetails;
module.exports.getChannelUtillaccountReport = getChannelUtillaccountReport;
module.exports.getChannelUtillserverReport = getChannelUtillserverReport;
