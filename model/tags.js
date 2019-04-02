const Sequelize = require("sequelize");
const sequelize = require("../config/sequelize");

// 字段类型
const {
  STRING
} = Sequelize;
const Tags = sequelize.define(
  'tags',
  {
    name: STRING,
    postId: STRING
  }
);
module.exports = Tags;