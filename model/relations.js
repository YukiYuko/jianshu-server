const Sequelize = require("sequelize");
const sequelize = require("../config/sequelize");

// 字段类型
const {
  STRING
} = Sequelize;
const Relations = sequelize.define(
  'relations',
  {
    postId: STRING(11),
    tagId: STRING(100)
  }
);
module.exports = Relations;