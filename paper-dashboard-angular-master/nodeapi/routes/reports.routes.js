var express = require("express");
var router = express.Router();
const controller = require("../controllers/reports.controller");

router.post("/getbotchat", controller.getchatLog);



module.exports = router;
