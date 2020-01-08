const User = require('../../model/user');
const Follow = require('../../model/follow');
const Like = require('../../model/like');
const Post = require('../../model/post');
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
const sequelize = require("../../config/sequelize");
const {validationResult} = require('express-validator');

const ejs = require("ejs"); //ejs模版引擎
const fs = require("fs"); //文件读写
const path = require("path"); //路径配置

const Exception = require("../../utils/Exception");

const {SchemaModel, StringType} = require("schema-typed");
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send({code: 1001, data: null, msg: errors.array()[0].msg});
    }
    let user = await User.findOne({
      where: {email}
    });
    if (user) {
      return res.send({code: 1001, data: null, msg: "该邮箱已被注册！"})
    } else {
      if (!username && !password) {
        return res.send({code: 1010, data: null, msg: "请输入完整信息！"})
      } else {
        let avatar = gravatar.url(email, {s: '200', r: 'pg', d: 'mm'});
        // Decrypt
        let bytes = CryptoJS.AES.decrypt(password, crpAes);
        let decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
        bcrypt.genSalt(10, function (err, salt) {
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
      bcrypt.compare(password, user.password).then((isMatch) => {
        if (!isMatch) {
          return res.send({code: 4004, data: null, msg: "用户名或者密码错误"})
        }
        // 规则，加密名字，过期时间，回调
        const rule = {
          id: user.id,
          email: user.email
        };
        jwt.sign(rule, jwtsecret, {expiresIn: 3600 * 10000}, (err, token) => {
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
    if (!params.id) {
      res.send({code: 302, msg: "请传入有效参数", data: null})
    }
    await User.update(params, {
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
    let {
      recommend = 1,
      uid
    } = req.body;
    let options = {
      limit: 5,
      attributes: {exclude: ['password']}
    };
    if (recommend === 1) {
      options.order = sequelize.random();
    }
    let data = await User.findAll(options);
    let re = [];
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        // 获取该作者文章字数
        const num = await sequelize.query(
          `SELECT sum(LENGTH(RTRIM(LTRIM(content)))) as sum FROM posts WHERE aid = ${data[key].id}`,
          {type: sequelize.QueryTypes.SELECT}
        );
        // 获取该作者粉丝数
        const followNum = await Follow.count({
          where: {aid: data[key].id}
        });
        // 获取当前登录用户有没有关注该作者
        const is_follow = await Follow.findAll({
          where: {
            uid,
            aid: data[key].id
          }
        });
        re.push({
          ...JSON.parse(JSON.stringify(data[key])),
          num: num[0].sum || 0,
          followNum,
          is_follow: is_follow.length
        })
      }
    }
    res.send({code: 200, data: re, msg: "成功"})
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
    console.log(__dirname);
    const template = ejs.compile(
      fs.readFileSync(path.resolve(__dirname, "../../template/email.ejs"), "utf8")
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

    bcrypt.genSalt(10, function (err, salt) {
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
// 关注用户
const follow = async (req, res, next) => {
  try {
    let {
      uid,
      aid,
      status = 1
    } = req.body;
    if (status === 1) {
      if (!aid) {
        return res.send(tips[4001]);
      }
    }
    if (!uid) {
      return res.send(tips[4001]);
    }
    const data = await Follow.findOne({
      where: {
        uid,
        aid
      }
    });
    if (status === 1) {
      if (data) {
        return res.send({...tips[4001], msg: "您已经关注过了该作者"});
      }
      if (aid === uid) {
        return res.send({...tips[4001], msg: "你不能关注你自己"});
      }
      await Follow.create({
        aid,
        uid
      });
    } else {
      await Follow.destroy({
        where: {
          aid,
          uid
        }
      });
    }
    res.send({...tips[200]});
  } catch (e) {
    next(e)
  }
};
// 获取当前用户的关注数
const getUserNum = async (req, res, next) => {
  try {
    let {aid} = req.query;
    const followNum = await Follow.count({
      where: {aid}
    });
    const focusNum = await Follow.count({
      where: {uid: aid}
    });
    const collectNum = await Like.count({
      where: {uid: aid}
    });
    res.send({...tips[200], data: {followNum, focusNum, collectNum}});
  } catch (e) {
    next(e)
  }
};
// 获取用户关注者
const getFollowing = async (req, res, next) => {
  try {
    let {aid, page = 1, limit = 10} = req.query;
    let type = req.params.id;
    if (!type) {
      return res.send({...tips[4001], msg: "参数不全"});
    }
    let sql = "";
    let count = 0;
    if (parseInt(type) === 1) {
      // where.aid = aid
      sql = `SELECT u.* FROM users as u left join follows as f on f.uid = u.id where f.aid = ${aid} LIMIT ${(page - 1) * limit}, ${limit}`;
      count = await Follow.count({
        where: {aid}
      });
    }
    if (parseInt(type) === 2) {
      // where.uid = aid
      sql = `SELECT u.* FROM users as u left join follows as f on f.aid = u.id where f.uid = ${aid} LIMIT ${(page - 1) * limit}, ${limit}`;
      count = await Follow.count({
        where: {uid: aid}
      });
    }
    let data = await sequelize.query(sql, {type: sequelize.QueryTypes.SELECT});
    res.send({
      ...tips[200], data: {
        count,
        data
      }
    });
  } catch (e) {
    next(e)
  }
};
// 获取用户收藏数
const getCollection = async (req, res, next) => {
  try {
    let {id, page = 1, limit = 10} = req.query;
    if (!id) {
      return res.send({...tips[4001], msg: "参数不全"});
    }
    let sql = `
    SELECT p.title, p.images, p.createdAt, p.id, u.username createBy 
    FROM posts AS p 
    LEFT JOIN likes AS l ON l.postId = p.id 
    JOIN users as u ON p.aid = u.id 
    WHERE l.uid = ${id}
    LIMIT ${(page - 1) * limit}, ${limit}
    `;
    let count = await Like.count({
      where: {uid: id}
    });
    let data = await sequelize.query(sql, {type: sequelize.QueryTypes.SELECT});
    res.send({
      ...tips[200], data: {
        count,
        data
      }
    });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  create,
  login,
  list,
  forgot,
  reset,
  update,
  follow,
  getUserNum,
  getFollowing,
  getCollection
};
