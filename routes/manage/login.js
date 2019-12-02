const express = require('express');
const router = express.Router();
const Login = require("../../controllers/manage/login");
/*
* @description: 管理员登录
* @params: username 用户名(邮箱，手机)
* @params: password 密码
* */
router.post("/authenticate", Login.authenticate);


module.exports = router;
