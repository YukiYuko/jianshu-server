const Sequelize = require("sequelize");
const sequelize = require("../config/sequelize");

// 字段类型
const {
  STRING,
  INTEGER
} = Sequelize;
const Message = sequelize.define(
  'message',
  {
    content: STRING,
    email: STRING,
    nickname: STRING,
    link: STRING,
    avatar: STRING,
    os: STRING,
    browser: STRING,
    pid: INTEGER
  }
);
Message.hasMany(Message, { foreignKey: 'pid', as: 'child' });
// 创建表
// 可以选择在 应用/服务器 启动的时候 自动创建一张表
// 如果 force 为 true, 则每次都会重建表
Message.sync({
  force: false,
});
module.exports = Message;
