const express = require("express");
const router = express.Router();
const message = require("../../controllers/web/message");

// 注册
router.post('/create', message.create);
// 列表
router.post("/list", message.list);
// 登录
router.post("/del", message.del);

module.exports = router;
