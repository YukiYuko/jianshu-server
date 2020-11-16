module.exports = {
  apps: [
    {
      // 生产环境
      name: "prod",
      // 项目启动入口文件
      script: "./bin/www",
      // 项目环境变量
      env: {
        "NODE_ENV": "production"
      }
    }, {
      // 测试环境
      name: "dev",
      // 项目启动入口文件
      script: "./bin/www",
      // 项目环境变量
      env: {
        "NODE_ENV": "dev"
      }
    }]
};
