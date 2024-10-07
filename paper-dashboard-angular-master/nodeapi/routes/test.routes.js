var express = require("express");
var router = express.Router();
const controller = require("../controllers/test.controller");

router.get("/check-app-status", controller.checkAppStatus);
router.post("/testxyz",controller.testxyz)

module.exports = router;