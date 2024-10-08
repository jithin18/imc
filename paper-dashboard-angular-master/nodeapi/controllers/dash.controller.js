const { request } = require("express");
const { Logger } = require("../_helpers/logger");
const dashservice = require("../services/dash-service");
//const commonService = require("../services/common-service");
const { streamDataAsResponse } = require("../_helpers/dbHelper");


exports.getallcalldetails = async function (req, res, next) {
    try {
        
        const result = await dashservice.getallcalldetails(req.body);
        
        return res.status(200).json({
            status: 200,
            data: {
                v_json_out: result.v_json_out, 
                ref_cur_out: result.ref_cur_out 
            }
        });

    } catch (e) {
        
        Logger.error("configuration.Controller.getcalldetails() : " + e.message);
        return res.status(400).json({ 
            status: 400, 
            message: "Error in fetching call details: " + e.message 
        });
    }
};

exports.getpeakhourcallbarchart = async function (req, res, next) {
    try {
        
        const result = await dashservice.getpeakhourcallbarchart(req.body);

        
        return res.status(200).json({   
            status: 200,            
            data: {     
               
                ref_cur_out: result.ref_cur_out 
            }
        });

    } catch (e) {        
        Logger.error("configuration.Controller.getpeakhourcallbarchart() : " + e.message);
        return res.status(400).json({ 
            status: 400, 
            message: "Error in fetching call details: " + e.message 
        });
    }

}

exports.getsentimentchart = async function (req, res, next) {
    try {
        
        const result = await dashservice.getsentimentchart(req.body);

        
        return res.status(200).json({   
            status: 200,            
            data: {     
               
                ref_cur_out: result.ref_cur_out 
            }
        });

    } catch (e) {        
        Logger.error("configuration.Controller.getsentimentchart() : " + e.message);
        return res.status(400).json({ 
            status: 400, 
            message: "Error in fetching call details: " + e.message 
        });
    }

}