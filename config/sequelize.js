const Sequelize = require("sequelize");
const dbConfig = {
  database: 'jianshu',
  username: 'root',
  password: '',
  host: 'localhost',
  dialect: 'mysql', // 'mysql'|'sqlite'|'postgres'|'mssql'
};
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  timezone: '+08:00',
  //其实你使用原来的 $like 也是可以的。在Sequelize中 称为操作符的别名，但是在V4版本以后新加了符号运算符来代替了，
  // 比如你说的Op.or , operatorsAliases: false, 这个配置改成true，就不会报错了。
  operatorsAliases: true,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});
// 测试成功与否
sequelize
  .authenticate()
  .then(() => {
    console.log('连接成功');
  })
  .catch(err => {
    console.error('连接失败:', err);
  });

module.exports = sequelize;
