const Sequelize = require("sequelize");
const sequelize = require("../config/sequelize");

// 字段类型
const {
  STRING
} = Sequelize;
const User = sequelize.define(
  'user',
  {
    username: STRING,
    password: STRING,
    avatar: STRING,
    email: STRING
  }
);
// 创建表
// 可以选择在 应用/服务器 启动的时候 自动创建一张表
// 如果 force 为 true, 则每次都会重建表
User.sync({
  force: false,
});
module.exports = User;
