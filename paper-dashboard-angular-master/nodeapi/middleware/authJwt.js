const jwt = require("jsonwebtoken");
const config = require("../_config/auth-config.js");
const oracleConnection = require("../database/oracle-connection");
const oracledb = require("oracledb");
dbConfig = require("../_helpers/customConfig");
const { Logger } = require("../_helpers/logger");
var db_cpaasweb = dbConfig.database.cpaas_web;

function verifyToken(req, res, next) {
  // Gather the jwt access token from the request header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401); // if there isn't any token

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.sendStatus(403);
    } else {
      req.user = decoded;
      // if (!req.user.userid || !req.user.role) {
      //   return res.sendStatus(406);
      // }
      // next();

      if (!req.user.userid || !req.user.role) {
        return res.sendStatus(406);
      } else {
        let sts = 0;
        checkuserLoggedinornot(req.user.loginid)
          .then((res) => {
            // console.log("res ", res);
            sts = res;

            if (sts == 1) {
              next();
            } else {
              return res.sendStatus(406);
            }
          })
          .catch((err) => {
            return res.sendStatus(406);
          });
      }
    } // pass the execution off to whatever request the client intended
  });
}

function checkuserLoggedinornot(loginid) {
  /*paas_Agent_login_update_Prc(n_login_id_in  in number,
                                                         n_user_id_in   in number,
                                                         n_type_in      in number,
                                                         n_agent_id_out out number,
                                                         n_Status_Out   Out Number) Is

 
 type= 1 login
 2 = logout*/

  options = { outFormat: oracledb.OBJECT };

  let dbConnection;
  let sql = `BEGIN
  cp_login_status_out_prc(:n_login_id_in,:n_status_out );
END;`;

  let bindParams = {
    n_login_id_in: loginid,
    n_status_out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  // console.log("cp_login_status_out_prc bindParams ", bindParams);

  //------------------------------//
  return new Promise(function (resolve, reject) {
    oracleConnection
      .executeProcedure(db_cpaasweb.poolAlias, sql, bindParams)
      .then(function (result) {
        dbConnection = result.dbConnection;
        resolve(result.dbResult.outBinds.n_status_out);
      })
      .catch(function (err) {
        Logger.error("Error in checkuserLoggedinornot : " + err);
        reject(err);
      });
  }).finally(function () {
    oracleConnection.connRelease(dbConnection);
  });
}

module.exports = verifyToken;
