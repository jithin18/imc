var reportsService = require("../services/reports-service");
const appconfig = require("../_config/appconfig.json");
const { Logger } = require("../_helpers/logger");

exports.getchatLog = async function (req, res, next) {
  try {
    const result = await reportsService.getbotchatdetails(req.body.callId);

    return res.status(200).json({
      status: 200,
      data: JSON.parse(result.v_json_out),
    });
  } catch (e) {
    Logger.error(
      "reports.Controller.getchatLog() 02: " + JSON.stringify(e.message)
    );
    return res
      .status(400)
      .json({ status: 400, message: "service unavailable" });
  }
};

exports.getongoingcalldetails = async function (req, res, next) {
  try {
    const result = await reportsService.getOngoingCalls();

    return res.status(200).json({
      status: 200,
      data: result.ref_cur_out,
    });
  } catch (e) {
    Logger.error(
      "reports.Controller.getongoingcalldetails: " + JSON.stringify(e.message)
    );
    return res
      .status(400)
      .json({ status: 400, message: "service unavailable" });
  }
};

exports.getcallhistory = async function (req, res, next) {
  try {
    const result = await reportsService.getcallhistory(req.body);
   console.log(result,"rstqq");
   
    return res.status(200).json({
      status: 200,
      data: result.ref_cur_out,
    });
  } catch (e) {
    Logger.error(
      "reports.Controller.getcallhistory: " + JSON.stringify(e.message)
    );
    return res
      .status(400)
      .json({ status: 400, message: "service unavailable" });
  }
};