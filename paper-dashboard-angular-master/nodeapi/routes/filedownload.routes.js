var express = require("express");
var router = express.Router();
const controller = require("../controllers/file.controller");


router.post("/downloadbyfilename", controller.downloadbyfilename);
router.post("/TTS",controller.TTS);


//Cpaas 1.60
router.post("/STT",controller.STT);

router.post("/STText",controller.STText);
module.exports = router;