const jwt = require("jsonwebtoken");

const config = require("../_config/auth-config.js");

function generateToken(payload) {
  var token = jwt.sign(payload, config.secret, {algorithm: "HS256",expiresIn: 36000 });
  return token;
}

function generateAPIToken(payload) {
  var token = jwt.sign(payload, config.secret, {algorithm: "HS256",expiresIn: 86400 });
  return token;
}

module.exports.generateToken = generateToken;
module.exports.generateAPIToken = generateAPIToken;

