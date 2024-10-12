const oracledb = require("oracledb");
const oraclehelperdb = require("../_helpers/oracle-service");
const oracleConnection = require("../database/oracle-connection");
const { Logger } = require("../_helpers/logger");
const appconfig = require("../_config/appconfig.json");
//const db_cpaasweb = appconfig.database.cpaas_web;
const dbConfig = require("../_helpers/customConfig");
const locationDBops = require("../database/location-dbops");
var db_cpaasweb = dbConfig.database.cpaas_web;


function getallcalldetails(req) {
    let dbConnection;
    let sql = `BEGIN vb_call_dashboard_prc(:v_in_json, :v_json_out, :ref_cur_out); END;`;

   
    let bindParams = {
      v_in_json: { val: JSON.stringify(req), dir: oracledb.BIND_IN, type: oracledb.STRING }, // Stringify req for input
      v_json_out: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 5000 }, // Output bind for v_json_out
      ref_cur_out: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } // Output bind for ref_cur_out cursor
    };


    return new Promise(function (resolve, reject) {
      oracleConnection
        .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
        .then(function (result) {
      
            
          dbConnection = result.dbConnection;
          const v_json_out = result.dbResult.outBinds.v_json_out;

          // Fetch the cursor data from `ref_cur_out`
          oracleConnection
            .getCursorData(result.dbResult.outBinds.ref_cur_out, 500)
            .then(function (cursorResult) {
              // Resolve both `v_json_out` and the cursor data
              resolve({
                v_json_out: v_json_out,  // Output from `v_json_out`
                ref_cur_out: cursorResult // Cursor data
              });
            })
            .catch(function (err) {
              Logger.error("Error fetching cursor data in getallcalldetails: " + err);
              reject(err);
            });
        })
        .catch(function (err) {
          Logger.error("Error executing procedure in getallcalldetails: " + err);
          reject(err);
        });
    }).finally(function () {
      // Release the database connection
      oracleConnection.connRelease(dbConnection);
    });
}

function getpeakhourcallbarchart(req) {

    let dbConnection;
    let sql = `BEGIN vb_call_dashboard_analysis_prc(:v_in_json, :ref_cur_out); END;`;

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
function getkeywords(req) {
    let dbConnection;
    let sql = `BEGIN vb_keyword_summary_out_prc(v_json_in => :v_json_in, ref_cur => :ref_cur); END;`;

    // Prepare bind parameters for input and output
    let bindParams = {
        v_json_in: { val: JSON.stringify(req), dir: oracledb.BIND_IN, type: oracledb.STRING }, // Stringify req for input
        ref_cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } // Output bind for ref_cur_out cursor
    };

    
   
    return new Promise(function (resolve, reject) {
        // Execute the procedure
        oracleConnection
            .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
            .then(function (result) {
                dbConnection = result.dbConnection; // Store the connection
                
                // Fetch the cursor data from `ref_cur_out`
                oracleConnection
                    .getCursorData(result.dbResult.outBinds.ref_cur, 500)
                    .then(function (cursorResult) {
                        // Resolve with the cursor data
                        
                        
                        resolve({
                            ref_cur: cursorResult // Cursor data
                        });
                    })
                    .catch(function (err) {
                        Logger.error("Error fetching cursor data in getkeywords: " + err);
                        reject(err);
                    });
            })
            .catch(function (err) {
                Logger.error("Error executing procedure in getkeywords: " + err);
                reject(err);
            });
    }).finally(function () {
        // Release the database connection
        if (dbConnection) {
            oracleConnection.connRelease(dbConnection);
        }
    });
}

function gettopkeywords(req) {
    let dbConnection;
    let sql = `BEGIN vb_top_three_produts_prc(v_json_in => :v_json_in, ref_cur => :ref_cur); END;`;

    // Prepare bind parameters for input and output
    let bindParams = {
        v_json_in: { val: JSON.stringify(req), dir: oracledb.BIND_IN, type: oracledb.STRING }, // Stringify req for input
        ref_cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } // Output bind for ref_cur_out cursor
    };

    console.log(bindParams, "bindParams_gettopkeywords");
    
   
    return new Promise(function (resolve, reject) {
        // Execute the procedure
        oracleConnection
            .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
            .then(function (result) {
                dbConnection = result.dbConnection; // Store the connection
                
                // Fetch the cursor data from `ref_cur_out`
                oracleConnection
                    .getCursorData(result.dbResult.outBinds.ref_cur, 500)
                    .then(function (cursorResult) {
                        // Resolve with the cursor data
                        console.log(cursorResult, "cursorResult_gettopkeywords");
                        
                        resolve({
                            ref_cur: cursorResult // Cursor data
                        });
                    })
                    .catch(function (err) {
                        Logger.error("Error fetching cursor data in gettopkeywords: " + err);
                        reject(err);
                    });
            })
            .catch(function (err) {
                Logger.error("Error executing procedure in gettopkeywords: " + err);
                reject(err);
            });
    }).finally(function () {
        // Release the database connection
        if (dbConnection) {
            oracleConnection.connRelease(dbConnection);
        }
    });
}
function gettopproduct(req) {
    let dbConnection;
    let sql = `BEGIN vb_top_product_rept_prc(v_json_in => :v_json_in, ref_out  => :ref_out ); END;`;

    // Prepare bind parameters for input and output
    let bindParams = {
        v_json_in: { val: JSON.stringify(req), dir: oracledb.BIND_IN, type: oracledb.STRING }, // Stringify req for input
        ref_out: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } // Output bind for ref_cur_out cursor
    };

    console.log(bindParams, "bindParams_gettoppdt");
    
   
    return new Promise(function (resolve, reject) {
        // Execute the procedure
        oracleConnection
            .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
            .then(function (result) {
                dbConnection = result.dbConnection; // Store the connection
                
                // Fetch the cursor data from `ref_cur_out`
                oracleConnection
                    .getCursorData(result.dbResult.outBinds.ref_out, 500)
                    .then(function (cursorResult) {
                        // Resolve with the cursor data
                        console.log(cursorResult, "cursorResult_gettoppdt");
                        
                        resolve({
                            ref_out: cursorResult // Cursor data
                        });
                    })
                    .catch(function (err) {
                        Logger.error("Error fetching cursor data in gettoppdt: " + err);
                        reject(err);
                    });
            })
            .catch(function (err) {
                Logger.error("Error executing procedure in gettoppdt: " + err);
                reject(err);
            });
    }).finally(function () {
        // Release the database connection
        if (dbConnection) {
            oracleConnection.connRelease(dbConnection);
        }
    });
}


function getsentimentchart(req) {
    
    let dbConnection;
    let sql = `BEGIN vb_query_analysis_prc(:v_in_json, :ref_cur_out); END;`;

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
                        Logger.error("Error fetching cursor data in getsentimentchart: " + err);
                        reject(err);
                    });
            })
            .catch(function (err) {
                Logger.error("Error executing procedure in getsentimentchart: " + err);
                reject(err);
            });
    }).finally(function () {
        // Release the database connection
        if (dbConnection) {
            oracleConnection.connRelease(dbConnection);
        }
    });
}

// function getfaq(req) {
//     let dbConnection;
//     let sql = `BEGIN vb_questions_out_prc(:v_in_json, :v_json_out); END;`;

   
//     let bindParams = {
//       v_in_json: { val: JSON.stringify(req), dir: oracledb.BIND_IN, type: oracledb.STRING }, // Stringify req for input
//       v_json_out: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 5000 }, // Output bind for v_json_out
      
//     };
// console.log(bindParams,"bindParams");	

//     return new Promise(function (resolve, reject) {
//       oracleConnection
//         .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
//         .then(function (result) {
//             console.log(result);
            
//           dbConnection = result.dbConnection;
//           const v_json_out = result.dbResult.outBinds.v_json_out;
//           resolve({
//             v_json_out: v_json_out
//           });

          
//         }
//             .catch(function (err) {
//               Logger.error("Error fetching cursor data in getallcalldetails: " + err);
//               reject(err);
//             });
//         })
//         .catch(function (err) {
//           Logger.error("Error executing procedure in getallcalldetails: " + err);
//           reject(err);
//         });
//     }).finally(function () {
//       // Release the database connection
//       oracleConnection.connRelease(dbConnection);
//     });
// }

function getfaq(req) {
    let dbConnection;
    const sql = `BEGIN vb_questions_out_prc(:v_in_json, :v_json_out); END;`;

    const bindParams = {
        v_in_json: { val: JSON.stringify(req), dir: oracledb.BIND_IN, type: oracledb.STRING }, // Stringify req for input
        v_json_out: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 5000 }, // Output bind for v_json_out
    };

    

    return new Promise((resolve, reject) => {
        // Attempt to execute the procedure
        oracleConnection
            .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
            .then((result) => {
                dbConnection = result.dbConnection;  // Store the database connection
                const v_json_out = result.dbResult.outBinds.v_json_out;
                
                
                // Resolve with the output
                resolve({ v_json_out: v_json_out });
            })
            .catch((err) => {
                // Log error and reject the promise
                Logger.error("Error fetching data in getfaq: " + err);
                reject(err);
            });
    })
    .finally(() => {
        // Release the database connection if it was acquired
        if (dbConnection) {
            oracleConnection.connRelease(dbConnection);
        }
    });
}
function getbotsummary(req) {
    let dbConnection;
    const sql = `BEGIN vb_sentiment_dashboard_prc(:v_in_json, :v_json_out); END;`;

    const bindParams = {
        v_in_json: { val: JSON.stringify(req), dir: oracledb.BIND_IN, type: oracledb.STRING }, // Stringify req for input
        v_json_out: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 5000 }, // Output bind for v_json_out
    };

  

    return new Promise((resolve, reject) => {
        // Attempt to execute the procedure
        oracleConnection
            .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
            .then((result) => {
                dbConnection = result.dbConnection;  // Store the database connection
                const v_json_out = result.dbResult.outBinds.v_json_out;
               
                
                // Resolve with the output
                resolve({ v_json_out: v_json_out });
            })
            .catch((err) => {
                // Log error and reject the promise
                Logger.error("Error fetching data in getbotsummary: " + err);
                reject(err);
            });
    })
    .finally(() => {
        // Release the database connection if it was acquired
        if (dbConnection) {
            oracleConnection.connRelease(dbConnection);
        }
    });
}

function getqueryanalysis(req) {
    
    let dbConnection;
    let sql = `BEGIN vb_query_analysis_prc(:v_in_json,:ref_cur_out); END;`;

   
    let bindParams = {
      v_in_json: { val: JSON.stringify(req), dir: oracledb.BIND_IN, type: oracledb.STRING }, // Stringify req for input
      ref_cur_out: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } // Output bind for ref_cur_out cursor
    };

  
  
    return new Promise(function (resolve, reject) {
      oracleConnection
        .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
        .then(function (result) {
            
          dbConnection = result.dbConnection;
          

          // Fetch the cursor data from `ref_cur_out`
          oracleConnection
            .getCursorData(result.dbResult.outBinds.ref_cur_out, 500)
            .then(function (cursorResult) {
               
                
              resolve({
                ref_cur_out: cursorResult // Cursor data
              });
            })
            .catch(function (err) {
              Logger.error("Error fetching cursor data in getqueryanalysis: " + err);
              reject(err);
            });
        })
        .catch(function (err) {
          Logger.error("Error executing procedure in getqueryanalysis: " + err);
          reject(err);
        });
    }).finally(function () {
      // Release the database connection
      oracleConnection.connRelease(dbConnection);
    });
}


module.exports = {
    
    getallcalldetails,getpeakhourcallbarchart,getsentimentchart,getfaq,getqueryanalysis,getbotsummary,getkeywords,gettopkeywords,gettopproduct
}