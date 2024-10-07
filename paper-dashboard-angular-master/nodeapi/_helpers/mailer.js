const nodemailer = require("nodemailer");
const { SHUTDOWN_MODE_TRANSACTIONAL_LOCAL } = require("oracledb");
const appconfig = require("../_config/appconfig.json");

const m_host = appconfig.mail.host;
const m_port = appconfig.mail.port;

// async..await is not allowed in global scope, must use a wrapper
async function sendMail(m_from, m_to, m_cc, m_subject, m_body, m_attachments) {
  mail_body =
    "<style> body{ font-family: Times, serif; font-size: 16px;} </style> " +
    m_body +
    "</br><p>Thanks & Regards,</br>VodafoneIdea Ltd.</p><img src='cid:logo@prudent.png' style='width:148px;height:60px;' />";

  if (
    m_attachments == null ||
    m_attachments == "" ||
    m_attachments == undefined
  ) {
    m_attachments = [
      {
        filename: "prudent_logo.png",
        path: "./public/images/prudent_logo.png",
        cid: "logo@prudent.png", //same cid value as in the html img src
      },
    ];
  } else {
    m_attachments = [
      {
        filename: "prudent_logo.png",
        path: "./public/images/prudent_logo.png",
        cid: "logo@prudent.png", //same cid value as in the html img src
      },
      m_attachments,
    ];
  }
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  //   let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: m_host,
    port: m_port,
    secure: false, // true for 465, false for other ports
    tls: {
      rejectUnauthorized: false,
      minVersion: "TLSv1",
    },
  });

  var mailOptions = {
    from: m_from, // sender address
    to: m_to, // list of receivers
    cc: m_cc,
    subject: m_subject, // Subject line
    text: mail_body.substring(0, 100), // plain text body
    html: mail_body, // html body
    attachments: m_attachments,
  };

  // send mail with defined transport object
  let info = await transporter.sendMail(mailOptions).catch((error) => {
    return { status: 500, message: error };
  });

  return { status: 200, message: info };
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

module.exports.sendMail = sendMail;
