
const { Logger } = require("../_helpers/logger");
const Mailer = require("../_helpers/mailer");

// const URL_REGEXP_ARRAY = [/(((https?:\/\/)|(www\.))[^\s]+)/g, /^(?!http:\/\/)^([a-z0-9./ ]+)\.(com|org|in)(\.[a-z]{2,3})*/g];
const URL_REGEXP_ARRAY = [/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g];


exports.sendMail = async function (req, res, next) {
    try {

        let mail_to = req.body.mail_to;
        let mail_cc = req.body.mail_cc;
        let mail_subject = req.body.mail_subject;
        let mail_body = req.body.mail_body;
        let mail_from = req.body.mail_from;
        let m_body_link, m_body_link_formated, m_body_link_formated_length = 0;
        if (mail_body) {
            // console.log("mail_body 1 : ", mail_body);

            function urlify(text) {
                let textWithLink;
                for (let i = 0; i < URL_REGEXP_ARRAY.length; i++) {
                    var urlRegex = URL_REGEXP_ARRAY[i];
                    // console.log("urlRegex " + i, urlRegex);
                    textWithLink = text.replace(urlRegex, function (url, b, c) {
                       
                        let url2 = (url.substr(0,4) == 'www.') ? 'http://' + url : url;
                        return '<a href="' + url2 + '">' + url + '</a>';
                    })
                    text = textWithLink;
                }
                return textWithLink;
            }

            var html = urlify(mail_body);

            // console.log(html)

            mail_body = html;

            body_prefix_space_count = mail_body.search(/\S|$/);
            mail_body = mail_body.substring(0, body_prefix_space_count).replace(/ /gi, "&nbsp;") + mail_body.substring(body_prefix_space_count);

        }

        // console.log("Mail body $ : ", mail_body);

        if (mail_from && (mail_to || mail_cc) && mail_subject && mail_body) {
            sentInfo = await Mailer.sendMail(
                mail_from,
                mail_to,
                mail_cc,
                mail_subject,
                mail_body,
                null
            );
           // console.log("sentInfo : ", sentInfo);
            if (sentInfo)
                return res.status(sentInfo.status).json(sentInfo);
            else
                return res.status(400).json({ status: 400, message: "Failed. Please try again!" });

        } else {
            return res.status(422)
                .json({ status: 0, message: "insufficient inputs!" });
        }
    } catch (e) {
        Logger.error("call.Controller.sendMail() : " + JSON.stringify(e.message));
        return res.status(400).json({ status: 400, message: 'Failed. Please try again!' });
    }
};
