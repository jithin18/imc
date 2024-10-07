const fs = require("fs");
const path = require("path"); // Ensure 'path' module is required

const configFile = path.resolve(__dirname, "../_config/appconfig.json");
const appConfig = require("../_config/appconfig.json");
const { Logger } = require("../_helpers/logger");
const request = require("request");
let dbOpsEndPoints = appConfig.dbOpsEndPoints;

async function getUrlByLocation(location) {
  const endPoint = dbOpsEndPoints.find((endpoint) => endpoint.loc == location);
  return endPoint ? endPoint.port : null;
}


async function executeDBStreaming(loc, sql, params, cursor, exeOptions, res) {
  try {
    const requestData = JSON.stringify({
      sql: sql,
      params: params,
      cursorName: cursor,
      exeoptions: exeOptions,
    });

    let port = await getUrlByLocation(loc);
    if (port) {
      const options = {
        url: `${port}/${loc}/dbOps/cursorstreaming`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(requestData),
          authorization: "cpaas*Cpaas@123",
          location: `${loc}`,
        },
        body: requestData,
        timeout: appConfig.Apitimeout * 2,
      };

      let chunkBuffer = '';  // Buffer to accumulate incoming chunks
         // Chunk counter
      let totalSize = 0; // Variable to track total size

      return new Promise((resolve, reject) => {
        request(options)
          .on("response", (resp) => {

            // Listen for incoming data chunks
            resp.on("data", (chunk) => {
              if (chunk.length > 0) {  // Only process non-empty chunks
              
                totalSize += chunk.length; // Update total size

                chunkBuffer += chunk.toString();  // Append chunk to buffer
                
                if (totalSize >   1024 * 1024) {
                  res.writeHead(413, { "Content-Type": "application/json" });
                  res.write(JSON.stringify({ error: "Large file size error" }));
                  totalSize=0;

                  res.end();
                  Logger.error("Error:Large file size error"+totalSize);
                  reject(new Error("Large file size error"));
                }
                
                
                if (chunkBuffer.trim().endsWith('}')) {
                 

                  try {
                    // Parse the complete JSON object(s)
                    let parsedData = JSON.parse(chunkBuffer);
                   
                    
                    totalSize = 0;  // Reset the size after processing
                    res.write(JSON.stringify(parsedData) + "\n");  // Write parsed data to response
                    chunkBuffer = '';  
                  } catch (error) {
                    console.error("Error parsing JSON:", error.message);
                  }
                }
              }
            });

            // When response ends, resolve the Promise
            resp.on("end", () => {
             
              res.end();  // End the response
              resolve();
            });
          })
          .on("error", (error) => {
            console.error("Error:", error);
            reject(error);
          });
      });
    } else {
      throw new Error(`Request failed, invalid port`);
    }
  } catch (error) {
    
    Logger.error(`location-dbops.executeDBStreaming for location ${loc}: ` + error);
    throw error;
  }
}



function executeDBProcedure(loc, sqlquery, bindparams) {
  return new Promise((resolve, reject) => {
    try {
      getUrlByLocation(loc)
        .then((port) => {
          if (port) {
            let reqendpoint = `${port}/${loc}/dbOps/executeprc`;

            let requestData = JSON.stringify({
              sql: sqlquery,
              params: bindparams,
            });
            request.post(
              {
                headers: {
                  "content-type": "application/json",
                  authorization: "cpaas*Cpaas@123",
                  location: `${loc}`,
                },
                url: reqendpoint,
                body: requestData,
                // rejectUnauthorized: false,
                timeout: appConfig.DBapiTimeout,
              },
              (err, resp) => {
                if (err) {
                  Logger.error(
                    `location-dbops.executeDBProcedure request for location ${loc} : ` + err
                  );
                  reject(err);
                } else {
                  if (resp.statusCode !== 200) {
                    Logger.error(
                      `location-dbops.executeDBProcedure for location ${loc} result status code:  ${resp.statusCode} , ${resp.body}`
                    );
                    reject(
                      new Error(
                        `Request failed with status code ${resp.statusCode}`
                      )
                    );
                  } else {
                    const responseBody = JSON.parse(resp.body);
                    resolve(responseBody);
                  }
                }
              }
            );
          } else {
            Logger.error(
              `location-dbops.executeDBProcedure invalid port for location ${loc} `
            );
            reject(new Error(`Invalid port for location ${loc}`));
          }
        })
        .catch((err) => {
          Logger.error("Error:", err);
          reject(err);
        });
    } catch (err) {
      Logger.error("location-dbops.executeDBProcedure - Error: " + err);
      reject(err);
    }
  });
}

async function executeDBReadcursor(
  loc,
  sqlquery,
  bindparams,
  exeoptions,
  cursorname,
  otherparams = [],
  immediateExecution = 0
) {
  /** req.sql,
      req.bindParams,
      req.exeOptions,
      req.cursorName,
      req.numOfRows,
      (req.otherfields = []) */
  return new Promise((resolve, reject) => {
    try {
      getUrlByLocation(loc)
        .then((port) => {
          if (port) {
            let reqendpoint = `${port}/${loc}/dbOps/readcursor`;

            let requestData = JSON.stringify({
              sql: sqlquery,
              params: bindparams,
              cursorName: cursorname,
              otherfields: otherparams,
              exeoptions: exeoptions,
              executeImmediate: immediateExecution,
            });
            request.post(
              {
                headers: {
                  "content-type": "application/json",
                  authorization: "cpaas*Cpaas@123",
                  location: `${loc}`,
                },
                url: reqendpoint,
                body: requestData,
                // rejectUnauthorized: false,
                timeout: appConfig.DBapiTimeout,
              },
              (err, resp) => {
                if (err) {
                  Logger.error(
                    `location-dbops.executeDBReadcursor request for location ${loc} - Error: ` + err
                  );
                  reject(err);
                } else {
                  if (resp.statusCode !== 200) {
                    Logger.error(
                      `location-dbops.executeDBReadcursor for location ${loc} result status code:  ${resp.statusCode} , ${resp.body}`
                    );
                    reject(
                      new Error(
                        `Request failed with status code ${resp.statusCode}`
                      )
                    );
                  } else {
                    const responseBody = JSON.parse(resp.body);
                    resolve(responseBody);
                  }
                }
              }
            );
          } else {
            Logger.error(
              `location-dbops.executeDBReadcursor invalid port for location ${loc} `
            );
            reject(new Error(`Invalid port for location ${loc}`));
          }
        })
        .catch((err) => {
          Logger.error("executeDBReadcursor Error:", err);
          reject(err);
        });
    } catch (err) {
      Logger.error(`location-dbops.executeDBReadcursor for location ${loc} - Error: ` + err);
      reject(err);
    }
  });
}

function executeMutipleinsert(
  loc,
  sqlquery,
  bindparams,
  insertoptions,
  OBDinsert = null
) {
  return new Promise((resolve, reject) => {
    try {
      getUrlByLocation(loc)
        .then((port) => {
          if (port) {
            let reqendpoint = `${port}/${loc}/dbOps/executemultipleinsert`;

            let requestData = JSON.stringify({
              sql: sqlquery,
              params: bindparams,
              options: insertoptions,
              isOBDinsert: OBDinsert,
            });

            // console.log("requestData ", requestData);

            request.post(
              {
                headers: {
                  "content-type": "application/json",
                  authorization: "cpaas*Cpaas@123",
                  location: `${loc}`,
                },
                url: reqendpoint,
                body: requestData,
                // rejectUnauthorized: false,
                timeout: appConfig.DBapiTimeout,
              },
              (err, resp) => {
                if (err) {
                  Logger.error(
                    `location-dbops.executeMutipleinsert request for location ${loc} - Error: ` +
                      err
                  );
                  reject(err);
                } else {
                  if (resp.statusCode !== 200) {
                    Logger.error(
                      `location-dbops.executeMutipleinsert for location ${loc} result status code:  ${resp.statusCode} , ${resp.body}`
                    );
                    reject(`${resp.statusCode}`);
                  } else {
                    const responseBody = JSON.parse(resp.body);
                    resolve(responseBody);
                  }
                }
              }
            );
          } else {
            Logger.error(
              `location-dbops.executeMutipleinsert invalid port for location ${loc} `
            );
            reject(new Error(`Invalid port for location ${loc}`));
          }
        })
        .catch((err) => {
          Logger.error("Error:", err);
          reject(err);
        });
    } catch (err) {
      Logger.error(`location-dbops.executeMutipleinsert  for location ${loc}- Error: ` + err);
      reject(err);
    }
  });
}

async function executeDBStreamingPullreport(
  loc,
  sql,
  params,
  cursor,
  exeOptions,
  res
) {
  try {
    const requestData = JSON.stringify({
      sql: sql,
      params: params,
      cursorName: cursor,
      exeoptions: exeOptions,
    });

    let port = await getUrlByLocation(loc);

    if (port) {
      const options = {
        url: `${port}/${loc}/dbOps/cursorstreamingasJSONarray`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(requestData),
          authorization: "cpaas*Cpaas@123",
          location: `${loc}`,
        },
        body: requestData,
        timeout: appConfig.DBapiTimeout,
      };
      return new Promise((resolve, reject) => {
        let chunks = []; // Array to collect all chunks
        let totalSize = 0; // Variable to track total size

        request(options)
          .on("response", (resp) => {
            res.writeHead(200, {
              "Content-Type": "application/json",
            });

            resp.on("data", (chunk) => {
              chunks.push(chunk); // Collect each chunk
              totalSize += chunk.length; // Update total size

              // Check if the total size exceeds 1 GB (1 GB = 1024 * 1024 * 1024 bytes)
              if (totalSize > 1024 * 1024 * 1024) {
                res.writeHead(413, { "Content-Type": "application/json" });
                res.write(JSON.stringify({ error: "Large file size error" }));
                res.end();
                reject(new Error("Large file size error"));
              }
            });

            resp.on("end", () => {
              if (chunks.length === 0) {
                res.write(`[]`);
              } else {
                // Combine all chunks into a single Buffer
                let data = Buffer.concat(chunks).toString();
                try {
                  // Parse the data as JSON
                  let jsonData = JSON.parse(data);
                  // Write the JSON array to the response
                  res.write(JSON.stringify(jsonData));
                } catch (error) {
                  console.error("Error parsing JSON:", error);
                  res.status(500).json({ error: "Error parsing JSON data" });
                }
              }

              res.end();
              resolve();
            });
          })
          .on("error", (error) => {
            console.error("Error:", error);
            res.end();
            reject(error);
          });
      });
    } else {
      Logger.error(`location-dbops.executeDBStreamingPullreport for location ${loc} error` + error);
      throw new Error(`Request failed ,invalid port `);
    }
  } catch (error) {
    console.error("Error:", error);
    Logger.error(`location-dbops.executeDBStreamingPullreport  for location ${loc} `+ error);
    throw error;
  }
}

async function executeDBReadcursorMultiple(
  loc,
  sqlquery,
  bindparams,
  exeoptions,
  cursorname,
  otherparams = [],
  immediateExecution = 0
) {
  /** req.sql,
      req.bindParams,
      req.exeOptions,
      req.cursorName,
      req.numOfRows,
      (req.otherfields = []) */
  return new Promise((resolve, reject) => {
    try {
      getUrlByLocation(loc)
        .then((port) => {
          if (port) {
            let reqendpoint = `${port}/${loc}/dbOps/multireadcursor`;

            let requestData = JSON.stringify({
              sql: sqlquery,
              params: bindparams,
              cursorName: cursorname,
              otherfields: otherparams,
              exeoptions: exeoptions,
              executeImmediate: immediateExecution,
            });

            //console.log("requestData",requestData);

            let _timeout = immediateExecution == 1 ? 30000 : appConfig.DBapiTimeout;

            request.post(
              {
                headers: {
                  "content-type": "application/json",
                  authorization: "cpaas*Cpaas@123",
                  location: `${loc}`,
                },
                url: reqendpoint,
                body: requestData,
                // rejectUnauthorized: false,
                timeout: _timeout,
              },
              (err, resp) => {
                if (err) {
                  Logger.error(
                    `location-dbops.executeDBReadcursor request for location ${loc} - Error: ` + err
                  );
                  reject(err);
                } else {
                  if (resp.statusCode !== 200) {
                    Logger.error(
                      `location-dbops.executeDBReadcursor for location ${loc} result status code:  ${resp.statusCode} , ${resp.body}`
                    );
                    reject(
                      new Error(
                        `Request failed with status code ${resp.statusCode}`
                      )
                    );
                  } else {
                    const responseBody = JSON.parse(resp.body);
                    resolve(responseBody);
                  }
                }
              }
            );
          } else {
            Logger.error(
              `location-dbops.executeDBReadcursor invalid port for location ${loc} `
            );
            reject(new Error(`Invalid port for location ${loc}`));
          }
        })
        .catch((err) => {
          Logger.error("executeDBReadcursor Error:", err);
          reject(err);
        });
    } catch (err) {
      Logger.error(`location-dbops.executeDBReadcursor for location ${loc}  - Error: ` + err);
      reject(err);
    }
  });
}

try {
  // Watch for changes in the configuration file
  fs.watchFile(configFile, (curr, prev) => {
    // Check if modification time has changed
    if (curr.mtime !== prev.mtime) {
      try {
        // Reload the configuration file
        delete require.cache[require.resolve(configFile)];
        tmpappConfig = require(configFile);
        dbOpsEndPoints = tmpappConfig.dbOpsEndPoints;
        console.log("Configuration reloaded.", dbOpsEndPoints);

        // Optionally, you might want to log or take action here
        // to handle the change in configuration.
      } catch (err) {
        console.error("Error reloading configuration:", err);
        Logger.error(`find config edit 01:  ${JSON.stringify(error)}`);
      }
    }
  });
} catch (error) {
  console.log("error on checking log");
  Logger.error(`find config edit:  ${JSON.stringify(error)}`);
}

module.exports.executeDBProcedure = executeDBProcedure;
module.exports.executeDBStreaming = executeDBStreaming;
module.exports.executeDBReadcursor = executeDBReadcursor;
module.exports.executeMutipleinsert = executeMutipleinsert;
module.exports.executeDBStreamingPullreport = executeDBStreamingPullreport;
module.exports.executeDBReadcursorMultiple = executeDBReadcursorMultiple;
