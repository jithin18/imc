var fs = require('fs');
var express = require("express");
var morgan = require('morgan');
var path = require('path');
var app = express();
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'requestLog123.log'), { flags: 'a' });

function logRequest( req, res, next) {

    // create a write stream (in append mode)
   

    // setup the logger
    app.use(morgan('combined'));
    next();
}

module.exports.logRequest = logRequest;