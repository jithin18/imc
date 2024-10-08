var express = require("express");
var router = express.Router();
const controller = require("../controllers/dash.controller");

router.post("/getagentcalls", controller.getallcalldetails);
router.all("/getpeakhourcallbarchart", controller.getpeakhourcallbarchart);	
router.all("/getsentimentchart", controller.getsentimentchart);

module.exports = router;