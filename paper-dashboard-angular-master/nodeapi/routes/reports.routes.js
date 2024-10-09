var express = require("express");
var router = express.Router();
const controller = require("../controllers/reports.controller");

router.post("/getbotchat", controller.getchatLog);
router.post("/getongoingcalldetails",controller.getongoingcalldetails);
router.post("/getcallhistory",controller.getcallhistory)


module.exports = router;
