const dec = require("../_helpers/aes-256-cbc");

function queryparamsauth(req, res, next) {
    const params = req.query;

    if (params) {
        var keys = Object.keys(params);

        var count = keys.length;

        for (var i = 0; i < count; i++) {

            if (params[keys[i]] != null && params[keys[i]] != 'null') {
                var decparam = dec.decrypt(params[keys[i]]);
                if (decparam != "")
                    req.query[keys[i]] = decparam;
                else { res.sendStatus(406); };
            }
        }

        next();
    }
}

module.exports = queryparamsauth;
