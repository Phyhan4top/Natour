const nodeMailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Phyhan Tech<${process.env.Email}>`;
  }

  newTransport() {
    // IN PRODUCTION CREATE TRANSPORTER
    if (process.env.NODE_ENV === 'production') {
      //Production transporter
      return nodeMailer.createTransport({
        host: 'smtp.mail.yahoo.com',
        port: 465,
        service: 'yahoo',
        secure: false,
        auth: {
          user: process.env.MAIL_PROD_USERNAME,
          pass: process.env.MAIL_PROD_PASSWORD,
        },
        debug: false,
        logger: true,
      });
    }

    //IN DEVELOPMENT CREATE TRANSPORTER
    return nodeMailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    //RENDER PUG
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      { firstName: this.firstName, url: this.url, subject },
    );

    ///CREATE MAIL OPTIONS
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      text: htmlToText.convert(html),
      html: html,
    };

    //SEND THE MAIL

    const info = await this.newTransport().sendMail(mailOptions);
    console.log('message sent ', info.messageId);

    return info;
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours family');
  }

  async sendResetPassword() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for 10mins)',
    );
  }
};
