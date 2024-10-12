var express = require("express");
var router = express.Router();
const controller = require("../controllers/dash.controller");

router.post("/getagentcalls", controller.getallcalldetails);
router.all("/getpeakhourcallbarchart", controller.getpeakhourcallbarchart);	
router.all("/getsentimentchart", controller.getsentimentchart);
router.all("/getfaq",controller.getfaq);
router.all("/getqueryanalysis",controller.getqueryanalysis);
router.all("/getbotsummary",controller.getbotsummary);
router.all("/getkeywords",controller.getkeywords);
router.all("/gettopkeywords",controller.gettopkeywords);
router.all("/gettopproduct",controller.gettopproduct);
module.exports = router;