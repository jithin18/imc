const oracleConnection = require("../database/oracle-connection");
const { Logger } = require("../_helpers/logger");

exports.streamDataAsResponse = function streamDataAsResponse(
    req,
    res,
    dbRespArray
  ) {
    let dataCount = 0,
      onEndCallCount = 0;
  
    for (let i = 0; i < dbRespArray.length; i++) {
      let dbResp = dbRespArray[i];
  
      dbResp.queryStream.on("data", function (row) {
        let data1;
        dataCount++;
        if (dataCount == 1) {
          data1 = "[" + JSON.stringify(row);
          // res.writeHead(200, {
          //     'Content-Type': 'application/json'
          // });
          res.write(data1);
        } else {
          data1 = "," + JSON.stringify(row);
          res.write(data1);
        }
      });
      dbResp.queryStream.on("error", function (error) {
        Logger.error(
          "dbHelper.streamDataAsResponse().queryStream : Conn" +
            JSON.stringify(dbResp.dbConnection) +
            " : Error" +
            JSON.stringify(error.message)
        );
        oracleConnection.connRelease(dbResp.dbConnection); // Ensure connection release on error
  
        res.write("[]");
  
        res.end();
      });
  
      dbResp.queryStream.on("end", function () {
        onEndCallCount++;
        if (onEndCallCount == dbRespArray.length) {
          if (dataCount == 0) res.write("[]");
          else {
            res.write("]");
          }
          oracleConnection.connRelease(dbResp.dbConnection); // Ensure connection release on error
  
          res.end();
        }
      });
  
      dbResp.queryStream.on("close", function () {
        oracleConnection.connRelease(dbResp.dbConnection);
      });
    }
  };
  