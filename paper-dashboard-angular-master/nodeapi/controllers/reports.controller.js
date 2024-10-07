var reportsService = require("../services/reports-service");
var commonService = require("../services/common-service");
var voiceService = require("../services/voice-service");
const appconfig = require("../_config/appconfig.json");
const { Logger } = require("../_helpers/logger");
const JSZip = require("jszip");
const { Readable } = require("stream");
var fileSystem = require("fs");
const path = require("path");
const { streamDataAsResponse } = require("../_helpers/dbHelper");
const { forEach } = require("jszip");
const { log } = require("util");

exports.getIncomingCallLog = async function (req, res, next) {
  try {
    var accId = req.body.AccountId;
    var dbRespArray = [];

    var dniarray = req.body.dni;
    var circleArray = [];

    let recordflag = req.query.isRecordLink;

    for (let i = 0; i < dniarray.length; i++) {
      //dni contains 0 if selected all option
      if (dniarray[i] != "0") {
        let circlebydni = await commonService.GetCirclebyDNIforReport(
          dniarray[i],
          accId
        );
        if (
          circleArray.filter((e) => e.circle == circlebydni["circle"]).length ==
          0
        ) {
          /* circleArray not contains the element we're looking for */
          circleArray.push(circlebydni);
        }
      }
    }
    if (circleArray) {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Transfer-Encoding", "chunked");
      for (var key in circleArray) {
        var circle = circleArray[key]["circle"];
        if (circle) {
          await reportsService
            .getIncomingCallLog(circle, req.body, req.user, recordflag, res)
            .catch((err) => {
              Logger.error("reports.Controller.getIncomingCallLog() 01: " + err.message);
              res.end();

              // return res
              //   .status(500)
              //   .json({ status: 500, message: "internal server error" });
            });
          // dbRespArray.push(dbResp);
        }
      }
      res.end();
    } else {
      return res.status(400).json({ status: 400, message: "no circle" });
    }
  } catch (e) {
    Logger.error(
      "reports.Controller.getIncomingCallLog() 02: " + JSON.stringify(e.message)
    );
    return res
      .status(400)
      .json({ status: 400, message: "service unavailable" });
  }
};

exports.getIncomingCalllogDownload = async function (req, res, next) {
  try {
    var accId = req.body.AccountId;
    var flowid = req.body.FlowId;

    var circleArray = await commonService.GetCircle(flowid, accId, 1);
    var dbRespArray = [];

    for (var key in circleArray) {
      var circle = circleArray[key]["KEY"];
      var dbResp = await reportsService.getIncomingCalllogDownload(
        circle,
        req.body,
        req.user
      );
      dbRespArray.push(dbResp);
    }

    if (dbRespArray.length > 0) {
      streamDataAsResponse(req, res, dbRespArray);
    } else {
      return res.status(200).json({ status: 200, message: "no data" });
    }
  } catch (e) {
    Logger.error(
      "reports.Controller.getIncomingCalllogDownload() : " +
        JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};

//getincomingcallhierarchy

exports.getIncomingCallHierarchy = async function (req, res, next) {
  try {
    var flowid = req.body.FlowId;
    var accId = req.body.AccountId;
    // var reportFullDetails = [];
    var dbRespArray = [];
    if (req.body.UserRole == -1) {
      req.body.UserRole = req.user.userid;
    }

    var circleArray = await commonService.GetCircle(flowid, accId, 1);

    for (var key in circleArray) {
      var circle = circleArray[key]["KEY"];

      var dbResp = await reportsService.getIncomingCallHierarchy(
        circle,
        req.body,
        req.user
      );
      dbRespArray.push(dbResp);
    }
    if (dbRespArray.length > 0) {
      streamDataAsResponse(req, res, dbRespArray);
    } else {
      return res.status(200).json({ status: 200, message: "no data" });
    }
  } catch (e) {
    Logger.error(
      "reports.Controller.getIncomingCallHierarchy() : " +
        JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};

//filterby
exports.getFilterBy = async function (req, res, next) {
  try {
    var report = await reportsService.getFilterBy(req.body, req.user);

    return res.status(200).json(report);
  } catch (e) {
    Logger.error(
      "reports.Controller.getFilterBy() : " + JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};

exports.getOutboundCallLog = async function (req, res, next) {
  try {
    var flowid = req.body.FlowId;
    var accId = req.body.AccountId;
    var dbRespArray = [];
    var dniarray = req.body.dni;
    var circleArray = [];
    let recordflag = req.query.isRecordLink;
    for (let i = 0; i < dniarray.length; i++) {
      //dni contains 0 if selected all option
      if (dniarray[i] != "0") {
        let circlebydni = await commonService.GetCirclebyDNIforReport(
          dniarray[i],
          accId
        );
        if (circlebydni["status"] == 1) {
          if (
            circlebydni["circle"] != null &&
            circlebydni["circle"] !== undefined &&
            circleArray.filter((e) => e.circle === circlebydni["circle"])
              .length === 0
          ) {
            // circleArray does not contain the element we're looking for and circlebydni["circle"] is not null or undefined
            circleArray.push(circlebydni);
          }
        }
      }
    }
    for (var key in circleArray) {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Transfer-Encoding", "chunked");
      var circle = circleArray[key]["circle"];
      await reportsService
        .getOutboundCallLog(circle, req.body, req.user, recordflag, res)
        .catch((err) => {
          Logger.error("reports.Controller.getOutboundCallLog() : " + err);
          res.end();
        });
    }
    res.end();
  } catch (e) {
    Logger.error(
      "reports.Controller.getOutboundCallLog() : " + JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};

exports.getOutboundCallHierarchy = async function (req, res, next) {
  try {
    var flowid = req.body.FlowId;
    var accId = req.body.AccountId;
    // var reportFullDetails = [];
    var dbRespArray = [];

    var circleArray = await commonService.GetCircle(flowid, accId, 2);

    for (var key in circleArray) {
      var circle = circleArray[key]["KEY"];

      var dbResp = await reportsService.getOutboundCallHierarchy(
        circle,
        req.body,
        req.user
      );
      dbRespArray.push(dbResp);
    }
    if (dbRespArray.length > 0) {
      streamDataAsResponse(req, res, dbRespArray);
    } else {
      return res.status(200).json({ status: 200, message: "no data" });
    }
  } catch (e) {
    Logger.error(
      "reports.Controller.getOutboundCallHierarchy() : " +
        JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};

//feedback
exports.getFeedback = async function (req, res, next) {
  try {
    var downloadFlag = req.query.isDownload;
    var report = await reportsService.getFeedback(
      req.body,
      req.user,
      downloadFlag
    );

    return res.status(200).json(report);
  } catch (e) {
    Logger.error(
      "reports.Controller.getFeedback() : " + JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};

//formfilter
exports.getFormFilter = async function (req, res, next) {
  try {
    var report = await reportsService.getFormFilter(req.body);

    return res.status(200).json(report);
  } catch (e) {
    Logger.error(
      "reports.Controller.getFormFilter() : " + JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};

//outboundfilter

exports.getOutboundFilter = async function (req, res, next) {
  try {
    var report = await reportsService.getOutboundFilter(req.body);

    return res.status(200).json(report);
  } catch (e) {
    Logger.error(
      "reports.Controller.getOutboundFilter() : " + JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};

exports.getClick2CallLog = async function (req, res, next) {
  try {
    var flowid = req.body.FlowId;
    var accId = req.body.AccountId;

    var dbRespArray = [];
    var dniarray = req.body.dni;
    var circleArray = [];
    let recordflag = req.query.isRecordLink;

    for (let i = 0; i < dniarray.length; i++) {
      if (dniarray[i] != "0") {
        let circlebydni = await commonService.GetCirclebyDNIforReport(
          dniarray[i],
          accId
        );

        if (
          circleArray.filter((e) => e.circle == circlebydni["circle"]).length ==
          0
        ) {
          circleArray.push(circlebydni);
        }
      }
    }
    if (circleArray) {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Transfer-Encoding", "chunked");
      for (var key in circleArray) {
        var circle = circleArray[key]["circle"];
        if (circle) {
          await reportsService
            .getClick2CallLog(circle, req.body, req.user, recordflag, res)
            .catch((err) => {
              Logger.error("reports.Controller.getClick2CallLog() : " + err);
              res.end();
            });
        }
      }
      res.end();
    } else {
      return res.status(400).json({ status: 400, message: "no circle" });
    }
    // return res
  } catch (e) {
    Logger.error(
      "reports.Controller.getClick2CallLog() : " + JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};
//Agent Call
exports.getAgentCallLog = async function (req, res, next) {
  try {
    var flowid = req.body.FlowId;
    var accId = req.body.AccountId;
    var dbRespArray = [];
    let recordflag = req.query.isRecordLink;

    var circleArray = await commonService.GetCircle(flowid, accId, 1);
    if (circleArray) {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Transfer-Encoding", "chunked");
      for (var key in circleArray) {
        var circle = circleArray[key]["KEY"];
        await reportsService
          .getAgentCallLog(circle, req.body, req.user, recordflag, res)
          .catch((err) => {
            Logger.error("reports.Controller.getIncomingCallLog() : " + err);
            res.end();
          });
      }
      res.end();
    } else {
      return res.status(400).json({ status: 400, message: "no circle" });
    }
  } catch (e) {
    Logger.error(
      "reports.Controller.getAgentCallLog() : " + JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};

exports.getAgentPerformanceLog = async function (req, res, next) {
  try {
    var accId = req.body.AccountId;
    var flowid = req.body.FlowId;
    // var reportFullDetails = [];
    var dbRespArray = [];

    var circleArray = await commonService.GetCircle(flowid, accId, 1);
    if (circleArray) {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Transfer-Encoding", "chunked");
      for (var key in circleArray) {
        var circle = circleArray[key]["KEY"];
        //added for loop
        if (circle) {
          await reportsService
            .getAgentPerformanceLog(circle, req.body, req.user, res)
            .catch((err) => {
              Logger.error(
                "reports.Controller.getAgentPerformanceLog() : " + err
              );
              res.end();
            });
          // dbRespArray.push(dbResp);
        }
      }
      res.end();
    } else {
      return res.status(400).json({ status: 400, message: "no circle" });
    }
    // if (dbRespArray.length > 0) {
    //   streamDataAsResponse(req, res, dbRespArray);
    // } else {
    //   return res.status(200).json({ status: 200, message: "no data" });
    // }
  } catch (e) {
    Logger.error(
      "reports.Controller.getAgentPerformanceLog() : " +
        JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};

exports.getAgentBreakSummary = async function (req, res, next) {
  try {
    var dbRespArray = [];
    var accId = req.body.AccountId;
    var flowid = req.body.FlowId;
    // var circleArray = await commonService.GetServiceNumbersbyflowid(
    //   req.body.FlowId,
    //   1
    // );
    var circleArray = await commonService.GetCircle(flowid, accId, 1);
    if (circleArray) {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Transfer-Encoding", "chunked");
      for (var key in circleArray) {
        var circle = circleArray[key]["KEY"];
        await reportsService
          .getAgentBreakSummary(circle, req.body, req.user, res)
          .catch((err) => {
            Logger.error("reports.Controller.getAgentBreakSummary() : " + err);
            res.end();
          });
        // console.log("dbResp",dbResp);
        // dbRespArray.push(dbResp);
      }
      res.end();
    } else {
      return res.status(400).json({ status: 400, message: "no circle" });
    }
    // if (dbRespArray.length > 0) {
    //   streamDataAsResponse(req, res, dbRespArray);
    // } else {
    //   return res.status(200).json({ status: 200, message: "no data" });
    // }
  } catch (e) {
    Logger.error(
      "reports.Controller.getAgentBreakSummary() : " + JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};

exports.getAgentBreakDetails = async function (req, res, next) {
  try {
    var dbRespArray = [];
    var accId = req.body.AccountId;
    var flowid = req.body.FlowId;
    // var circleArray = await commonService.GetServiceNumbersbyflowid(
    //   req.body.FlowId,
    //   1
    // );
    var circleArray = await commonService.GetCircle(flowid, accId, 1);
    if (circleArray.length > 0) {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Transfer-Encoding", "chunked");
      for (var key in circleArray) {
        var circle = circleArray[key]["KEY"];
        await reportsService
          .getAgentBreakDetails(circle, req.body, req.user, res)
          .catch((err) => {
            Logger.error("reports.Controller.getAgentBreakDetails() : " + err);
            res.end();
          });
        // console.log("dbResp",dbResp);
        // dbRespArray.push(dbResp);
      }
      res.end();
    } else {
      return res.status(400).json({ status: 400, message: "no circle" });
    }
    // if (dbRespArray.length > 0) {
    //   streamDataAsResponse(req, res, dbRespArray);
    // } else {
    //   return res.status(200).json({ status: 200, message: "no data" });
    // }
  } catch (e) {
    Logger.error(
      "reports.Controller.getAgentBreakDetails() : " + JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};

exports.getAgentLoginSummary = async function (req, res, next) {
  try {
    var dbRespArray = [];
    var accId = req.body.AccountId;
    var flowid = req.body.FlowId;

    // var circleArray = await commonService.GetServiceNumbersbyflowid(
    //   req.body.FlowId,
    //   1
    // );
    var circleArray = await commonService.GetCircle(flowid, accId, 1);
    // console.log("circleArray",circleArray);
    if (circleArray.length > 0) {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Transfer-Encoding", "chunked");
      for (var key in circleArray) {
        var circle = circleArray[key]["KEY"];
        await reportsService
          .getAgentLoginSummary(circle, req.body, req.user, res)
          .catch((err) => {
            Logger.error("reports.Controller.getAgentBreakDetails() : " + err);
            res.end();
          });
        // // console.log("dbResp",dbResp);
        // dbRespArray.push(dbResp);
      }
      res.end();
    } else {
      return res.status(400).json({ status: 400, message: "no circle" });
    }

    // if (dbRespArray.length > 0) {
    //   streamDataAsResponse(req, res, dbRespArray);
    // } else {
    //   return res.status(200).json({ status: 200, message: "no data" });
    // }
  } catch (e) {
    Logger.error(
      "reports.Controller.getAgentLoginSummary() : " + JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};

exports.getAgentLoginDetails = async function (req, res, next) {
  try {
    var dbRespArray = [];
    var accId = req.body.AccountId;
    var flowid = req.body.FlowId;
    // var circleArray = await commonService.GetServiceNumbersbyflowid(
    //   req.body.FlowId,
    //   1
    // );
    var circleArray = await commonService.GetCircle(flowid, accId, 1);
    if (circleArray.length > 0) {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Transfer-Encoding", "chunked");
      for (var key in circleArray) {
        var circle = circleArray[key]["KEY"];
        await reportsService
          .getAgentLoginDetails(circle, req.body, req.user, res)
          .catch((err) => {
            Logger.error("reports.Controller.getAgentLoginDetails() : " + err);
            res.end();
          });
        // console.log("dbResp",dbResp);
        // dbRespArray.push(dbResp);
      }
      res.end();
    } else {
      return res.status(400).json({ status: 400, message: "no circle" });
    }
    // if (dbRespArray.length > 0) {
    //   streamDataAsResponse(req, res, dbRespArray);
    // } else {
    //   return res.status(200).json({ status: 200, message: "no data" });
    // }
  } catch (e) {
    Logger.error(
      "reports.Controller.getAgentLoginDetails() : " + JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};

exports.getAgents = async function (req, res, next) {
  try {
    var response = await reportsService.getAgents(
      req.query.flowid,
      req.query.accid,
      req.query.type,
      req.user.userid
    );
    return res.status(200).json({ agents: response });
  } catch (e) {
    Logger.error(
      "reports.Controller.getAgents() : " + JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};

exports.getSMSSummary = async function (req, res, next) {
  try {
    var dbRespArray = [];

    var accId = req.body.AccountId;
    var flowid = req.body.FlowId;

    var circleArray = await commonService.GetCircle(flowid, accId, 1);

    if (circleArray.length > 0) {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Transfer-Encoding", "chunked");
      for (var key in circleArray) {
        var circle = circleArray[key]["KEY"];
        await reportsService
          .getSMSSummary(circle, req.body, req.user, res)
          .catch((err) => {
            Logger.error("reports.Controller.getSMSSummary() : " + err);
            res.end();
          });

        // dbRespArray.push(dbResp);
      }
      res.end();

      // if (dbRespArray.length > 0) {
      //   streamDataAsResponse(req, res, dbRespArray);
      // } else {
      //   return res.status(200).json({ status: 200, message: "no data" });
      // }
    } else {
      return res.status(400).json({ status: 8, message: "no circle" });
    }
  } catch (e) {
    Logger.error(
      "reports.Controller.getSMSSummary() : " + JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};

exports.getSMSDetails = async function (req, res, next) {
  try {
    var dbRespArray = [];

    var accId = req.body.AccountId;
    var flowid = req.body.FlowId;

    var circleArray = await commonService.GetCircle(flowid, accId, 1);

    if (circleArray.length > 0) {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Transfer-Encoding", "chunked");
      for (var key in circleArray) {
        var circle = circleArray[key]["KEY"];
        await reportsService
          .getSMSDetails(circle, req.body, req.user, res)
          .catch((err) => {
            Logger.error("reports.Controller.getAgentBreakDetails() : " + err);
            res.end();
          });

        // dbRespArray.push(dbResp);
      }
      res.end();
      // if (dbRespArray.length > 0) {
      //   streamDataAsResponse(req, res, dbRespArray);
      // } else {
      //   return res.status(200).json({ status: 200, message: "no data" });
      // }
    } else {
      return res
        .status(400)
        .json({ status: 8, message: "Flow Not Active. Please Activate Flow." });
    }
  } catch (e) {
    Logger.error(
      "reports.Controller.getSMSDetails() : " + JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};

exports.getVoiceRecordings = async function (req, res, next) {
  try {
    var flowid = req.body.FlowId;
    var accId = req.body.AccountId;
    var calltype = req.body.call_type;
    var circleArray = await commonService.GetCircle(flowid, accId, calltype);
    var recordingFullDetails = [];
    for (var key in circleArray) {
      var circle = circleArray[key]["KEY"];
      var callRecordings = await reportsService.getVoiceRecordings(
        circle,
        req.body,
        req.user
      );
      for (let i = 0; i < callRecordings.length; i++) {
        callRecordings[i].circle = circle;
      }
      recordingFullDetails = recordingFullDetails.concat(callRecordings);
    }

    var zip = new JSZip();
    for (callRecord of recordingFullDetails) {
      await voiceService
        .getVoiceRecordingsFromCircle(
          callRecord.circle,
          callRecord.call_id,
          callRecord.record_id
        )
        .then((respData) => {
          var filename = respData.filename;
          zip.file(filename, respData.blob_voicefile);
        })
        .catch((e) => {
          Logger.error("reports.Controller.getVoiceRecordings() 1 : " + e);
        });
    }

    var zipData;
    await zip
      .generateAsync({ type: "nodebuffer" })
      .then(function (data) {
        zipData = data;
      })
      .then(function () {
        res.setHeader("Content-Type", "application/zip");
        res.status(200).send(zipData);
      })
      .catch((error) => {
        Logger.error("reports.Controller.getVoiceRecordings() 2 : " + error);
      });
  } catch (e) {
    Logger.error(
      "reports.Controller.getVoiceRecordings() 3 : " + JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};

exports.getVoiceRecordingDownload = async function (req, res, next) {
  try {
    var report = await reportsService.getVoiceRecordingDownload(
      req.body,
      req.user
    );

    return res.status(200).json({ data: report.data });
  } catch (e) {
    Logger.error(
      "reports.Controller.getVoiceRecordingDownload() : " +
        JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: "Error" });
  }
};

exports.getCompleted = async function (req, res, next) {
  try {
    var filename = req.query.filename;
    var voice = await reportsService.getCompleted(req.body);
    var filepath = voice.filepath;

    const fileName = filename;
    const filePath = filepath;
    res.download(filePath + fileName, fileName, (err) => {
      if (err) {
        Logger.error(
          "reports.Controller.getCompleted() : " + JSON.stringify(err)
        );
        res.status(500).send({
          message: "Could not download the file. " + err,
        });
      }
    });
  } catch (e) {
    Logger.error(
      "reports.Controller.getCompleted() : " + JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};

exports.getDNIListbyAccountorService = async function (req, res, next) {
  try {
    if (req.body.accId) {
      var response = await reportsService.getDNIList(
        req.body.accId,
        req.body.flowid,
        req.body.reporttype
      );
      return res.status(200).json({ agents: response });
    } else {
      return res.status(422).json({ status: 422, message: "invalid input" });
    }
  } catch (e) {
    Logger.error(
      "reports.Controller.getDNIListbyAccountorService() : " +
        JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};

exports.bulkReportRequest = async function (req, res, next) {
  try {
    var report = await reportsService.insertBulkReportRequest(
      req.body,
      req.user
    );

    return res.status(200).json({ data: report.data });
  } catch (e) {
    Logger.error(
      "reports.Controller.bulkReportRequest() : " + JSON.stringify(e.message)
    );
    return res
      .status(422)
      .json({ status: 422, message: "some error occurred" });
  }
};

exports.getCompletedreportpathout = async function (req, res, next) {
  try {
    var filename = req.query.filename;
    var report = await reportsService.getCompletedreportpathout(req.body);

    var filepath = report.filepath;

    const fileName = filename;
    const filePath = filepath;
    res.download(filePath + fileName, fileName, (err) => {
      if (err) {
        res.status(500).send({
          message: "Could not download the file. " + err,
        });
      }
    });
  } catch (e) {
    Logger.error(
      "reports.Controller.getCompletedreportpathout() : " +
        JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};
// for version 1.51
exports.getAPIreports = async function (req, res, next) {
  try {
    var dbRespArray = [];
    var accId = req.body.AccountId;
    var flowid = req.body.FlowId;

    var circleArray = await commonService.GetCircle(flowid, accId, 1);
    if (circleArray.length > 0) {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Transfer-Encoding", "chunked");
      for (var key in circleArray) {
        var circle = circleArray[key]["KEY"];
        await reportsService
          .getAPIreports(circle, req.body, req.user, res)
          .catch((err) => {
            Logger.error("reports.Controller.getAPIreports() : " + err);
            res.end();
          });
        // console.log("dbResp",dbResp);
        // dbRespArray.push(dbResp);
      }
    }
    res.end();

    // if (dbRespArray.length > 0) {
    //   streamDataAsResponse(req, res, dbRespArray);
    // } else {
    //   return res.status(200).json({ status: 200, message: "no data" });
    // }
  } catch (e) {
    Logger.error(
      "reports.Controller.getAPIreports() : " + JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};

exports.getProgressiveCallLog = async function (req, res, next) {
  try {
    var flowid = req.body.FlowId;
    var accId = req.body.AccountId;

    var dbRespArray = [];

    var dniarray = req.body.dni;
    var circleArray = [];

    let recordflag = req.query.isRecordLink;

    for (let i = 0; i < dniarray.length; i++) {
      //dni contains 0 if selected all option
      if (dniarray[i] != "0") {
        let circlebydni = await commonService.GetCirclebyDNIforReport(
          dniarray[i],
          accId
        );

        if (
          circleArray.filter((e) => e.circle == circlebydni["circle"]).length ==
          0
        ) {
          /* circleArray not contains the element we're looking for */
          circleArray.push(circlebydni);
        }
      }
    }
    if (circleArray) {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Transfer-Encoding", "chunked");
      for (var key in circleArray) {
        var circle = circleArray[key]["circle"];
        if (circle) {
          await reportsService
            .getProgressiveCallLog(circle, req.body, req.user, recordflag, res)
            .catch((err) => {
              Logger.error(
                "reports.Controller.getProgressiveCallLog() : " + err
              );
              res.end();
            });
        }
      }
      res.end();
    } else {
      return res.status(200).json({ status: 8, message: "no circle" });
    }

    // if (dbRespArray.length > 0) {
    //   streamDataAsResponse(req, res, dbRespArray);
    // } else {
    //   return res.status(200).json({ status: 200, message: "no data" });
    // }
  } catch (e) {
    Logger.error(
      "reports.Controller.getProgressiveCallLog() : " +
        JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};

exports.getOutboundSummaryCallLog = async function (req, res, next) {
  try {
    var flowid = req.body.FlowId;
    var accId = req.body.AccountId;
    var dbRespArray = [];

    var dniarray = req.body.dni;
    var circleArray = [];

    for (let i = 0; i < dniarray.length; i++) {
      //dni contains 0 if selected all option
      if (dniarray[i] != "0") {
        let circlebydni = await commonService.GetCirclebyDNIforReport(
          dniarray[i],
          accId
        );
        if (
          circlebydni["circle"] != null &&
          circlebydni["circle"] !== undefined &&
          circleArray.filter((e) => e.circle === circlebydni["circle"])
            .length === 0
        ) {
          // circleArray does not contain the element we're looking for and circlebydni["circle"] is not null or undefined
          circleArray.push(circlebydni);
        }
      }
    }
    if (circleArray) {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Transfer-Encoding", "chunked");
      for (var key in circleArray) {
        var circle = circleArray[key]["circle"];
        if (circle) {
          await reportsService
            .getOutboundSummaryCallLog(circle, req.body, req.user, res)
            .catch((err) => {
              Logger.error("reports.Controller.getIncomingCallLog() : " + err);
              res.end();

              // return res
              //   .status(500)
              //   .json({ status: 500, message: "internal server error" });
            });
          // dbRespArray.push(dbResp);
        }
      }
      res.end();
    } else {
      return res.status(400).json({ status: 400, message: "no circle" });
    }
  } catch (e) {
    Logger.error(
      "reports.Controller.getOutboundSummaryCallLog() : " +
        JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};

exports.getIncomingSummaryCallLog = async function (req, res, next) {
  try {
    var accId = req.body.AccountId;

    var dbRespArray = [];

    var dniarray = req.body.dni;

    var circleArray = [];

    let recordflag = req.query.isRecordLink;

    for (let i = 0; i < dniarray.length; i++) {
      //dni contains 0 if selected all option
      if (dniarray[i] != "0") {
        let circlebydni = await commonService.GetCirclebyDNIforReport(
          dniarray[i],
          accId
        );
        if (
          circleArray.filter((e) => e.circle == circlebydni["circle"]).length ==
          0
        ) {
          /* circleArray not contains the element we're looking for */
          circleArray.push(circlebydni);
        }
      }
    }
    if (circleArray) {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Transfer-Encoding", "chunked");
      for (var key in circleArray) {
        var circle = circleArray[key]["circle"];
        if (circle) {
          await reportsService
            .getIncomingSummaryCallLog(circle, req.body, req.user, res)
            .catch((err) => {
              Logger.error("reports.Controller.getIncomingCallLog() : " + err);
              res.end();

              // return res
              //   .status(500)
              //   .json({ status: 500, message: "internal server error" });
            });
          // dbRespArray.push(dbResp);
        }
      }
      res.end();
    } else {
      return res.status(400).json({ status: 400, message: "no circle" });
    }
    // if (dbRespArray.length > 0) {
    //   streamDataAsResponse(req, res, dbRespArray);
    // } else {
    //   return res.status(200).json({ status: 200, message: "no data" });
    // }
  } catch (e) {
    Logger.error(
      "reports.Controller.getIncomingSummaryCallLog() : " +
        JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};

exports.getClick2CallLogSummary = async function (req, res, next) {
  try {
    var flowid = req.body.FlowId;
    var accId = req.body.AccountId;

    var dbRespArray = [];

    var dniarray = req.body.dni;
    var circleArray = [];

    for (let i = 0; i < dniarray.length; i++) {
      //dni contains 0 if selected all option
      if (dniarray[i] != "0") {
        let circlebydni = await commonService.GetCirclebyDNIforReport(
          dniarray[i],
          accId
        );

        if (
          circleArray.filter((e) => e.circle == circlebydni["circle"]).length ==
          0
        ) {
          /* circleArray not contains the element we're looking for */
          circleArray.push(circlebydni);
        }
      }
    }

    for (var key in circleArray) {
      var circle = circleArray[key]["circle"];
      if (circle) {
        var dbResp = await reportsService
          .getClick2CallLogSummary(circle, req.body, req.user, res)
          .catch((err) => {
            Logger.error(
              "reports.Controller.getClick2CallLogSummary() : " + err
            );
            res.end();
          });
        // dbRespArray.push(dbResp);
      }
    }
    res.end();
    // if (dbRespArray.length > 0) {
    //   streamDataAsResponse(req, res, dbRespArray);
    // } else {
    //   return res.status(200).json({ status: 200, message: "no data" });
    // }
  } catch (e) {
    Logger.error(
      "reports.Controller.getClick2CallLogSummary() : " +
        JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};

exports.getProgressiveCallSummaryLog = async function (req, res, next) {
  try {
    var flowid = req.body.FlowId;
    var accId = req.body.AccountId;

    var dbRespArray = [];

    var dniarray = req.body.dni;
    var circleArray = [];

    for (let i = 0; i < dniarray.length; i++) {
      //dni contains 0 if selected all option
      if (dniarray[i] != "0") {
        let circlebydni = await commonService.GetCirclebyDNIforReport(
          dniarray[i],
          accId
        );

        if (
          circleArray.filter((e) => e.circle == circlebydni["circle"]).length ==
          0
        ) {
          /* circleArray not contains the element we're looking for */
          circleArray.push(circlebydni);
        }
      }
    }

    for (var key in circleArray) {
      var circle = circleArray[key]["circle"];
      if (circle) {
        await reportsService
          .getProgressiveCallSummaryLog(circle, req.body, req.user, res)
          .catch((err) => {
            Logger.error(
              "reports.Controller.getProgressiveCallSummaryLog() : " + err
            );
            res.end();
          });
        // dbRespArray.push(dbResp);
      }
    }
    res.end();
    // if (dbRespArray.length > 0) {
    //   streamDataAsResponse(req, res, dbRespArray);
    // } else {
    //   return res.status(200).json({ status: 200, message: "no data" });
    // }
  } catch (e) {
    Logger.error(
      "reports.Controller.getProgressiveCallSummaryLog() : " +
        JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};

exports.getbaseCount = async function (req, res, next) {
  try {
    var data = await reportsService.getbaseCount(
      req.body.accid,
      req.body.campaign_id,
      req.body.date,
      req.body.dni
    );
    //  console.log("data",data);

    return res.status(200).json(data);
  } catch (e) {
    Logger.error(
      "reports.Controller.getbaseCount() : " + JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};

exports.getChannelUtillaccountReport = async function (req, res, next) {
  try {
    // console.log("req.body",req.body);
    var circle = req.body.location;
    var accountrprtJSON = {
      accountid: req.body.Account,
      fromdate: req.body.FromDate,
      todate: req.body.ToDate,
    };
    var dbRespArray = [];
    if (circle) {
      await reportsService
        .getChannelUtillaccountReport(circle, accountrprtJSON, res)
        .catch((err) => {
          Logger.error(
            "reports.Controller.getChannelUtillaccountReport() : " + err
          );
          res.end();
        });
      // dbRespArray.push(dbResp);
    } else {
      return res
        .status(400)
        .json({ status: 400, message: "location not available" });
    }
    res.end();
    // if (dbRespArray.length > 0) {
    //   streamDataAsResponse(req, res, dbRespArray);
    // } else {
    //   return res.status(200).json({ status: 200, message: "no data" });
    // }
  } catch (e) {
    Logger.error(
      "reports.Controller.getChannelUtillaccountReport() : " +
        JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};

exports.getChannelUtillserverReport = async function (req, res, next) {
  try {
    var circle = req.body.location;
    var serverrprtJSON = {
      serverip: req.body.serverip,
      calltype: req.body.calltype,
      fromdate: req.body.FromDate,
      todate: req.body.ToDate,
    };
    var dbRespArray = [];
    if (circle) {
      await reportsService
        .getChannelUtillserverReport(circle, serverrprtJSON, res)
        .catch((err) => {
          Logger.error(
            "reports.Controller.getChannelUtillserverReport() : " + err
          );
          res.end();
        });
      // dbRespArray.push(dbResp);
    } else {
      return res
        .status(400)
        .json({ status: 400, message: "location not available" });
    }
    res.end();
    // if (dbRespArray.length > 0) {
    //   streamDataAsResponse(req, res, dbRespArray);
    // } else {
    //   return res.status(200).json({ status: 200, message: "no data" });
    // }
  } catch (e) {
    Logger.error(
      "reports.Controller.getChannelUtillserverReport() : " +
        JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: e.message });
  }
};

exports.getAccounts = async function (req, res, next) {
  try {
    // console.log("req.query",req.query);
    var circle = req.query.location;
    //  console.log("circle",circle);
    if (circle) {
      var resp = await reportsService.getAccounts(circle);
      return res.status(200).json(resp);
    } else {
      return res
        .status(400)
        .json({ status: 400, message: "location not available" });
    }
  } catch (error) {
    Logger.error(
      "reports.Controller.GetAccounts() : " + JSON.stringify(error.message)
    );
    return res.status(400).json({ status: 400, message: "some error occured" });
  }
};

exports.getserveripDetails = async function (req, res, next) {
  try {
    // console.log("req.query",req.query);
    var circle = req.query.location;
    // console.log("circle",circle);
    if (circle) {
      var resp = await reportsService.getserveripDetails(circle);
      return res.status(200).json(resp);
    } else {
      return res
        .status(400)
        .json({ status: 400, message: "location not available" });
    }
  } catch (e) {
    Logger.error(
      "reports.Controller.getserveripDetails() : " + JSON.stringify(e.message)
    );
    return res.status(400).json({ status: 400, message: "some error occured" });
  }
};
