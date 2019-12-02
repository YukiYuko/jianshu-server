const Sequelize = require("sequelize");
const sequelize = require("../config/sequelize");
const user = require("./user");
const category = require("./category");

// 字段类型
const {
  INTEGER,
  STRING,
  TEXT,
} = Sequelize;
// 定义文章模型
const Draft = sequelize.define(
  'draft',
  {
    title: STRING,
    content: TEXT,
    // 文章分类
    cid: INTEGER,
    // 作者id
    aid: INTEGER,
    images: STRING,
    desc: STRING,
    tags: STRING,
    editorType: STRING
  }
);
Draft.belongsTo(user, { foreignKey: 'aid', as: 'author' });
Draft.belongsTo(category, { foreignKey: 'cid', as: 'category' });
Draft.sync({
    force: false,
});
module.exports = Draft;
