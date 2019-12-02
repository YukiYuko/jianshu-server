const express = require("express");
const router = express.Router();
const user = require("../../controllers/manage/user");
const passport = require("passport");

// 注册
router.post('/create', user.create);
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
// 详情
router.get("/current",
  passport.authenticate("jwt", {session: false}),
  async (req, res, next) => {
    try {
      console.log(req.user);
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
