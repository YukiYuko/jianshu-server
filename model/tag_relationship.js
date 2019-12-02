const Sequelize = require("sequelize");
const sequelize = require("../config/sequelize");
const tags = require("./label");


// 字段类型
const {
  INTEGER
} = Sequelize;
// 定义文章模型
const tag_relationship = sequelize.define(
  'tag_relationship',
  {
    postId: INTEGER,
    tagId: INTEGER
  }
);

tag_relationship.belongsTo(tags, { foreignKey: 'tagId', as: 'tag' });

tag_relationship.sync({
  force: false,
});

module.exports = tag_relationship;
