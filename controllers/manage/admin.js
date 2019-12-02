const Admin = require('../../model/admins');
const tips = require("../../utils/tips");

const list = async (req, res, next) => {
  try {
    let data = await Admin.findAll();
    res.send({code: 200, data, msg: "成功"})
  } catch (e) {
    next(e)
  }
};

module.exports = {
  list
};
