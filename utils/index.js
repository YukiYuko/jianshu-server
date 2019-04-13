const dayjs  = require("dayjs");

module.exports =  {
  day_format(time) {
    if(!time)return '';
    return dayjs(time).format("YYYY-MM-DD-HH-mm-ss")
  },
  getClientIp(req) {
    let ipStr = req.headers['x-forwarded-for'] ||
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress || '';
    let ipReg = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
    if (ipStr.split(',').length > 0) {
      ipStr = ipStr.split(',')[0]
    }
    let ip = ipReg.exec(ipStr);
    return ip[0];
  }
};
