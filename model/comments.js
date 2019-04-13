const Sequelize = require("sequelize");
const sequelize = require("../config/sequelize");
const user = require("../model/user");

// 字段类型
const {
  STRING,
  INTEGER
} = Sequelize;
const Comment = sequelize.define(
  'comment',
  {
    content: STRING,
    uid: INTEGER,
    postId: INTEGER
  }
);
Comment.belongsTo(user, { foreignKey: 'uid', as: 'user' });
// 创建表
// 可以选择在 应用/服务器 启动的时候 自动创建一张表
// 如果 force 为 true, 则每次都会重建表
Comment.sync({
  force: false,
});
module.exports = Comment;
