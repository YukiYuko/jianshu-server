const express = require('express');
const router = express.Router();
const admin = require("../../controllers/manage/admin");

/* GET users listing. */
router.get("/get", admin.list);

module.exports = router;
