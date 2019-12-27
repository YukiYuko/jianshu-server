const Sequelize = require("sequelize");
const sequelize = require("../config/sequelize");
const user = require("./user");
const category = require("./category");
const like = require("./like");
const tag = require("./tag_relationship");
const comments = require("./comments");

// 字段类型
const {
  INTEGER,
  STRING,
  TEXT,
} = Sequelize;
// 定义文章模型
const Post = sequelize.define(
  'post',
  {
    title: STRING,
    content: TEXT,
    // 文章分类
    cid: INTEGER,
    // 作者id
    aid: INTEGER,
    readNum: INTEGER,
    images: STRING,
    desc: STRING,
    editorType: STRING,
    // 是否审核通过  1:待审核，2:已通过。3：已决绝。 已拒绝则变为草稿。
    status: {
      type: INTEGER,
      defaultValue: 1
    },
    isHot: {
      type: INTEGER,
      defaultValue: 0
    },
  }
);
Post.belongsTo(user, { foreignKey: 'aid', as: 'author' });
Post.belongsTo(category, { foreignKey: 'cid', as: 'category' });
// Post.belongsTo(like, { foreignKey: 'id', targetKey: "postId", as: 'like' });
Post.hasMany(comments);
comments.belongsTo(Post, { foreignKey: 'postId', as: 'post' });
Post.hasMany(like);
Post.hasMany(tag, {foreignKey: 'postId', as: 'tags'});
//{foreignKey: 'countryCode', sourceKey: 'isoCode'}
Post.sync({
    force: false,
});
module.exports = Post;
