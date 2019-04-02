const express = require("express");
const router = express.Router();
const posts = require("../../controllers/post");

/* 发布文章*/
router.post('/create', posts.create);
// 文章列表
router.post("/list", posts.list);
// 删除文章
router.post("/del", posts.del);
// 获取文章详情
router.post("/detail", posts.detail);
// 文章修改
router.post("/update", posts.update);

module.exports = router;
