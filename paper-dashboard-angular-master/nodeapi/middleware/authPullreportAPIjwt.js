const jwtTokenService = require("../_helpers/jwt-token-service");
const jwt = require("jsonwebtoken");
const config = require("../_config/auth-config.js");

function verifyPullReportAPIToken(req, res, next) {
    // Gather the jwt access token from the request header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) return res.sendStatus(401); // if there isn't any token
  
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return res.sendStatus(403);
      } else {
        req.user = decoded;
        if (
          !req.user.loginid ||
          !req.user.userid ||
          !req.user.password ||
          !req.user.dni
        ) {
          return res.sendStatus(406);
        } else if (req.user.dni != req.body.dni) {
          return res.sendStatus(406);
        }
        next();
      } // pass the execution off to whatever request the client intended
    });
  }
  module.exports = verifyPullReportAPIToken;
