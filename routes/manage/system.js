const express = require("express");
const router = express.Router();
const Category= require("../../controllers/manage/category");
const Label = require("../../controllers/manage/label");
const Banner = require("../../controllers/manage/banner");
const Link = require("../../controllers/manage/link");

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

// 创建banner
router.post("/banner/create", Banner.create);
// banner列表
router.post("/banner/list", Banner.list);
// 删除banner
router.post("/banner/del", Banner.del);

// 创建友情链接
router.post("/link/create", Link.create);
// 友情链接列表
router.post("/link/list", Link.list);
// 删除友情链接
router.post("/link/del", Link.del);

module.exports = router;
