var voiceService = require("../services/voice-service");
const { Logger } = require("../_helpers/logger");
//const appconfig = require("../_config/appconfig.json");
const { response } = require("express");
var net = require("net");
var path = require("path");
//const oracledb = require("oracledb");
const { Readable } = require("stream");

const dbConfig = require("../_helpers/customConfig");

// exports.getVoiceRecording = async function (req, res, next) {
//     try {
//         var str = '';
//         var respData = await voiceService.getVoiceRecording(appconfig.database.AP, req.query.callid);
//         var lob = respData.blob_voicefile;
//         var filename = respData.filename;
//         // audiobuffer.setEncoding('utf8');
//         // console.log("audiobuffer : ", audiobuffer);
//         // res.setHeader('Content-Type', 'audio/mpeg');
//         // res.setHeader('Content-Length', '1024');
//         // // res.setHeader('Content-Disposition', "attachment;");
//         // res.setHeader('accept-ranges', 'bytes');
//         // console.log("typeof audiobuffer : ", typeof audiobuffer);
//         // console.log("blob.size : ", audiobuffer.length);
//         // console.log("blob.type : ", audiobuffer.type);

//         // // audiobuffer.on('data', (chunk) => {
//         // //     res.write(chunk);
//         // // });

//         //  audiobuffer.on('error', (error) => {
//         //     res.sendStatus(404);
//         //     console.log("Error 404:  ", error);
//         // });

//         //  audiobuffer.on('end', () => {
//         //     // res.end();
//         //     console.log("Blob End  ");
//         // });
//         // res.status(200);
//         // audiobuffer.pipe(res.send(''));

//         // if (lob.type === oracledb.BLOB) {
//         // lob.setEncoding('utf8');  // set the encoding so we get a 'string' not a 'buffer'
//         // }

//         // lob.on('error', function (err) { console.log("Error 1111:  ", err); cb(err); });
//         // // lob.on('end', function () { console.log("end:  "); });   // all done.  The Lob is automatically closed.
//         // lob.on('data', function (chunk) {
//         //    str = str.concat(chunk); // or use Buffer.concat() for BLOBS
//         // });
//         // // const outStream = await fileSystem.createWriteStream('123.wav');
//         // // outStream.on('error', function (err) { console.log("Error 22222:  ", err); cb(err); });
//         // lob.on('end', function () {
//         //     fileSystem.writeFile('123.wav', str, { flag: "w" }, function () { });
//         // });

//         fileSystem.writeFile(filename, lob, { flag: "w" }, function () {

//             var stat = fileSystem.statSync(filename);

//             res.writeHead(200, {
//                 'Content-Type': 'audio/wav',
//                 'Content-Length': stat.size
//             });

//             var readStream = fileSystem.createReadStream(filename);
//             readStream.pipe(res);
//         });

//         // const outStream = await fileSystem.createWriteStream('123.wav');
//         // outStream.on('error', function (err) { console.log("Error 22222:  ", err); cb(err); });
//         // console.log("Lob Data:  ", lob);
//         // // switch into flowing mode and push the LOB to myoutput.txt
//         // await lob.pipe(outStream);

//     } catch (e) {
//         Logger.error("voice.Controller.getVoiceRecording() : " + JSON.stringify(e.message));
//         console.log("Error :  ", e);
//         return res.status(400).json({ status: 400, message: e.message });
//     }
// };

exports.getVoiceRecording = async function (req, res, next) {
  try {
    var str = "";
    var circle = req.query.circle;
    var recid = req.query.recid;

    let cnt = 0;

    var respData = await voiceService.getVoiceRecordingdetails(
      circle,
      req.query.callid,
      recid
    );

   
    // var lob = respData.blob_voicefile;
    // var filename = respData.filename;

    // if (lob) {
    //   lob.name = filename;

    //   res.writeHead(200, {
    //     "Content-Type": "audio/wav",
    //     "Content-Length": lob.length,
    //     "Content-Disposition": "inline; filename=" + filename,
    //   });
    //   // 'Content-Disposition': 'inline; filename=' + filename
    //   const stream = Readable.from(lob);
    //   stream.pipe(res);
    // } else {
    //   return res.status(404).json({ status: 404, message: "File not found" });
    // }

    var filename = respData.filename;
    var voicerecord_server_Port = respData.port;
    var voicerecord_server_IP = respData.host;

    var file = path.basename(filename);

   

    if (filename) {
      var client = new net.Socket();
      client.connect(
        { port: voicerecord_server_Port, host: voicerecord_server_IP },
        function () {
         
          client.write(`${filename}\r\n`);
        }
      );

      client.on("data", function (data) {
        try {
          if (data) {
            lob = data;
            lob.name = file;
           
            if (cnt == 0)
              res.writeHead(200, {
                "Content-Type": "audio/wav",
                "Content-Disposition": "inline; filename=" + file,
              });

            cnt++;
          
            res.write(lob);
          } else {
           
            return res
              .status(404)
              .json({ status: 404, message: "File not found" });
          }
        } catch (e) {
         
          Logger.error("getVoiceRecording ", JSON.stringify(e));
        }
      });

      client.on("close", function () {
      //  Logger.info("getVoiceRecording Connection closed");
        client.destroy();
      });

      client.on("timeout", function () {
        Logger.error("getVoiceRecording Connection timeout");
      });

      client.on("error", function (error) {
        Logger.error("getVoiceRecording err:" + JSON.stringify(error));
        client.destroy();
      });

      client.on("end", function () {
        res.end();
      });
    } else {
      return res.status(404).json({ status: 404, message: "File not found" });
    }
  } catch (e) {
    Logger.error(
      "voice.Controller.getVoiceRecording() : " + JSON.stringify(e.message)
    );
    //console.log("voice.Controller.getVoiceRecording() : :  ", e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};
