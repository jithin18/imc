const oracledb = require("oracledb");
const oracleConnection = require("../database/oracle-connection");
const { Logger } = require("../_helpers/logger");
const dbConfig = require("../_helpers/customConfig");
const locationDBops = require("../database/location-dbops");

function getVoiceRecording(loc, callid, recid) {
  /*   Cp_Dowld_Call_Record_File_Prc(n_call_id_in        In Number,
                                                          n_Rec_Id_In         In Number,
                                                          b_Recfile           Out Blob,
                                                          v_Rec_File_Name_Out Out Varchar2,
                                                          n_Sts_Out           Out Number)
  */
  // let dbConnection;
  let sql = `BEGIN
  Cp_Dowld_Call_Record_File_Prc(:n_call_id_in,:n_Rec_Id_In,:b_Recfile,:v_Rec_File_Name_Out,:n_Sts_Out);
END;`;

  let bindParams = {
    n_call_id_in: callid,
    n_Rec_Id_In: recid,
    b_Recfile: {
      type: oracledb.BUFFER,
      dir: oracledb.BIND_OUT,
      maxSize: 50000000,
    },
    v_Rec_File_Name_Out: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
    n_Sts_Out: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
  };
  return locationDBops
    .executeDBProcedure(loc, sql, bindParams)
    .then((result) => {
      return {
        blob_voicefile: voiceFileData,
        filename: result.outBinds.v_Rec_File_Name_Out,
        dbConnection: result.dbConnection,
      };
    })
    .catch(function (err) {
      Logger.error("voiceService.getVoiceRecording() : " + err);
      throw err;
    });
  // return new Promise(async function (resolve, reject) {
  //   await oracleConnection.createpoolLocation(connectionString);

  //   oracleConnection
  //     .executeProcedure(connectionString.poolAlias, sql, bindParams)
  //     .then(async function (result) {
  //       dbConnection = result.dbConnection;
  //       voiceFileData = result.dbResult.outBinds.b_Recfile;

  //       respOut = {
  //         blob_voicefile: voiceFileData,
  //         filename: result.dbResult.outBinds.v_Rec_File_Name_Out,
  //         dbConnection: result.dbConnection,
  //       };

  //       // voiceFileData = Buffer.from(voiceFileData.replace('data:audio/wav; codecs=opus;base64,', ''), 'base64');
  //       resolve(respOut);
  //     })
  //     .catch(function (err) {
  //       Logger.error("voiceService.getVoiceRecording() : " + err);
  //       reject(err);
  //     });
  // }).finally(function () {
  //   oracleConnection.connRelease(dbConnection);
  // });
}
function getVoiceRecordingsFromCircle(loc, callid, recid) {
  /*    Cp_Dowld_Call_Record_File_Prc(n_call_id_in        In Number,
                                                          n_Rec_Id_In         In Number,
                                                          b_Recfile           Out Blob,
                                                          v_Rec_File_Name_Out Out Varchar2,
                                                          n_Sts_Out           Out Number)
  */
  // let dbConnection;
  let sql = `BEGIN
  Cp_Dowld_Call_Record_File_Prc(:n_call_id_in,:n_Rec_Id_In,:b_Recfile,:v_Rec_File_Name_Out,:n_Sts_Out);
END;`;

  let bindParams = {
    n_call_id_in: callid,
    n_Rec_Id_In: recid,
    b_Recfile: {
      type: oracledb.BUFFER,
      dir: oracledb.BIND_OUT,
      maxSize: 50000000,
    },
    v_Rec_File_Name_Out: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
    n_Sts_Out: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
  };
  return locationDBops
    .executeDBProcedure(loc, sql, bindParams)
    .then((result) => {
      return {
        blob_voicefile: voiceFileData,
        filename: result.outBinds.v_Rec_File_Name_Out,
        dbConnection: result.dbConnection,
      };
    })
    .catch(function (err) {
      Logger.error("voiceService.getVoiceRecordingsFromCircle() : " + err);
      throw err;
    });
  // let connectionString = dbConfig.database[loc];

  // return new Promise(async function (resolve, reject) {
  //   await oracleConnection.createpoolLocation(connectionString);

  //   oracleConnection
  //     .executeProcedure(connectionString.poolAlias, sql, bindParams)
  //     .then(async function (result) {
  //       dbConnection = result.dbConnection;
  //       voiceFileData = result.dbResult.outBinds.b_Recfile;

  //       respOut = {
  //         blob_voicefile: voiceFileData,
  //         filename: result.dbResult.outBinds.v_Rec_File_Name_Out,
  //         dbConnection: result.dbConnection,
  //       };

  //       // voiceFileData = Buffer.from(voiceFileData.replace('data:audio/wav; codecs=opus;base64,', ''), 'base64');
  //       resolve(respOut);
  //       // console.log("respOut",respOut);
  //     })
  //     .catch(function (err) {
  //       console.log("voiceService.getVoiceRecordingsFromCircle() : " + err);
  //       Logger.error("voiceService.getVoiceRecordingsFromCircle() : " + err);
  //       reject(err);
  //     });
  // }).finally(function () {
  //   oracleConnection.connRelease(dbConnection);
  // });
}
//version 1.43
async function getVoiceRecordingdetails(loc, callid, recid) {
  /**Cp_Call_Record_FileName_Out_Prc(n_call_id_in In Number,
                                                            n_Rec_Id_In  In Number,
                                                            
                                                            v_Rec_File_Name_Out    out varchar2,
                                                            n_server_port_out  out int,
                                                            v_server_ip_out   out varchar2,
                                                            n_Sts_Out         Out Number)*/
  // let dbConnection;
  let sql = `BEGIN
  Cp_Call_Record_FileName_Out_Prc(:n_call_id_in,:n_Rec_Id_In,:v_Rec_File_Name_Out,:n_server_port_out,:v_server_ip_out,:n_Sts_Out);
END;`;

  let bindParams = {
    n_call_id_in: callid,
    n_Rec_Id_In: recid,
    v_Rec_File_Name_Out: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
    n_server_port_out: {
      type: oracledb.DB_TYPE_NUMBER,
      dir: oracledb.BIND_OUT,
    },
    v_server_ip_out: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
    n_Sts_Out: { type: oracledb.DB_TYPE_NUMBER, dir: oracledb.BIND_OUT },
  };
  return locationDBops
    .executeDBProcedure(loc, sql, bindParams)
    .then((result) => {
      return {
        filename: result.outBinds.v_Rec_File_Name_Out,
        port: result.outBinds.n_server_port_out,
        host: result.outBinds.v_server_ip_out,
        status: result.outBinds.n_Sts_Out,
      };
    })
    .catch(function (err) {
      Logger.error("voiceService.getVoiceRecordingdetails() : " + err);
      throw err;
    });
  // let connectionString = dbConfig.database[loc];

  // return new Promise(async function (resolve, reject) {
  //   await oracleConnection.createpoolLocation(connectionString);

  //   oracleConnection
  //     .executeProcedure(connectionString.poolAlias, sql, bindParams)
  //     .then(async function (result) {
  //       dbConnection = result.dbConnection;
  //       respOut = {
  //         filename: result.dbResult.outBinds.v_Rec_File_Name_Out,
  //         port: result.dbResult.outBinds.n_server_port_out,
  //         host: result.dbResult.outBinds.v_server_ip_out,
  //         status: result.dbResult.outBinds.n_Sts_Out,
  //       };
  //       resolve(respOut);
  //     })
  //     .catch(function (err) {
  //       console.log("voiceService.getVoiceRecordingdetails() : " + err);
  //       Logger.error("voiceService.getVoiceRecordingdetails() : " + err);
  //       reject(err);
  //     });
  // }).finally(function () {
  //   oracleConnection.connRelease(dbConnection);
  // });
}

module.exports.getVoiceRecording = getVoiceRecording;
module.exports.getVoiceRecordingsFromCircle = getVoiceRecordingsFromCircle;
module.exports.getVoiceRecordingdetails = getVoiceRecordingdetails;
