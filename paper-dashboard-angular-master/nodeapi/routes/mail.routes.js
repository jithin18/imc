var express = require("express");
var router = express.Router();
const controller = require("../controllers/mail.controller");

router.post("/sendmail", controller.sendMail);

module.exports = router;