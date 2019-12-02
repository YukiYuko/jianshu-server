const express = require("express");
const router = express.Router();
const comments = require("../../controllers/web/comments");

// 发表评论
router.post('/create', comments.create);
// 根据文章ID获取评论
router.post('/list', comments.postComments);
// 热门评论
router.post('/hot', comments.hotComments);




module.exports = router;
