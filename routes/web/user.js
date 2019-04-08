const express = require("express");
const router = express.Router();
const user = require("../../controllers/user");
const passport = require("passport");

// 注册
router.post('/create', user.create);
// 列表
router.post("/list", user.list);
// 登录
router.post("/login", user.login);
// 详情
router.get("/current",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      res.send({code: 200, msg: "ok",data: {
          id: req.user.id,
          username: req.user.name,
          email: req.user.email,
        }})
    } catch (e) {
      next(e)
    }
  }
);

module.exports = router;
