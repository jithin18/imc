const uploadFile = require("../middleware/upload");
var fileService = require("../services/file-service");
const ConfigService = require("../services/configuration-service");
const multer = require("multer");
const FormData = require("form-data");

const fs = require("fs");
const {
  vfilepath,
  tts_url,
  tts_is_proxy,
  tts_proxy,
  tts_ibm_url,
  stt_url,
  tts_azure_url,
  sec_url
} = require("../_helpers/settings");
const { Logger } = require("../_helpers/logger");
var path = require("path");
const request = require("request");
//var fs = require("fs");
const Pattern = /[ \-$&*%@!~#^'()+="?<>,{}]/gi;
var net = require("net");
const upload = async (req, res) => {
  try {
    // console.log("Upload File 1 : ", req);
    let flowid = req.query.flowid;
    var file_extension;

    if (flowid) {
      var resp = await fileService.GetFileId();

      if (resp.fileid > 0) {
        req.newname = resp.fileid;
        //upload the file
        await uploadFile(req, res);

        // req.file.originalname = String(req.file.originalname).replace(/ /gi,"_");
        // console.log("Upload File 2 : ", req.file);
        if (req.file == undefined) {
          return res.status(400).send({ message: "Please upload a file!" });
        } else {
          file_extension = checkFileExtension(req);

          if (file_extension == 4) {
            return res
              .status(400)
              .send({ message: "PTPL103 :Invalid File Format!" });
          }

          let formatedFileName = String(req.file.originalname).replace(
            Pattern,
            "_"
          );

          let uploadedFileName = req.newname + "_" + formatedFileName;

          var filesaveresp = await fileService.AddFile(
            req.user.userid,
            resp.fileid,
            flowid,
            formatedFileName,
            "",
            `${vfilepath}\\${uploadedFileName}`,
            0,
            0,
            0,
            file_extension
          );

          if (filesaveresp.status == 1) {
            uploadFiletoSecondaryServer(`${req.file.path}`);

            res.status(200).send({
              message:
                "File Uploaded Successfully. Filename : " + formatedFileName,
            });
          } else {
            return res.status(500).send({
              message: "PTPL100 :File Upload Failed!",
            });
          }
        }
      } else {
        return res.status(500).send({
          message: "PTPL101 :File Upload Failed!",
        });
      }
    } else {
      return res.status(400).send({ message: "PTPL102 :Not a valid request!" });
    }
  } catch (err) {
    Logger.error(
      "File.Controller.upload() : " +
        `Could not upload the file: ${req.file}. ${err}`
    );
    if (err.code == "LIMIT_FILE_SIZE") {
      return res
        .status(500)
        .send({ message: "File size cannot be larger than 2MB!" });
    }

    res
      .status(500)
      .send({ message: `Could not upload the file:  ${req.file}. ${err}` });
  }
};

function checkFileExtension(req) {
  switch (req.file.mimetype) {
    case "audio/wav":
      return 1;

    case "audio/mpeg":
      return 2;

    case "application/octet-stream":
      if (req.file.originalname.toString().substr(-3).toLowerCase() === "vox") {
        return 3;
      } else {
        return 4;
      }

    default:
      return 4;
  }
}
async function uploadFiletoSecondaryServer(file_path) {
  try {
    const apiEndpoint = sec_url;

    if (!fs.existsSync(file_path)) {
      console.error("File not found:", file_path);
      Logger.error(
        "File.Controller.uploadFiletoSecondaryServer() : " +
          `File not found:. ${file_path}`
      );
      return;
    }

    const formData = {
      file: fs.createReadStream(file_path),
      filepath: file_path,
    };
    request.post(
      {
        url: apiEndpoint,
        formData: formData,
        rejectUnauthorized: false,
        timeout: 60000
      },
      function (error, response, body) {
        if (error) {
          Logger.error(
            "File.Controller.uploadFiletoSecondaryServer() : " + ` ${error}`
          );
        } else {
          Logger.info(
            "File.Controller.uploadFiletoSecondaryServer() : " + ` ${body}`
          );
         // console.log("Response:", body);
        }
      }
    );
  } catch (error) {
    Logger.error(
      "File.Controller.uploadFiletoSecondaryServer() 01: " + ` ${error}`
    );
  }
}
const getListFiles = (req, res) => {
  const directoryPath = __basedir + "/resources/static/assets/uploads/";

  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      res.status(500).send({
        message: "Unable to scan files!",
      });
    }

    let fileInfos = [];

    files.forEach((file) => {
      fileInfos.push({
        name: file,
        url: baseUrl + file,
      });
    });

    res.status(200).send(fileInfos);
  });
};

const download = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/resources/static/assets/uploads/";

  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  });
};

const downloadbyfilename = (req, res) => {
  const fileNamewithpath = req.body.fileNameWithPath;
  const fileName = path.basename(fileNamewithpath);

  res.download(fileNamewithpath, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  });
};

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "./resource");
  },
  filename(req, file, cb) {
    cb(null, file.originalname);
  },
});

const uploadstt = multer({
  storage: storage,
  limits: {
    fileSize: 105906176, // 101 Mb
  },
}).fields([{ name: "sttfile", maxCount: 1 }]);

const getVoiceFileList = async function (req, res, next) {
  try {
    let flowid = req.query.flowid;

    if (flowid) {
      var voicefiles = await fileService.getListFiles(flowid);
      return res.status(200).json({ voicefiles });
    } else {
      return res.status(400).send({ message: "Not a valid request!" });
    }
  } catch (e) {
    Logger.error(
      "file.Controller.getVoiceFileList() : " + JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};

const TTS = async function (req, res) {
  try {
    let type = req.query.type;
    let accid = req.query.accid;
    let ttsProxy = null;
    if (type == "g") {
      // google TTS

      let ttsConfigdata = await ConfigService.GetTTSConfiguration(accid).catch(
        function (error) {
          Logger.error("file.Controller.TTS() : " + JSON.stringify(error));
          return res.status(500).json({ status: 500, message: "server busy" });
        }
      );

      var data = JSON.parse(JSON.stringify(req.body.data));

      let ttsconfig = JSON.parse(JSON.stringify(ttsConfigdata.tts));

      if (
        ttsconfig &&
        JSON.parse(ttsconfig).credential == 1 &&
        JSON.parse(ttsconfig).jsonbody != null
      ) {
        // if account has their own google tts credentials
        data.JsonCredential = JSON.parse(ttsconfig).jsonbody;
      }
      // cpaas 1.70 start
      if(data.LanguageCode !== "en-IN"){
        var scriptContent = data.script.replace(/<\/?speak>/g, "");
        // var scriptContent = req.body.data.script.match(/<speak>(.*?)<\/speak>/)[1];
        var pairs = scriptContent.match(/.{1,4}/g);
        var decodeString = pairs.map(pair => String.fromCharCode(parseInt(pair, 16))).join('');
        var updatedScript =data.script.replace(/<speak>.*?<\/speak>/, `<speak>${decodeString}</speak>`);
        // console.log("updatedScript",updatedScript);
        data.script = updatedScript
      }
      // cpaas 1.70 end

      if (tts_is_proxy == "1") {
        ttsProxy = tts_proxy;
      }

      const requestData = JSON.stringify(data);
      // console.log(requestData,"requestData google");
      try {
        request.post(
          {
            headers: {
              "content-type": "application/json",
            },
            url: tts_url,
            proxy: ttsProxy,
            body: requestData,
            rejectUnauthorized: false,
            timeout: 60000,
          },
          function (err, resp) {
            if (err) {
              console.log(err);
              return res
                .status(400)
                .json({ status: 400, message: JSON.stringify(err) });
            } else {
              //cpaas 1.60 insert tts script length to db against account
              if (accid) {
                var script = req.body.data.script.replace(/<\/?speak>/g, "");

                fileService.TTSCountInsert(accid, script.length, 1);
              }
              //cpaas 1.60 end
              var basestring = resp.body.toString().replace('"', "");
              //  fs.writeFileSync('d://home//file11.wav', Buffer.from(basestring.replace('data:audio/wav; codecs=opus;base64,', ''), 'base64'));
              var resultfile = Buffer.from(
                basestring.replace("data:audio/wav; codecs=opus;base64,", ""),
                "base64"
              );
              return res.status(200).send(resultfile);
            }
          }
        );
      } catch (err) {
        console.error(err);
        return res
          .status(500)
          .json({ status: 500, message: "Internal server error" });
      }
    } else if (type == "az") {
      // google TTS
      let ttsConfigdata = await ConfigService.GetTTSConfiguration(accid).catch(
        function (error) {
          Logger.error("file.Controller.TTS() : " + JSON.stringify(error));
          return res.status(500).json({ status: 500, message: "server busy" });
        }
      );
      var data = JSON.parse(JSON.stringify(req.body.data));

      if (ttsConfigdata) {
        let ttsconfig = JSON.parse(JSON.stringify(ttsConfigdata.tts));

        if (
          ttsconfig &&
          JSON.parse(ttsconfig).credential == 1 &&
          JSON.parse(ttsconfig).jsonbody != null
        ) {
          // if account has their own google tts credentials
          data.JsonCredential = JSON.parse(ttsconfig).jsonbody;
        }
      }
      // cpaas 1.70 start
      if(data.LanguageCode !== "en-IN"){
        var scriptContent = data.script;
        // var scriptContent = req.body.data.script.match(/<speak>(.*?)<\/speak>/)[1];
        // console.log("scriptContent",scriptContent);
        var pairs = scriptContent.match(/.{1,4}/g);
        var decodeString = pairs.map(pair => String.fromCharCode(parseInt(pair, 16))).join('');
        // console.log("decodeString",decodeString);
        data.script = decodeString;
      }
      // cpaas 1.70 end

      if (tts_is_proxy == "1") {
        ttsProxy = tts_proxy;
      }

      const requestData = JSON.stringify(data);
      // console.log(requestData,"requestData azure");
      try {
        request.post(
          {
            headers: {
              "content-type": "application/json",
            },
            url: tts_azure_url.trim(),
            proxy: ttsProxy,
            body: requestData,
            rejectUnauthorized: false,
            timeout: 60000,
          },
          function (err, resp) {
            if (err) {
              console.log(err);
              return res
                .status(400)
                .json({ status: 400, message: JSON.stringify(err) });
            } else {

              //cpaas 1.60 insert tts script length to db against account
              if (accid) {
                var script = req.body.data.script;

                fileService.TTSCountInsert(accid, script.length, 1);
              }
              //cpaas 1.60 end
              var basestring = resp.body.toString().replace('"', "");
              //  fs.writeFileSync('d://home//file11.wav', Buffer.from(basestring.replace('data:audio/wav; codecs=opus;base64,', ''), 'base64'));
              var resultfile = Buffer.from(
                basestring.replace("data:audio/wav; codecs=opus;base64,", ""),
                "base64"
              );
              return res.status(200).send(resultfile);
            }
          }
        );
      } catch (err) {
        console.error(err);
        return res
          .status(500)
          .json({ status: 500, message: "Internal server error" });
      }
    } else {
      //IBM TTS

      const formData = {
        text: req.body.text,
      };
      const options = {
        // your request options here
        url: tts_ibm_url,
        formData: formData, // This is where you specify the form data
        headers: {
          "Content-Type": "application/x-www-form-urlencoded", // Set the content type to form data
          Accept: "audio/wav;rate=8000;",
        },

        //CONTENT TYPE JSON
        // url: "http://192.9.200.52:1081/text-to-speech/api/v1/synthesize",
        // headers: {
        //   "Content-Type": "application/json",
        //   Accept: "audio/wav;rate=8000;",
        // },
        // body: JSON.stringify({
        //   text: "Hello world , welcome to prudent technologies",
        // }),
      };

      request
        .post(options)
        .on("error", (err) => {
          Logger.error("file.Controller.TTS() : " + JSON.stringify(err));

          res.status(500).json({ error: "An error occurred" });
        })
        .on("response", (response) => {
          // Set the response headers
          res.setHeader("Content-Type", response.headers["content-type"]);
          res.setHeader("Content-Disposition", 'inline; filename="result.wav"'); // Optional

          //log content length
          fileService.TTSCountInsert(accid, req.body.text.length, 2);
          // Pipe the response from the first API directly to the client
          response.pipe(res);
        });

      //----------------------------
    }
  } catch (e) {
    Logger.error("file.Controller.TTS() 01 : " + e);
    return res
      .status(400)
      .json({ status: 400, message: "something went wrong" });
  }
};

function _base64ToArrayBuffer(base64s) {
  var binary_string = window.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
  // const myBuffer = Buffer.from(
  //   base64s.replace("data:audio/wav; codecs=opus;base64,", ""),
  //   "base64"
  // );
  // return myBuffer;
}

const STT = async function (req, res) {
  try {
    uploadstt(req, res, function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Error uploading file",
          data: err,
        });
      }
      //console.log(req.files, "file");
      const sttFile = req.files.sttfile;
      const filename = sttFile[0].filename;

      // console.log(filename, "fn");

      const file = fs.readFileSync(`./resource/${filename}`);
      var options = {
        method: "POST",
        url: stt_url,
        headers: {
          "Content-Type": sttFile.mimetype,
        },
        body: file,
      };

      request(options, function (error, response, body) {
        // Delete the uploaded file after processing
        fs.unlink(`./resource/${filename}`, (unlinkError) => {
          if (unlinkError) {
            console.error("Error deleting file:", unlinkError);
          }
        });

        if (error) {
          console.error(error);
          res.status(500).json({
            message: "Internal Error",
            data: error,
          });
        } else {
          try {
            const modifiedbody = JSON.stringify(JSON.parse(body));

            res.status(response.statusCode).send(modifiedbody);
          } catch (parseError) {
            console.error(parseError);
            res.status(500).json({
              message: "Error parsing response",
              data: parseError,
            });
          }
        }
      });
    });
  } catch (error) {
    // console.log(error, "err");
    res.status(500).json({
      message: "Internal Error",
      data: error,
    });
  }
};

const STText = async function (req, res) {
  try {
    let filename = req.body.filename;
    let hostip = req.body.host;
    let portreq = req.body.port;
    let accid = req.query.accid;
    let lob = null;
    //let cnt = 0;

    if (filename && hostip && portreq) {
      var client = new net.Socket();
      let collectedLob = Buffer.alloc(0); // Initialize a buffer to accumulate data

      // connect with pru remote file service to get data
      client.connect({ port: portreq, host: hostip }, function () {
        client.write(`${filename}\r\n`);
      });

      client.on("data", function (data) {
        try {
          if (data) {
            lob = data;
            lob.name = filename;
            collectedLob = Buffer.concat([collectedLob, lob]); // Append lob to the accumulated data
          } else {
            return res
              .status(404)
              .json({ status: 404, message: "File not found" });
          }
        } catch (e) {
          Logger.error("getVoiceRecording for STT", JSON.stringify(e));
        }
      });

      client.on("close", function () {
        Logger.info("getVoiceRecording for STT Connection closed");
        client.destroy();
      });

      client.on("timeout", function () {
        Logger.error("getVoiceRecording for STT Connection timeout");
        client.destroy();
        return res.status(400).json({ status: 400, message: "timeout" });
      });

      client.on("error", function (error) {
        Logger.error("getVoiceRecording for STT err:" + JSON.stringify(error));
        client.destroy();
        return res
          .status(400)
          .json({ status: 400, message: "invalid request" });
      });

      client.on("end", function () {
        // Send the accumulated lob data at the end
        // Push the lob data to the uploadstt API

        pushLobToUploadSTT(collectedLob, res, accid);
        // res.write(collectedLob);
        // res.end();
      });
    } else {
      return res.status(400).json({ status: 400, message: "invalid request" });
    }
  } catch (e) {
    Logger.error("file.Controller.STT() 01 : " + e);
    return res
      .status(400)
      .json({ status: 400, message: "something went wrong" });
  }
};

function pushLobToUploadSTT(lob, res, accid) {
  let ttsProxy = null;

  if (tts_is_proxy == "1") {
    ttsProxy = tts_proxy;
  }
  var options = {
    method: "POST",
    url: stt_url,
    proxy: ttsProxy,
    headers: {
      "Content-Type": "audio/wav", // Adjust the content type as needed
    },
    body: lob, // Send the lob data as the request body
  };

  request(options, function (error, response, body) {
    if (error) {
      res.status(500).json({
        message: "Internal Error",
        data: error,
      });
    } else {
      try {
        /**stt responce is like -- 
         * {"result_index":0,"results":[{"final":true,"alternatives":[{"transcript":"thank you for reaching little flower clinic
","confidence":0.92}]}]}
         */

        //take first alternative only

        let modifiedbody = "";

        if (JSON.parse(body)) {
          for (var i = 0; i < JSON.parse(body).results.length; i++) {
            modifiedbody =
              modifiedbody +
              " " +
              JSON.parse(body)
                .results[i].alternatives[0].transcript.toString()
                .trim();
          }

          fileService.TTSCountInsert(accid, modifiedbody.length, 0);

          res.status(response.statusCode).send(modifiedbody);
        } else {
          res.status(500).json({
            message: "invalid resp",
            data: parseError,
          });
        }
      } catch (parseError) {
        console.error("parseError ERROR", parseError);

        res.status(500).json({
          message: "Error parsing response",
          data: parseError,
        });
      }
    }
  });
}

module.exports = {
  upload,
  getVoiceFileList,
  download,
  downloadbyfilename,
  TTS,
  STT,
  STText,
};
