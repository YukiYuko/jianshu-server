const express = require("express");
const router = express.Router();
const draft = require("../../controllers/web/draft");

/* 发布草稿*/
router.post('/:id', draft.create);
// 草稿详情
router.get('/detail/:id', draft.detail);
// 草稿列表
router.post("/", draft.list);
// 删除草稿
router.delete("/del", draft.del);

module.exports = router;
