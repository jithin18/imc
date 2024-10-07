const appconfig = require("../_config/appconfig.json");
const alertconfig = require("../_config/alertconfig.json");
const Mailer = require("../_helpers/mailer");

const m_host = appconfig.mail.host;
const m_port = appconfig.mail.port;
const m_from = alertconfig.mail.from;
const m_to = alertconfig.mail.to;
const m_cc = alertconfig.mail.cc;
const m_subject =  alertconfig.mail.subject;
// async..await is not allowed in global scope, must use a wrapper
async function sendMailAlert(mail_body) {

    sentInfo = await Mailer.sendMail(
        m_from,
        m_to,
        m_cc,
        m_subject,
        mail_body,
        null
    );
    console.log("sentInfo : ", sentInfo);
}

module.exports.sendMailAlert = sendMailAlert;
