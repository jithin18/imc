const util = require("util");
const multer = require("multer");
const path = require('path');
const { xlfilepath } = require("../_helpers/settings");
const { fileSize } = require("../_helpers/settings");

var fs = require('fs');

var filepath = path.resolve(xlfilepath);

const excelFilter = (req, file, cb) => {
    if (
        file.mimetype.includes("excel") ||
        file.mimetype.includes("spreadsheetml")
    ) {
        cb(null, true);
    } else {
        cb("Please upload only excel file.", false);
    }
};

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync(filepath)) {
            fs.mkdirSync(filepath);
        }

        cb(null, filepath);
    },
    filename: (req, file, cb) => {
        console.log(file.originalname);
        cb(null, `${file.originalname}`);
    },
});


let uploadFile = multer({
    storage: storage,
    limits: { fileSize: fileSize },
    fileFilter: excelFilter
}).single("file");

let uploadFileMiddleware = util.promisify(uploadFile);
module.exports = uploadFileMiddleware;



// var uploadFile = multer({ storage: storage, fileFilter: excelFilter });
// module.exports = uploadFile;