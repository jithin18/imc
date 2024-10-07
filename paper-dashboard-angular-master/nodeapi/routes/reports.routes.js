var express = require("express");
var router = express.Router();
const controller = require("../controllers/reports.controller");

router.post("/getIncomingCallLog", controller.getIncomingCallLog);

router.post("/getIncomingCallHierarchy", controller.getIncomingCallHierarchy);

router.post("/getFilterBy", controller.getFilterBy);

router.post("/getOutboundCallLog", controller.getOutboundCallLog);

router.post("/getOutboundCallHierarchy", controller.getOutboundCallHierarchy);

router.post("/getFeedback", controller.getFeedback);

router.post("/getFormFilter", controller.getFormFilter);

router.post("/getOutboundFilter", controller.getOutboundFilter);

router.post("/getClick2CallLog", controller.getClick2CallLog);

router.post("/getAgentCallLog", controller.getAgentCallLog);

router.post("/getAgentPerformanceLog", controller.getAgentPerformanceLog);

router.post("/getAgentBreakSummary", controller.getAgentBreakSummary);

router.post("/getAgentBreakDetails", controller.getAgentBreakDetails);

router.post("/getAgentLoginSummary", controller.getAgentLoginSummary);

router.post("/getAgentLoginDetails", controller.getAgentLoginDetails);

router.get("/getAgents", controller.getAgents);

router.post("/getSMSSummary", controller.getSMSSummary);

router.post("/getSMSDetails", controller.getSMSDetails);

router.post("/getVoiceRecordings", controller.getVoiceRecordings);

router.post("/getVoiceRecordingDownload", controller.getVoiceRecordingDownload);

router.post("/getCompleted", controller.getCompleted);

router.post("/getIncomingCallLogDownload",controller.getIncomingCalllogDownload);

router.post("/getDNIListbyAccountorService",controller.getDNIListbyAccountorService);

router.post("/bulkReportRequest", controller.bulkReportRequest);

router.post("/getCompletedReportPath", controller.getCompletedreportpathout);

// for version 1.51
router.post("/getAPIreports", controller.getAPIreports);

router.post("/getProgressiveCallLog", controller.getProgressiveCallLog);

//for version 1.60
router.post("/getOutboundSummaryCallLog", controller.getOutboundSummaryCallLog);
router.post("/getIncomingSummaryCallLog", controller.getIncomingSummaryCallLog);
router.post("/getClick2CallLogSummary", controller.getClick2CallLogSummary);
router.post("/getProgressiveCallSummaryLog", controller.getProgressiveCallSummaryLog);
router.post("/getbaseCount", controller.getbaseCount);

//version 1.80

router.post("/getChannelUtillaccountReport", controller.getChannelUtillaccountReport);
router.post("/getChannelUtillserverReport", controller.getChannelUtillserverReport);
router.get("/getAccounts", controller.getAccounts);
router.get("/getserveripDetails", controller.getserveripDetails);




module.exports = router;
