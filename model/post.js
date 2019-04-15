const Sequelize = require("sequelize");
const sequelize = require("../config/sequelize");
const admin = require("./admins");
const category = require("./category");
const like = require("./like");

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
module.exports = Post;
