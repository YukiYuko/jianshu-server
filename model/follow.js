// 粉丝表
const Sequelize = require("sequelize");
const sequelize = require("../config/sequelize");
// const user = require("./user");

// 字段类型
const {
  INTEGER
} = Sequelize;
// 定义模型
const Follow = sequelize.define(
  'follow',
  {
    // 跟随者
    uid: {
      type: INTEGER
    },
    // 作者
    aid: {
      type: INTEGER
    },
  }
);
// Follow.belongsTo(user, { foreignKey: 'uid' , as: "following"});

// 创建表
// 可以选择在 应用/服务器 启动的时候 自动创建一张表
// 如果 force 为 true, 则每次都会重建表
Follow.sync({
  force: false,
});
module.exports = Follow;
