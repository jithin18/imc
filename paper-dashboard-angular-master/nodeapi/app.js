process.env.UV_THREADPOOL_SIZE = 60;

const express = require("express");
const verifyjwtToken = require("./middleware/authJwt");
const queryparamsauth = require("./middleware/queryparamsauth");
// const morgan = require('morgan');
const rfs = require("rotating-file-stream");
// const path = require('path');
// const moment = require('moment');
const { Logger } = require("./_helpers/logger");

const reports = require("./routes/reports.routes");
const vfile = require("./routes/file.routes");

const vfiledownload = require("./routes/filedownload.routes");
const voice = require("./routes/voice.routes");

const mail = require("./routes/mail.routes");

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const AppConfig = require("./_config/appconfig.json");
const test = require("./routes/test.routes");


const rateLimit = require("express-rate-limit");



// Node.js used 4 background threads by default, increase to handle max DB pool.
// This must be done before any other calls that will use the libuv threadpool.
// SET UV_THREADPOOL_SIZE=100

var app = express();

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per minute
  message: "Too many requests, please try again later.",
  keyGenerator: function (req) {
    return req.ip; // Limit requests based on the client IP address
  },
});
// app.use(limiter);
// Apply rate limiting middleware conditionally
app.use((req, res, next) => {
  // Define an array of paths that should not be rate limited
  const includePaths = [
    "/api/voice/getVoiceRecording",
    
  ];
  // Check if the current request path is in the excluded paths
  // console.log("req.path",req.path);
  if (includePaths.includes(req.path)) {
    limiter(req, res, next); // Apply rate limiting
   
  } else {
    next(); // Skip rate limiting for this path
  }
});

port = AppConfig.port;

app.use(bodyParser.json({ limit: "50mb" }));

app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(cookieParser());

// var corsOptions = {
//   origin: ["http://localhost:3090", "http://localhost:4200"],
// };

// app.use(express.static(process.cwd() + "/cpaas-app/"));


app.use("/api/reports",  queryparamsauth, reports);
app.use("/api/file", verifyjwtToken, queryparamsauth, vfile);


app.use("/api/filedownload", vfiledownload);

app.use("/api/mail", mail);
app.use("/api/voice", voice);


//schema api requests



process.on("unhandledRejection", (error, promise) => {
  Logger.error(
    "################### unhandledRejection ################### : " +
      error +
      " ### " +
      promise +
      " Error 2 : " +
      error.stack
  );
});

process.on("uncaughtException", (error, origin) => {
  Logger.error(
    "################### uncaughtException ################### : " +
      error +
      " ### " +
      JSON.stringify(origin)
  );
});

app.listen(port, () => {
  console.log(
    ` ##################### CPaaS 2.0 Node App Started on port : ${port}  ##################### `
  );
  Logger.info(
    ` ##################### CPaaS 2.0 Node App Started on port : ${port}  #####################  process.env.UV_THREADPOOL_SIZE : ${process.env.UV_THREADPOOL_SIZE} `
  );
});
