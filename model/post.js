const Sequelize = require("sequelize");
const sequelize = require("../config/sequelize");
const admin = require("./admins");
const category = require("./category");
const like = require("./like");
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
    label: STRING,
    images: STRING,
    desc: STRING
  }
);
Post.belongsTo(admin, { foreignKey: 'aid', as: 'author' });
Post.belongsTo(category, { foreignKey: 'cid', as: 'category' });
// Post.belongsTo(like, { foreignKey: 'id', targetKey: "postId", as: 'like' });
Post.hasMany(comments);
Post.hasMany(like);
module.exports = Post;
