const Post = require('../../model/post');
const Draft = require('../../model/draft');
const Comments = require('../../model/comments');
const Label = require('../../model/label');
const tips = require("../../utils/tips");
const User = require('../../model/user');
const {time_diff} = require("../../utils/index");


const count = async (req, res, next) => {
  try {
    // 文章总数
    const post_count = await Post.count();
    // 草稿数目
    const draft_count = await Draft.count();
    // 评论总数
    const comments_count = await Comments.count();
    // 标签总数
    const label_count = await Label.count();
    // 建站时间
    const build_time = time_diff("2020-10-01", new Date());
    // 注册用户
    const user_count = await User.count();
    // 访问总量
    // 最近更新
    const last_modify = await Post.findOne({
      order: [
        ['id', 'DESC'],
      ]
    });
    res.send({
      ...tips[200], data: {
        post_count,
        draft_count,
        comments_count,
        label_count,
        build_time,
        user_count,
        last_modify
      }
    });
  } catch (e) {
    next(e)
  }
};

module.exports = {
  count
};
