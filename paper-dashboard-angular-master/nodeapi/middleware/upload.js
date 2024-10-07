const util = require("util");
const multer = require("multer");
const path = require('path');
const { vfilepath } = require("../_helpers/settings");
const { fileSize } = require("../_helpers/settings");

var fs = require('fs');

var filepath = path.resolve(vfilepath.toString());
const Pattern = /[ \-$&*%@!~#^'()+="?<>,{}]/gi;

let storage = multer.diskStorage({


    destination: (req, file, cb) => {

        if (!fs.existsSync(`${filepath}`)) {
            fs.mkdirSync(`${filepath}`);
        }
        if (!fs.existsSync(`${filepath}\\${req.query.accid}`)) {
            fs.mkdirSync(`${filepath}\\${req.query.accid}`);
        }

        if (!fs.existsSync(`${filepath}\\${req.query.accid}\\${req.query.flowid}`)) {
            fs.mkdirSync(`${filepath}\\${req.query.accid}\\${req.query.flowid}`);
        }
        cb(null, `${filepath}\\${req.query.accid}\\${req.query.flowid}`);
    },

    filename: (req, file, cb) => {
        cb(null, `${req.newname}_${String(file.originalname).replace(Pattern, "_")}`);
    },

});

let uploadFile = multer({
    storage: storage,
    limits: { fileSize: fileSize },
}).single("file");

let uploadFileMiddleware = util.promisify(uploadFile);
module.exports = uploadFileMiddleware;