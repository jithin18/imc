const { getPool } = require("oracledb");
const oracledb = require("oracledb");
//const { Logger } = require("../_helpers/logger");
//const appconfig = require("../_config/appconfig.json");

const dbConfig = require("../_helpers/customConfig");
var db_cpaasweb = dbConfig.database.cpaas_web;


function createPool(connectionstring) {
    oracledb.createPool(connectionstring, function (error, pool) {
        if (error) {
            console.log(`Could not create pool using specified attributes poolAlias: ${connectionstring.poolAlias}  ${error.message}`);
        } else {
            console.log(`Pool created successfully using poolAlias: ${connectionstring.poolAlias}`);

            const sql = "select 'test' as c1, 'oracle' as c2 from dual";
        
            oracledb
                .getConnection(db_cpaasweb.poolAlias)
                .then(function (connection) {
                    connection
                        .execute(sql, {}, {})
                        .then(function (results) {
                            console.log(results);

                        })
                        .catch(function (err) {
                            console.log(err);

                        });
                })
                .catch(function (err) {
                    console.log(err);
                });
        }

    });

}

createPool(db_cpaasweb);


