const tips = require("../../utils/tips");
const Comments = require("../../model/comments");
const Post = require("../../model/post");
const User = require("../../model/user");
const Up = require("../../model/up");
const useragent = require('express-useragent');
// 发表评论
const create = async (req,res,next) => {
  try {
    let {
      content,
      uid,
      postId,
      pid,
      replyId
    } = req.body;
    console.log("***********************************",pid, replyId);
    let source = req.headers['user-agent'];
    let ua = useragent.parse(source);
    let data = await Comments.create({
      content,
      uid,
      postId,
      pid,
      replyId,
      os: ua.os,
      browser: ua.browser + " | " + ua.version,
    });
    res.send({code: 200, data, msg: "成功"})
  } catch (e) {
    next(e);
  }
};
// 根据文章ID获取评论
const include = function () {
  return [
    {
      model: User, // 关联查询
      as: 'user', // 别名
    },
    {
      model: User, // 关联查询
      as: 'reply_user', // 别名
    },
    {
      model: Up, // 关联查询
      as: 'like', // 别名
    },
  ]
};
const postComments = async (req,res,next) => {
  try {
    let {
      postId,
      limit = 5,
      page = 1
    } = req.body;
    if (!postId) {
      return res.send(tips[4001]);
    }
    let count = await Comments.count({
      where: {
        postId,
        pid: 0
      }
    });
    let data = await Comments.findAll({
      where: {
        postId,
        pid: 0
      },
      limit,
      offset: (page - 1) * limit,
      order: [
        ['createdAt', 'DESC']
      ],
      include: [
        ...include(),
        {
          model: Comments, // 关联查询
          as: 'reply', // 别名
          include: include()
        },
      ]
    });
    res.send({code: 200, msg: "成功", data: {data, count}});
  } catch (e) {
    next(e);
  }
};
// 热门评论
const hotComments = async (req,res,next) => {
  try {
    let {
      limit = 5
    } = req.body;
    let data = await Comments.findAll({
      where: {
        pid: 0
      },
      limit,
      order: [
        ['createdAt', 'DESC']
      ],
      include: [
        ...include(),
        {
          model: Post, // 关联查询
          as: 'post' // 别名
        }
      ]
    });
    res.send({code: 200, msg: "成功", data});
  } catch (e) {
    next(e);
  }
};

module.exports = {
  create,
  postComments,
  hotComments
};
