var express = require("express");
var router = express.Router();
const controller = require("../controllers/file.controller");

router.post("/upload", controller.upload);
router.get("/getVoiceFileList", controller.getVoiceFileList);
router.get("/files/:name", controller.download);

router.get("/downloadbyfilename", controller.downloadbyfilename);


module.exports = router;