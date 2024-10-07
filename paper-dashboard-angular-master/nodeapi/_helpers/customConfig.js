const appconfig = require("../_config/appconfig.json");
const encdec = require("./aes-256-cbc");


const database = JSON.parse(encdec.decrypt(appconfig.database));

module.exports.database = database;
