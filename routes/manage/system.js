const express = require("express");
const router = express.Router();
const Category= require("../../controllers/category");
const Label = require("../../controllers/label");

// 创建标签
router.post("/label/create", Label.create);
// 标签列表
router.post("/label/list", Label.list);
// 删除标签
router.post("/label/del", Label.del);

// 创建分类
router.post("/category/create", Category.create);
// 分类列表
router.post("/category/list", Category.list);
// 删除分类
router.post("/category/del", Category.del);

module.exports = router;
