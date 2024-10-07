const oracledb = require("oracledb");
const oraclehelperdb = require("../_helpers/oracle-service");
const oracleConnection = require("../database/oracle-connection");
const { Logger } = require("../_helpers/logger");

dbConfig = require("../_helpers/customConfig");
var db_cpaasweb = dbConfig.database.cpaas_web;

function GetFileId() {
  try {
    let dbConnection;
    let sql = `BEGIN
        Cp_Voice_FILEID_OUT_Prc(:n_file_id_OUT,:v_VOICEPATH_OUT,:n_Sts_Out );
END;`;

    exeOptions = { outFormat: oracledb.OBJECT };
    let bindParams = {
      n_file_id_OUT: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
      v_VOICEPATH_OUT: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
      n_Sts_Out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
    };

    return new Promise(function (resolve, reject) {
      oracleConnection
        .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
        .then(function (result) {
          dbConnection = result.dbConnection;

          let finalResult = {
            status: result.dbResult.outBinds.n_Sts_Out,
            fileid: result.dbResult.outBinds.n_file_id_OUT,
            filepath: result.dbResult.outBinds.v_VOICEPATH_OUT,
          };

          resolve(finalResult);
        })

        .catch(function (err) {
          Logger.error("file-service.GetFileId() : " + err);
          reject(err);
        });
    }).finally(function () {
      oracleConnection.connRelease(dbConnection);
    });
  } catch (e) {
    Logger.error("file.service.GetFileId() : " + JSON.stringify(e.message));
  }
}

function AddFile(
  userid,
  fileid,
  flowid,
  filename,
  script,
  sysfilename,
  vlang,
  scripttype,
  voicegender,
  extension
) {
  try {
    let dbConnection;
    let sql = `BEGIN
        Cp_Voice_Upload_Prc(:n_Userid_In,:n_file_id_in,:n_flow_Id_In,:v_Fname_In,:v_Fscript_In,:v_sysFname_In,:v_fvoice_lang_in,:v_fscript_type_in,:v_fvoice_gender_in,:n_voice_extention_in,:n_Sts_Out );
END;`;

    exeOptions = { outFormat: oracledb.OBJECT };
    let bindParams = {
      n_Userid_In: userid,
      n_file_id_in: fileid,
      n_flow_Id_In: flowid,
      v_Fname_In: filename,
      v_Fscript_In: script,
      v_sysFname_In: sysfilename,
      v_fvoice_lang_in: vlang,
      v_fscript_type_in: scripttype,
      v_fvoice_gender_in: voicegender,
      n_voice_extention_in: extension,
      n_Sts_Out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
    };

    return new Promise(function (resolve, reject) {
      oracleConnection
        .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
        .then(function (result) {
          dbConnection = result.dbConnection;

          let finalResult = { status: result.dbResult.outBinds.n_Sts_Out };

          resolve(finalResult);
        })
        .catch(function (err) {
          Logger.error("file-service.AddFile() : " + err);
          reject(err);
        });
    }).finally(function () {
      oracleConnection.connRelease(dbConnection);
    });
  } catch (e) {
    Logger.error("file.service.AddFile() : " + JSON.stringify(e.message));
  }
}

function getListFiles(flowid) {
  try {
    /*Cp_Voice_List_Prc(n_flow_Id_In In Number,
                                                      Res_Cur_Out Out Sys_Refcursor) Is*/
    let dbConnection;
    let sql = `BEGIN
        Cp_Voice_List_Prc(:n_flow_Id_In,:Res_Cur_Out );
END;`;

    exeOptions = { outFormat: oracledb.OBJECT };
    let bindParams = {
      n_flow_Id_In: flowid,
      Res_Cur_Out: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
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
              Logger.error("Error in getListFiles : " + err);
              reject(err);
            });
        })
        .catch(function (err) {
          Logger.error("Error in getListFiles : " + err);
          reject(err);
        });
    }).finally(function () {
      oracleConnection.connRelease(dbConnection);
    });
  } catch (e) {
    Logger.error("file.service.getListFiles() : " + JSON.stringify(e.message));
  }
}
//cpaas 1.60
function TTSCountInsert(accountid, count,type) {
  try {
    /**cp_account_wise_tts_count_update_prc(n_acc_id     in number,
                                                                 n_tts_length number,
                                                                 n_type_in    in number,
                                                                 n_sts_out out number) is 
               TYPE 0 -STT  
               TYPE 1 -TTS
               TYPE 2- IBM TTS                                                 
                                                                 */

    let dbConnection;
    let sql = `BEGIN
        cp_account_wise_tts_count_update_prc(:n_acc_id,:n_tts_length,:n_type_in,:n_sts_out);
END;`;

    exeOptions = { outFormat: oracledb.OBJECT };
    let bindParams = {
      n_acc_id: accountid,
      n_tts_length: count,
      n_type_in:type,
      n_sts_out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
    };

    return new Promise(function (resolve, reject) {
      oracleConnection
        .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)

        .then(function (result) {
          dbConnection = result.dbConnection;
          resolve(result.dbResult.outBinds.n_sts_out);
        })

        .catch(function (err) {
          Logger.error("file.service.TTSCountInsert() : " + err);
          reject(err);
        });
    }).finally(function () {
      oracleConnection.connRelease(dbConnection);
    });
  } catch (e) {
    Logger.error(
      "file.service.TTSCountInsert() : " + JSON.stringify(e.message)
    );
  }
}

module.exports.GetFileId = GetFileId;
module.exports.AddFile = AddFile;
module.exports.getListFiles = getListFiles;
module.exports.TTSCountInsert = TTSCountInsert;
