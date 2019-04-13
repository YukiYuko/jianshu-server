const tips = require("../utils/tips");
const Comments = require("../model/comments");
const User = require("../model/user");
// 发表评论
const create = async (req,res,next) => {
  try {
    let {
      content,
      uid,
      postId
    } = req.body;
    console.log(content, uid, postId);
    let data = await Comments.create({
      content,
      uid,
      postId
    });
    res.send({code: 200, data, msg: "成功"})
  } catch (e) {
    next(e);
  }
};
// 根据文章ID获取评论
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
        postId
      }
    });
    let data = await Comments.findAll({
      where: {
        postId
      },
      limit,
      offset: (page - 1) * limit,
      order: [
        ['createdAt', 'DESC']
      ],
      include: [
        {
          model: User, // 关联查询
          as: 'user', // 别名
        }
      ]
    });
    res.send({code: 200, msg: "成功", data: {data, count}});
  } catch (e) {
    next(e);
  }
};
module.exports = {
  create,
  postComments
};
