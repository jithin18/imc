var express = require("express");
var router = express.Router();
const controller = require("../controllers/voice.controller");

router.get("/getVoiceRecording", controller.getVoiceRecording);

module.exports = router;
