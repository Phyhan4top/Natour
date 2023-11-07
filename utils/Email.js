const nodeMailer = require('nodemailer')

const sendEmail =async (options) => {
  ///CREATE TRANSPORTER
const transporter = nodeMailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },timeout:60000
},);
 
  ///CREATE MAIL OPTIONS
  const mailOptions = {
    from: 'Phyhan Tech<noreply@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:options.html
  }

  //SEND THE MAIL

 await transporter.sendMail(mailOptions)
}

module.exports=sendEmail