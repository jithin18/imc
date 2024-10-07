const testService = require("../services/test-service");

const { Logger } = require("../_helpers/logger");

exports.insertCalllog = async function (req, res, next) {
    try {

        let calllog = req.body;
        if (calllog) {
            var sts = await testService.insertCalllog(calllog);
            if (sts == 1) {
               // console.log("sts : ", sts);
                return res.status(200).json({ status: 1, message: 'Success' });
            }
            else {
               // console.log("sts : ", sts);
                return res.status(400).json({ status: 0, message: 'Failed' });
            }

        } else {
            return res
                .status(422)
                .json({ status: 0, message: "insufficient inputs!" });
        }
    } catch (e) {
        Logger.error("call.Controller.insertCalllog() : " + JSON.stringify(e.message));
       // console.log("sts try catch: ", sts);
        return res.status(400).json({ status: 400, message: 'Failed' });
    }
};

exports.checkAppStatus = async function (req, res, next) {
    try {

        var sts = await testService.checkDBConnection();

        if (sts == 1) {
            // console.log("sts : ", sts);
            return res.status(200).json({ status: 1, message: 'Success' });
        }
        else {
            // console.log("sts : ", sts);
            return res.status(400).json({ status: 8, message: 'Failed' });
        }


    } catch (error) {
        // Logger.error("test.Controller.checkAppStatus() : " + JSON.stringify(error.message));
        // console.log("sts try catch: ", sts);
        return res.status(400).json({ status: 9, message: error.message });
    }
};
exports.testxyz = async function (req, res, next) {
    try {
        const { lastActionCode } = req.body;
        

        const lastActionCodeNumber = parseInt(lastActionCode, 10);

        let response;

        switch (lastActionCodeNumber) {
            case 100:
                response = {
                    status: "success",
                    nextActionCode: "200",
                    playText: "welcome to IVR system"
                };
                break;
            case 200:
                response = {
                    status: "success",
                    nextActionCode: "300",
                    playText: "Please enter a digit"
                };
                break;
            case 300:
                response = {
                    status: "success",
                    nextActionCode: "301",
                    playText: "Get Voice input"
                };
                break;
            case 301:
                response={
                    status: "success",
                    nextActionCode: "401",
                    playText: "Patch and dial a B party number"
                }
                break;
                case 401:
                    response={
                        status: "success",
                        nextActionCode: "402",
                        playText: "dial a BParty number and patch"
                    }
                    break;
                    case 402:
                        response={
                            status: "success",
                            nextActionCode: "500",
                            playText: "Hangup"
                        }
                        break;
                        case 500:
                            response={
                                status: "success",
                                nextActionCode: "600",
                                playText: "Stop"
                            }
                            break;
            default:
                response = {
                    status: "success",
                    nextActionCode: "defaultNextCode",
                    playText: "Default play text"
                };
        }

        
      

        return res.status(200).json(response);

    } catch (error) {
        // Handle errors
        return res.status(400).json({ status: 9, message: error.message });
    }
};



