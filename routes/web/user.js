const express = require("express");
const router = express.Router();
const user = require("../../controllers/web/user");
const passport = require("passport");
const { check } = require('express-validator');

// 注册
router.post('/create', [
  check('username').isLength({ min: 5 }).withMessage("用户名最小长度5位"),
  check('email').isEmail(),
] , user.create);
// 列表
router.post("/list", user.list);
// 更新用户
router.post("/update", user.update);
// 登录
router.post("/login", user.login);
// 忘记密码
router.post("/forgot", user.forgot);
// 重置密码
router.post("/reset", user.reset);
// 关注用户
router.post("/follow", user.follow);
// 当前关注用户数
router.get("/followNum", user.getUserNum);
// 获取关注和粉丝
router.get("/following/:id", user.getFollowing);
// 获取用户收藏的文章
router.get("/collection", user.getCollection);
// 详情
router.get("/current",
  passport.authenticate("jwt", {session: false}),
  async (req, res, next) => {
    try {
      let {id, username, email, avatar, job, company, introduce, homepage, editorType} = req.user;
      res.send({
        code: 200, msg: "ok", data: {
          id,
          username,
          email,
          avatar,
          job,
          company,
          introduce,
          homepage,
          editorType
        }
      })
    } catch (e) {
      next(e)
    }
  }
);

module.exports = router;
