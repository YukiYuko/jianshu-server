const Banner = require('../../model/banner');
const tips = require("../../utils/tips");
const {del_controller} = require("./public");

// 列表
const list = async (req, res, next) => {
  try {
    let data = await Banner.findAll();
    res.send({...tips[200], data});
  } catch (e) {
    next(e)
  }
};
// 创建
const create = async (req, res, next) => {
  try {
    let {
      title,
      desc,
      url,
      image
    } = req.body;
    if (!title || !url || !image) {
      res.send({code: 302, msg: "请填写完整的信息", data: null})
    } else {
      const data = await Banner.create({
        title,
        image,
        url,
        desc
      });
      res.send({...tips[200], data});
    }
  } catch (e) {
    next(e)
  }
};
// 删除
const del = del_controller(Banner);
// 修改

module.exports = {
  list,
  create,
  del
};
