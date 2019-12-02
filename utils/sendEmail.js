const nodeMailer = require("nodemailer");

class SendEmail {
  constructor(service = "QQ", user = "690517217@qq.com", pass = "bzqzqrplwfwrbcji") {
    this.service = service;
    this.user = user;
    this.pass = pass;
    this.transporter = nodeMailer.createTransport({
      service: this.service, // 发送者的邮箱厂商，支持列表：https://nodemailer.com/smtp/well-known/
      port: 587,
      secure: false, // SSL安全链接 true for 465, false for other ports
      auth: {   //发送者的账户密码
        user: this.user, //账户
        pass: this.pass, //smtp授权码，到邮箱设置下获取
      }
    });
  }

  send(options, callback) {
    this.transporter.sendMail(options, (error, info) => {
      if (error) {
        return console.log(error);
      }
      callback && callback();
    })
  }
}

module.exports = SendEmail;
