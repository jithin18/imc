/**
 * Oracle connection- db executions handles here.
 */
const { getPool, SUBSCR_EVENT_TYPE_AQ } = require("oracledb");
const oracledb = require("oracledb");
const { Logger } = require("../_helpers/logger");
const alert = require("../_helpers/Alert");
const dbConfig = require("../_helpers/customConfig");
const appConfig = require("../_config/appconfig.json");

const connectionConfig = dbConfig.database;

const db_cpaasweb = connectionConfig.cpaas_web;

const dbNormalTimeout = appConfig.prctimeout.normal;
const dbimmediateTimeout = appConfig.prctimeout.immediate;
const dbmoderateTimeout = appConfig.prctimeout.moderate;

let poolCreatedTime = new Date();
let dbPool;

/**
 * to close pools currently but currently not using this
 * @param {*} connectionstring
 * @param {*} timeout
 */
function closePool(connectionstring, timeout) {
  try {
    return new Promise(function (resolve, reject) {
      timeout = timeout == undefined || timeout == null ? 10 : timeout;
      getPool(connectionstring.poolAlias).close(timeout, function (error) {
        if (error) {
          Logger.error(
            "OracleConnection.closePool() :  Could not Close the Pool !!! : poolAlias: " +
              connectionstring.poolAlias +
              " - " +
              error
          );
          console.log(
            "OracleConnection.closePool() :  Could not Close the Pool !!! : poolAlias: " +
              connectionstring.poolAlias +
              " - " +
              error
          );
          // alert.sendMailAlert("CPaaS Error : Could not Close the Pool !!! : poolAlias: " + connectionstring.poolAlias + " - " + error);
          reject(error);
        } else {
          Logger.info(
            "OracleConnection.closePool() : Pool Closed Successfully " +
              connectionstring.poolAlias
          );
          console.log(
            "OracleConnection.closePool() : Pool Closed Successfully " +
              connectionstring.poolAlias
          );
        }
        resolve(error);
      });
    });
  } catch (error) {
    Logger.error("OracleConnection.closePool() : " + error);
    console.log("OracleConnection.closePool() : " + error);
  }
}

/**
 * to close location db pools ,but currently not using this
 * @param {*} loc_db
 * @param {*} timeout
 */
function closepoolLocation(loc_db, timeout) {
  try {
    timeout = timeout == undefined || timeout == null ? 10 : timeout;
    const pool = getPool(loc_db);

    if (pool) {
      pool.close(timeout, function (error) {
        if (error) {
          Logger.info(
            "OracleConnection.closepoolLocation() :  Could not Close the Pool !!! :  poolAlias: " +
              loc_db +
              " - " +
              error
          );
        } else {
          Logger.info(
            "OracleConnection.closepoolLocation() : Pool Closed Successfully poolAlias: " +
              loc_db
          );
        }
      });
    } else {
      Logger.info(
        "OracleConnection.closepoolLocation() : No pool to close : " + loc_db
      );
    }
  } catch (error) {
    Logger.info("OracleConnection.closepoolLocation() : " + error);
  }
}

/**
 * @method to generete db connection pool
 * @param {string} connectionstring  input connectionstring
 * @returns nothing
 */
function createPool(connectionstring) {
  oracledb.createPool(connectionstring, function (error, pool) {
    if (error) {
      Logger.error(
        `Could not create pool using specified attributes poolAlias: ${connectionstring.poolAlias}  ${error.message}`
      );
    } else {
      console.log(
        `Pool created successfully using poolAlias: ${connectionstring.poolAlias}`
      );
      Logger.info(
        `Pool created successfully using poolAlias: ${connectionstring.poolAlias}`
      );
      dbPool = pool;
    }
  });
}
/**
 * @method to generete location db connection pool
 * @param {string} connectionstring  input location db connectionstring
 * @returns nothing
 */
function createpoolLocation(loc_db) {
  return new Promise(function (resolve, reject) {
    var existingPool;
    try {
      existingPool = getPool(loc_db.poolAlias);
    } catch (error) {
      existingPool = undefined;
    }

    if (!existingPool) {
      oracledb.createPool(loc_db, function (error, pool) {
        if (error) {
          console.log(
            `Could not create pool using specified attributes: connectionString: ${JSON.stringify(
              loc_db
            )} Error`,
            error.message
          );
          Logger.error(
            `Could not create pool using specified attributes: connectionString: ${JSON.stringify(
              loc_db
            )} Error: ${error.message}`
          );
          reject(error);
        } else {
          console.log(
            `Pool created successfully using poolAlias: ${loc_db.poolAlias}`
          );
          Logger.info(
            `Pool created successfully using poolAlias: ${loc_db.poolAlias}`
          );
          resolve(pool);
        }
      });
    } else {
      resolve(existingPool);
    }
  });
}

/** call create pool function to create web db conn pool */
createPool(db_cpaasweb);

/**
 *
 * @param {Object} connection  - db connection to be closed in case of not using pools
 */
function connRelease(connection) {
  try {
    if (connection && connection.state !== "disconnected") {
      connection.close(function (err) {
        if (err) {
          Logger.debug(
            "connRelease()  00 : poolAlias: " +
              JSON.stringify(connection._pool.poolAlias) +
              JSON.stringify(err.message)
          );
        } else {
          // console.log("connection released");
          // Logger.info("connRelease() : Connection Successfully Closed poolAlias: " + JSON.stringify(connection._pool.poolAlias));
        }
      });
    }
  } catch (error) {
    Logger.error(
      "connRelease() 01 : poolAlias: " +
        JSON.stringify(connection._pool.poolAlias) +
        JSON.stringify(error)
    );
  }
}

/**
 *
 * @param {Object} connection  - db connection to be released back to pool in case pools
 */
const oracleDbRelease = function (conn) {
  conn.release(function (err) {
    if (err) {
      Logger.error(
        "oracleDbRelease() : poolAlias: " +
          JSON.stringify(connection._pool.poolAlias) +
          JSON.stringify(err.message)
      );
    } else {
      // Logger.info("oracleDbRelease() : oracleConnection Successfully Released poolAlias: " + JSON.stringify(connection._pool.poolAlias));
    }
  });
};

function queryArray(sql, bindParams, options) {
  try {
    options.isAutoCommit = false; // we only do SELECTs
    return new Promise(function (resolve, reject) {
      oracledb
        .getConnection(db_cpaasweb.poolAlias)
        .then(function (connection) {
          connection
            .execute(sql, bindParams, options)
            .then(function (results) {
              resolve(results);
              connRelease(connection);
            })
            .catch(function (err) {
              reject(err);

              oracleDbRelease(connection);
            });
        })
        .catch(function (err) {
          reject(err);
        });
    });
  } catch (err) {
    Logger.error("Error in OracleConnection :" + err);
  }
}

function queryObject(sql, bindParams, options) {
  options["outFormat"] = oracledb.OBJECT; // default is oracledb.ARRAY
  return queryArray(sql, bindParams, options);
}
/**
 *
 * @param {*} pool connection pool
 * @param {*} sql sql / procedure
 * @param {*} bindParams sql / procedure paramters
 * @param {*} exeOptions other options if anything to specify
 * @returns {Object} db connection and result
 */
function executeProcedure(pool, sql, bindParams, exeOptions) {



  // options["outFormat"] = oracledb.OBJECT; // default is oracledb.ARRAY
  // options.isAutoCommit = false; // we only do SELECTs
  let poolAlias;
  let connection;
  try {
    if (exeOptions === undefined || exeOptions === null) {
      exeOptions = { outFormat: oracledb.OBJECT };
    }
    // console.log("executeProcedure : pool : ", pool);
    if (typeof pool == "object" && pool.poolAlias) {
      poolAlias = pool.poolAlias;
    } else {
      poolAlias = pool;
    }

    return new Promise(function (resolve, reject) {
      oracledb
        .getConnection(poolAlias)
        .then(function (connection) {
          connection.callTimeout = 1000 * dbNormalTimeout;
          return connection
            .execute(sql, bindParams, exeOptions)
            .then(function (results) {
              resolve({
                dbResult: results,
                dbConnection: connection,
              });
            })
            .catch(function (err) {
              Logger.error(
                "OracleConnection.executeProcedure : Pool : " +
                  poolAlias +
                  " : ERROR101 : " +
                  err
              );
              connRelease(connection);
              reject(err);
            });
        })
        .catch(function (err) {
          Logger.error(
            "OracleConnection.executeProcedure : Pool :" +
              pool +
              " ERROR100 : " +
              err +
              "\n"
          );
          connRelease(connection);
          reject(err);
        });
    });
  } catch (ex) {
    Logger.error(
      "OracleConnection.executeProcedure : Pool :" +
        pool +
        " ERROR103 : " +
        ex +
        "\n"
    );
    connRelease(connection);
    reject(ex);
  }
}

/**
 * to execute procedure with in 1000 * dbimmediateTimeout (value in config)
 * @param {*} pool connection pool
 * @param {*} sql sql / procedure
 * @param {*} bindParams sql / procedure paramters
 * @param {*} exeOptions other options if anything to specify
 * @returns {Object} db connection and result
 */
function executeProcedureImmediate(pool, sql, bindParams, exeOptions) {
  // options["outFormat"] = oracledb.OBJECT; // default is oracledb.ARRAY
  // options.isAutoCommit = false; // we only do SELECTs
  let poolAlias;
  let connection;
  try {
    if (exeOptions === undefined || exeOptions === null) {
      exeOptions = { outFormat: oracledb.OBJECT };
    }
    // console.log("executeProcedure : pool : ", pool);
    if (typeof pool == "object" && pool.poolAlias) {
      poolAlias = pool.poolAlias;
    } else {
      poolAlias = pool;
    }

    return new Promise(function (resolve, reject) {
      oracledb
        .getConnection(poolAlias)
        .then(function (connection) {
          connection.callTimeout = 1000 * dbimmediateTimeout;
          return connection
            .execute(sql, bindParams, exeOptions)
            .then(function (results) {
              resolve({
                dbResult: results,
                dbConnection: connection,
              });
            })
            .catch(function (err) {
              Logger.error(
                "OracleConnection.executeProcedureImmediate : Pool : " +
                  poolAlias +
                  " : ERROR101 : " +
                  err
              );
              connRelease(connection);

              reject(err);
            });
        })
        .catch(function (err) {
          Logger.error(
            "OracleConnection.executeProcedureImmediate : Pool :" +
              pool +
              " ERROR100 : " +
              err +
              "\n"
          );
          connRelease(connection);
          reject("-1");
        });
    });
  } catch (ex) {
    Logger.error(
      "OracleConnection.executeProcedureImmediate : Pool :" +
        pool +
        " ERROR103 : " +
        ex +
        "\n"
    );
    connRelease(connection);
    reject(ex);
  }
}

/**
 * to execute procedure with in 1000 * dbmoderateTimeout (value in config)
 * if agent is not able to ping  in dbmoderateTimeout (value in config)
 * then it will out 502 bad gateway error
 * @param {*} pool connection pool
 * @param {*} sql sql / procedure
 * @param {*} bindParams sql / procedure paramters
 * @param {*} exeOptions other options if anything to specify
 * @returns {Object} db connection and result
 */
function executeProcedureAgentPing(pool, sql, bindParams, exeOptions) {
  // options["outFormat"] = oracledb.OBJECT; // default is oracledb.ARRAY
  // options.isAutoCommit = false; // we only do SELECTs
  let poolAlias;
  let connection;
  try {
    if (exeOptions === undefined || exeOptions === null) {
      exeOptions = { outFormat: oracledb.OBJECT };
    }
    // console.log("executeProcedure : pool : ", pool);
    if (typeof pool == "object" && pool.poolAlias) {
      poolAlias = pool.poolAlias;
    } else {
      poolAlias = pool;
    }

    return new Promise(function (resolve, reject) {
      oracledb
        .getConnection(poolAlias)
        .then(function (connection) {
          connection.callTimeout = 1000 * dbmoderateTimeout;
          return connection
            .execute(sql, bindParams, exeOptions)
            .then(function (results) {
              resolve({
                dbResult: results,
                dbConnection: connection,
              });
            })
            .catch(function (err) {
              Logger.error(
                "OracleConnection.executeProcedureImmediate : Pool : " +
                  poolAlias +
                  " : ERROR101 : " +
                  err
              );
              connRelease(connection);

              reject(err);
            });
        })
        .catch(function (err) {
          Logger.error(
            "OracleConnection.executeProcedureImmediate : Pool :" +
              pool +
              " ERROR100 : " +
              err +
              "\n"
          );
          connRelease(connection);
          reject("-1");
        });
    });
  } catch (ex) {
    Logger.error(
      "OracleConnection.executeProcedureImmediate : Pool :" +
        pool +
        " ERROR103 : " +
        ex +
        "\n"
    );
    connRelease(connection);
    reject(ex);
  }
}

/**
 * use to bulk insert data
 * @param {*} pool connection pool
 * @param {*} sql sql / procedure
 * @param {*} bindParams sql / procedure paramters
 * @param {*} options other options if anything to specify
 * @returns {Object} db connection and result
 */
function executeMany(pool, sql, bindParams, options) {
  return new Promise(function (resolve, reject) {
    oracledb
      .getConnection(pool)
      .then(function (connection) {
        connection.callTimeout = 2000 * dbNormalTimeout;
        return connection.executeMany(
          sql,
          bindParams,
          options,
          function (err, result) {
            if (err) {
              console.error(err);
              connRelease(connection);
              reject(err);
            } else {
              connRelease(connection);
              resolve(result);
            }
          }
        );
      })
      .catch(function (err) {
        Logger.error("OracleConncetion.executeMany:" + err);
        //connRelease(connection);
        reject(err);
      });
  });
}

/**
 *
 * @param {*} cursor name of cursor
 * @param {*} numRows no.of rows to be retured per fetch
 * @returns {Array} cursorData
 */
function getCursorData(cursor, numRows) {
  return new Promise(async function (resolve, reject) {
    try {
      let cursorData = [];
      let rows;
      numRows = numRows ? numRows : 1000;
      let i = 0;
      do {
        rows = await cursor.getRows(numRows); // get numRows rows at a time
        if (rows.length > 0) {
          cursorData = cursorData.concat(rows);
        }

        if (i > 2000) {
          break;
        }
        i++;
      } while (rows.length === numRows);
      resolve(cursorData);
    } catch (error) {
      Logger.error(
        "OracleConncetion.getCursorData : " +
          error +
          " StackTrace : " +
          error.stack
      );
      reject(error);
    } finally {
      try {
        await cursor.close();
      } catch (error) {}
    }
  });
}

async function sendAlert(error, message) {
  try {
    let errorCode = await getErrorCode(error);
    if (
      errorCode == "ORA-12170" ||
      errorCode == "ORA-03113" ||
      errorCode == "ORA-12543" ||
      errorCode == "ORA-12154" ||
      errorCode == "NJS-002" ||
      errorCode == "NJS-040" ||
      errorCode == "NJS-047"
    ) {
      alert.sendMailAlert(message + "<br><br> Error : " + error);
    }
  } catch (e) {
    // console.log("Error in sendAlert : ", e);
    Logger.error("Error in sendAlert : " + e);
  }
}

function getErrorCode(error) {
  return new Promise(async function (resolve, reject) {
    error = error.toString();
    var errorCodeStart = error.indexOf("ORA-");
    if (errorCodeStart == -1) {
      var errorCodeStart = error.indexOf("NJS-");
    }
    var tmpErrorString = error.substr(errorCodeStart);
    var errorCodeEnd = tmpErrorString.indexOf(":");
    var errorCode = tmpErrorString.substr(0, errorCodeEnd);

    resolve(errorCode);
  }).catch(function (err) {
    Logger.error("OracleConncetion.getErrorCode:" + err);
    reject(err);
  });
}

module.exports = queryArray;
module.exports.queryArray = queryArray;
module.exports.queryObject = queryObject;
module.exports.executeProcedure = executeProcedure;
module.exports.getCursorData = getCursorData;
module.exports.oracleDbRelease = oracleDbRelease;
module.exports.connRelease = connRelease;
module.exports.executeMany = executeMany;
module.exports.createpoolLocation = createpoolLocation;
module.exports.closepoolLocation = closepoolLocation;
module.exports.executeProcedureImmediate = executeProcedureImmediate;
module.exports.executeProcedureAgentPing = executeProcedureAgentPing;
