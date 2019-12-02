const Admin = require("../../model/admins");
const jwt = require("jsonwebtoken");
const config = require('../../config'); // 引入配置
const authenticate = async (req,res,next) => {
  try {
    let {
      username,
      password
    } = req.body;
    if (!username || !password) {
      res.send({code: 401, data: null, msg: "参数错误"})
    }
    let admin = await Admin.findOne({
      where: {username}
    });
    if (admin) {
      if (password === admin.password) {
        let token = jwt.sign(JSON.parse(JSON.stringify(admin)), config.jwtsecret, {
          expiresIn : 60*60*24// 授权时效24小时
        });
        res.send({code: 200, data: token, msg: "登录成功"})
      } else {
        res.send({code: 401, data: null, msg: "账号或者密码错误"})
      }
    } else {
      res.send({code: 402, data: null, msg: "用户不存在"})
    }
  } catch (e) {
    next(e)
  }
};

module.exports = {
  authenticate
};
