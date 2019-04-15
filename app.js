const express = require('express');  //加载express模块
const path = require('path');  //路径模块
const cookieParser = require('cookie-parser'); //这就是一个解析Cookie的工具。通过req.cookies可以取到传过来的cookie，并把它们转成对象。
const logger = require('morgan'); //  在控制台中，显示req请求的信息
const cors = require('cors'); // 跨域中间件
const jwt = require('jsonwebtoken'); // 使用jwt签名
const config = require('./config/index'); // 引入配置
const passport = require('passport');

// 路由信息（接口地址），存放在routes的根目录
const indexRouter = require('./routes/manage');
const loginRouter = require('./routes/manage/login');
const adminRouter = require('./routes/manage/admin');
const articleRouter = require('./routes/manage/article');
const webArticleRouter = require('./routes/web/article');
const systemRouter = require('./routes/manage/system');
const uploadRouter = require('./routes/manage/upload');
const userRouter = require('./routes/web/user');
const commentRouter = require('./routes/web/comments');

const app = express();

// 设置superSecret 全局参数
app.set('superSecret', config.jwtsecret);

// 初始化passport
// passport的配置
app.use(passport.initialize());
require('./utils/passport')(passport);

// 载入中间件
//  localhost:端口号/api 路径路由定义
let apiRoutes = express.Router();
let webRoutes = express.Router();
apiRoutes.use(function (req, res, next) {
  // 拿取token 数据 按照自己传递方式写
  let token = req.body.token || req.query.token || req.headers['authorization'];
  if (token) {
    // 解码 token (验证 secret 和检查有效期（exp）)
    jwt.verify(token, app.get('superSecret'), function (err, decoded) {
      if (err) {
        return res.json({code: 301, data: null, msg: '无效的token.'});
      } else {
        // 如果验证通过，在req中写入解密结果
        req.decoded = decoded;
        //console.log(decoded)  ;
        next(); //继续下一步路由
      }
    });
  } else {
    // 没有拿到token 返回错误
    return res.status(403).send({
      code: 401,
      data: null,
      message: '错误的参数'
    });
  }
});
// 设置跨域
app.use(cors());
// 使用 morgan 将请求日志输出到控制台
app.use(logger('dev'));
app.use(express.json({limit: "20mb"}));
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

apiRoutes.use('/admin', adminRouter);
apiRoutes.use('/article', articleRouter);
apiRoutes.use('/system', systemRouter);
apiRoutes.use('/upload', uploadRouter);

webRoutes.use('/article', webArticleRouter);
webRoutes.use('/system', systemRouter);
webRoutes.use('/user', userRouter);
webRoutes.use('/comment', commentRouter);
app.use('/api', apiRoutes);
app.use('/web', webRoutes);
app.use('/', loginRouter);
// 注册API路由

app.use(errorHandler);

function errorHandler(err, req, res, next) {
  console.log("err", err);
  res.status(200).send({code: -1, msg: err.errors[0].message});
}

module.exports = app;
