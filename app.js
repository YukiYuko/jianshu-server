const express = require('express');  //加载express模块
const path = require('path');  //路径模块
const cookieParser = require('cookie-parser'); //这就是一个解析Cookie的工具。通过req.cookies可以取到传过来的cookie，并把它们转成对象。
const logger = require('morgan'); //  在控制台中，显示req请求的信息
const cors = require('cors'); // 跨域中间件
const jwt = require('jsonwebtoken'); // 使用jwt签名
const config = require('./config/index'); // 引入配置
const passport = require('passport');
const expressJwt = require("express-jwt");

// 路由信息（接口地址），存放在routes的根目录
const indexRouter = require('./routes/manage');
const articleManageRouter = require('./routes/manage/article');
const webArticleRouter = require('./routes/web/article');
const webDraftRouter = require('./routes/web/draft');
const systemWebRouter = require('./routes/web/system');
const systemManageRouter = require('./routes/manage/system');
const uploadManageRouter = require('./routes/manage/upload');
const uploadWebRouter = require('./routes/manage/upload');
const userWebRouter = require('./routes/web/user');
const userManageRouter = require('./routes/manage/user');
const commentRouter = require('./routes/web/comments');
const messageRouter = require('./routes/web/message');
const songRouter = require('./routes/web/song');

const app = express();

// 设置superSecret 全局参数
app.set('superSecret', config.jwtsecret);

// 设置跨域
app.use(cors());
// 初始化passport
// passport的配置
app.use(passport.initialize());
require('./utils/passport')(passport);

// 载入中间件
// express-jwt中间件帮我们自动做了token的验证以及错误处理，所以一般情况下我们按照格式书写就没问题，其中unless放的就是你想要不检验token的api。
const jwtAuth = expressJwt({secret: config.jwtsecret}).unless({
  path: ["/web/user/login", "/web/user/create", "/web/user/list",/\/web\/article/, /\/web\/system/, /\/web\/comment\/list/, /\/web\/comment\/hot/, /\/upload/,
    "/api/user/login", "/api/user/register", "/web/user/forgot", "/web/user/reset", "/web/song/list", "/web/message/list"]
});
app.use(jwtAuth);
app.use(function (err, req, res, next) {
  console.log("err", err.name);
  if (err.name === 'UnauthorizedError') {
    res.status(200).send({code: 301, data: null, msg: '无效的token.'});
  }
});
//  localhost:端口号/api 路径路由定义
let apiRoutes = express.Router();
let webRoutes = express.Router();
/*自定义jwt验证*************************************************************/
// apiRoutes.use(validateToken);
// webRoutes.use(validateToken);
function validateToken(req, res, next) {
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
}

/*自定义jwt验证*************************************************************/
// 使用 morgan 将请求日志输出到控制台
app.use(logger('dev'));
app.use(express.json({limit: "20mb"}));
app.use(express.urlencoded({extended: false}));
app.use(cookieParser(app.get('superSecret')));
app.use(express.static(path.join(__dirname, 'public')));

apiRoutes.use('/user', userManageRouter);
apiRoutes.use('/article', articleManageRouter);
apiRoutes.use('/system', systemManageRouter);
apiRoutes.use('/upload', uploadManageRouter);

webRoutes.use('/article', webArticleRouter);
webRoutes.use('/draft', webDraftRouter);
webRoutes.use('/system', systemWebRouter);
webRoutes.use('/user', userWebRouter);
webRoutes.use('/song', songRouter);
webRoutes.use('/comment', commentRouter);
webRoutes.use('/message', messageRouter);
webRoutes.use('/upload', uploadWebRouter);
app.use('/api', apiRoutes);
app.use('/web', webRoutes);
// 注册API路由
app.use(errorHandler);

function errorHandler(err, req, res, next) {
  console.log("err", err.message);
  if (err) {
    if (err.message || (err.errors && err.errors[0].message)) {
      res.status(200).send({code: -1, msg: err.message || err.errors[0].message});
    } else {
      res.status(200).send({code: -1, msg: "服务器错误，我也不知道什么原因，反正先就这样"});
    }
  }
}

module.exports = app;
