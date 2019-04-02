const Sequelize = require("sequelize");
const sequelize = require("../config/sequelize");

// 字段类型
const {
  STRING
} = Sequelize;
const Admin = sequelize.define(
  'admin',
  {
    username: STRING,
    password: STRING
  }
);
// 创建表
// 可以选择在 应用/服务器 启动的时候 自动创建一张表
// 如果 force 为 true, 则每次都会重建表
Admin.sync({
  force: false,
});
module.exports = Admin;
