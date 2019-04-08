const User = require('../model/user');
const bcrypt = require("bcrypt");
const tips = require("../utils/tips");
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const {jwtsecret} = require("../config");


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
        bcrypt.genSalt(10, function(err, salt) {
          bcrypt.hash(password, salt, async (err, hash) => {
            if (err) {
              throw err;
            }
            // hash为加密后的密码
            password = hash;
            // 调用存储方法
            let data = await User.create({
              username,
              password,
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
        jwt.sign(rule, jwtsecret, { expiresIn: 3600 }, (err, token) => {
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

// 用户列表
const list = async (req, res, next) => {
  try {
    let data = await User.findAll();
    res.send({code: 200, data, msg: "成功"})
  } catch (e) {
    next(e)
  }
};

module.exports = {
  create,
  login,
  list
};
