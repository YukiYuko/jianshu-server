const User = require('../../model/user');
const bcrypt = require("bcrypt");
const tips = require("../../utils/tips");
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const {jwtsecret} = require("../../config");
const CryptoJS = require("crypto-js");
const createError = require("http-errors");
const SendEmail = require("../../utils/sendEmail");
const one = require("../../utils/one");
const {day_format} = require("../../utils");

const ejs = require("ejs"); //ejs模版引擎
const fs = require("fs"); //文件读写
const path = require("path"); //路径配置

const { SchemaModel, StringType } = require("schema-typed");
const crpAes = "690517217";

const model = SchemaModel({
  code: StringType().isRequired('特殊code不能为空'),
  email: StringType().isEmail('请输入正确的邮箱').isRequired('密码不能为空'),
  password: StringType().minLength(6, '不能少于 6 个字符').maxLength(30, '不能大于 30 个字符').isRequired('密码不能为空'),
  confirmPassword: StringType().isRequired('确认密码不能为空').addRule((value, data) => {
    return value === data.password;
  }, '两次密码不一致')
});

// 用户注册
const create = async (req, res, next) => {
  try {
    let {
      username,
      password,
      email
    } = req.body;
    let user = await User.findOne({
      where: {email}
    });
    if (user) {
      return res.send({code: 1001, data: null, msg: "该邮箱已被注册！"})
    } else {
      if (!username && !password) {
        return res.send({code: 1010, data: null, msg: "请输入完整信息！"})
      } else {
        let avatar = gravatar.url(email, { s: '200', r: 'pg', d: 'mm' });
        // Decrypt
        let bytes  = CryptoJS.AES.decrypt(password, crpAes);
        let decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
        bcrypt.genSalt(10, function(err, salt) {
          bcrypt.hash(decryptedPassword, salt, async (err, hash) => {
            if (err) {
              throw err;
            }
            // hash为加密后的密码
            // 调用存储方法
            let data = await User.create({
              username,
              password: hash,
              email,
              avatar
            });
            res.send({...tips[200], data})
          });
        });
      }
    }
  } catch (e) {
    next(e)
  }
};

// 用户登录
const login = async (req, res, next) => {
  try {
    let {email, password} = req.body;
    if (!email && !password) {
      return res.send({code: 4001, data: null, msg: "请输入完整信息！"})
    } else {
      let user = await User.findOne({
        where: {email}
      });
      if (!user) {
        return res.send({code: 4002, data: null, msg: "用户名或者密码错误！"})
      }
      if (!user.admin) {
        return res.send({code: 4003, data: null, msg: "不是管理员，无法登录后台！"})
      }
      bcrypt.compare(password, user.password).then((isMatch) => {
        if (!isMatch) {
          return res.send({code: 4004, data: null, msg: "用户名或者密码错误"})
        }
        // 规则，加密名字，过期时间，回调
        const rule = {
          id: user.id,
          email: user.email
        };
        jwt.sign(rule, jwtsecret, { expiresIn: 3600 * 10000 }, (err, token) => {
          if (err) {
            throw err;
          }
          res.send({code: 200, data: {token: 'Bearer ' + token}, msg: 'ok'})
        })
      })
    }
  } catch (e) {
    next(e)
  }
};

// 修改用户
const update = async (req, res, next) => {
  try {
    let params = req.body;
    if (!params.id || !params.editorType) {
      res.send({code: 302, msg: "请传入有效参数", data: null})
    }
    await User.update(params,{
      where: {
        id: params.id
      }
    });
    res.send({...tips[200]});
  } catch (e) {
    next(e)
  }
};

// 用户列表
const list = async (req, res, next) => {
  try {
    let data = await User.findAll();
    res.send({code: 200, data, msg: "成功"})
  } catch (e) {
    next(e)
  }
};

// 忘记密码
const forgot = async (req, res, next) => {
  try {
    let {email} = req.body;
    const user = await User.findOne({
      where: {email}
    });
    if (!user) {
      return next(createError(200, "不存在该用户哦"));
    }
    const template = ejs.compile(
      fs.readFileSync(path.resolve(__dirname, "../template/email.ejs"), "utf8")
    );
    const todayOneData = await one();
    // Encrypt
    let code = CryptoJS.AES.encrypt(email, crpAes).toString();
    const html = template({todayOneData: {...todayOneData, url: `http://localhost:3000/forgot/reset?code=${code}`}});
    // 配置接收者
    let mailOptions = {
      from: '"发送者昵称" <690517217@qq.com>', // 发送者昵称和地址
      to: email, // 接收者的邮箱地址
      subject: '重置密码邮件', // 邮件主题
      // text: 'test mail',  //邮件的text
      html  //也可以用html发送
    };
    let sendEmail = new SendEmail();
    sendEmail.send(mailOptions, async () => {
      // 设置过期时间 2 小时
      let date = day_format(new Date().getTime() + 2 * 60 * 60 * 1000);
      await User.update({
        resetTime: date,
        resetCode: code
      }, {
        where: {
          email
        }
      });
      res.send({code: 200, data: null, msg: "成功"});
    })
  } catch (e) {
    next(e)
  }
};
// 重置密码
const reset = async (req, res, next) => {
  try {
    let formData = req.body;
    const checkResult = model.check(formData);
    for (let _key in checkResult) {
      let data = checkResult[_key];
      if (data.hasError) {
        return next(createError(200, data.errorMessage));
      }
    }

    let user = await User.findOne({
      where: {email: formData.email, resetCode: formData.code}
    });
    if (!user) {
      return next(createError(200, "不存在该用户哦"));
    }

    let now = Date.now();
    let resetTime = new Date(user.resetTime).getTime();
    if (now > resetTime) {
      return next(createError(200, "该链接已失效 ，请重新发送邮件。"));
    }

    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(formData.password, salt, async (err, hash) => {
        if (err) {
          throw err;
        }
        // hash为加密后的密码
        // 调用存储方法 设置值之后必须save
        user.password = hash;
        user.resetTime = null;
        user.resetCode = null;
        await user.save();
        res.send({code: 200, data: null, msg: "成功"});
      });
    });
  } catch (e) {
    next(e)
  }
};

module.exports = {
  create,
  login,
  list,
  forgot,
  reset,
  update
};
