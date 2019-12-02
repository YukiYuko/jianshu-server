const Link = require('../../model/link');
const tips = require("../../utils/tips");
const {del_controller} = require("./public");

// 列表
const list = async (req, res, next) => {
  try {
    let {limit} = req.body;
    let data = await Link.findAll({
      limit
    });
    res.send({...tips[200], data});
  } catch (e) {
    next(e)
  }
};
// 创建
const create = async (req, res, next) => {
  try {
    let {
      url,
      image,
      title,
      description,
      avatar
    } = req.body;
    if (!url || !avatar || !title || !description) {
      res.send({code: 302, msg: "请填写完整的信息,(LOGO非必传)", data: null})
    } else {
      const data = await Link.create({
        image,
        url,
        title,
        description,
        avatar
      });
      res.send({...tips[200], data});
    }
  } catch (e) {
    next(e)
  }
};
// 删除
const del = del_controller(Link);
// 修改

module.exports = {
  list,
  create,
  del
};
