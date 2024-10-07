// Firstly we'll need to import the fs library
var fs = require("fs");
const moment = require("moment");
const appConfig = require("../_config/appconfig.json");

// next we'll want make our Logger object available
// to whatever file references it.
var Logger = (exports.Logger = {});
var infoStream, errorStream, debugStream;
var lastFileCreatedDate;

createDir(appConfig.log.path);

function createStream() {
  // Create 3 sets of write streams for the 3 levels of logging we wish to do
  // every time we get an error we'll append to our error streams, any debug message
  // to our debug stream etc...
  try {
    if (infoStream) infoStream.close();
    if (errorStream) errorStream.close();
    if (debugStream) debugStream.close();
  } catch (err) {
    console.log(err);
  }

  infoStream = fs.createWriteStream(
    `${appConfig.log.path + moment().format("DDMMMYYYYHH")}_Info.txt`,
    {
      flags: "a",
    }
  );
  // Notice we set the path of our log files in the first parameter of
  // fs.createWriteStream. This could easily be pulled in from a config
  // file if needed.
  errorStream = fs.createWriteStream(
    `${appConfig.log.path + moment().format("DDMMMYYYYHH")}_Error.txt`,
    {
      flags: "a",
    }
  );
  // createWriteStream takes in options as a second, optional parameter
  // if you wanted to set the file encoding of your output file you could
  // do so by setting it like so: ('logs/debug.txt' , { encoding : 'utf-8' });
  debugStream = fs.createWriteStream(
    `${appConfig.log.path + moment().format("DDMMMYYYYHH")}_Debug.txt`,
    {
      flags: "a",
    }
  );
  // console.log("lastFileCreatedDate Before: ", lastFileCreatedDate);
  lastFileCreatedDate = moment().format("DDMMMYYYYHH");
  // console.log("lastFileCreatedDate After: ", lastFileCreatedDate);
}

// createStream();

function createDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
}
// Finally we create 3 different functions
// each of which appends our given messages to
// their own log files along with the current date as an
// iso string and a \n newline character

exports.Logger.info = function (msg) {
  try {
    if (appConfig.log.logInfo) {
      if (lastFileCreatedDate != moment().format("DDMMMYYYYHH")) {
        createStream();
      }
      var message =
        new Date().toString().substring(0, 25) + " : Info : " + msg + "\n";
      infoStream.write(message);
    }
  } catch (error) {
    console.log(
      new Date().toString().substring(0, 25) +
        " Error in Info Logger : Error" +
        error
    );
  }
};

exports.Logger.debug = function (msg) {
  try {
    if (appConfig.log.logDebug) {
      if (lastFileCreatedDate != moment().format("DDMMMYYYYHH")) {
        createStream();
      }
      var message =
        new Date().toString().substring(0, 25) + " : Debug : " + msg + "\n";
      debugStream.write(message);
    }
  } catch (error) {
    console.log(
      new Date().toString().substring(0, 25) +
        " Error in Debug Logger : Called !"
    );
  }
};

exports.Logger.error = function (msg) {
  try {
    if (lastFileCreatedDate != moment().format("DDMMMYYYYHH")) {
      createStream();
    }
    var message =
      new Date().toString().substring(0, 25) + " : Error :" + msg + "\n";
    errorStream.write(message);
  } catch (error) {
    console.log(
      new Date().toString().substring(0, 25) +
        " Error in Error Logger : Called !"
    );
  }
};
