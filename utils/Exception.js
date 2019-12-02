class HttpException extends Error {
  /**
   * @description 异常错误抛出
   * @param msg 错误消息
   * @param code  返回code
   * @param status http code
   */
  constructor(msg = "服务器错误", code = 10000, status = 200) {
    super();
    this.code = code;
    this.message = msg;
    this.status = status;
  }
}

class ParameterException extends HttpException {
  constructor(msg, code = 400) {
    super();
    this.code = code;
    this.msg = msg || "参数错误"
  }
}

module.exports = {
  HttpException,
  ParameterException
};
