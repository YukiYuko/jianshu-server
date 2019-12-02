const express = require("express");
const router = express.Router();
const Song= require("../../controllers/web/songs");

// 标签列表
router.get("/list", Song.list);

module.exports = router;
