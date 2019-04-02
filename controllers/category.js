const Category = require('../model/category');
const tips = require("../utils/tips");

// 创建标签
const create = async (req,res,next) => {
  try {
    let {name} = req.body;
    if (!name) {
      res.send({code:tips[4001].code, msg: tips[4001].msg, data: null})
    } else {
      const data = await Category.create({
        name
      });
      res.send({code: 200, msg: "成功", data});
    }
  } catch (e) {
    next(e)
  }
};
// 标签列表
const list = async (req,res,next) => {
  try {
    const data = await Category.findAll();
    res.send({code: 200, msg: "成功", data});
  } catch (e) {
    next(e);
  }
};
// 删除标签
const del = async (req,res,next) => {
  try {
    let {id} = req.body;
    if (!id) {
      res.send({code:tips[4001].code, msg: tips[4001].msg, data: null})
    } else {
      const data = await Category.destroy({
        where: {
          id
        }
      });
      if (data) {
        res.send({code: 200, msg: "成功", data});
      } else {
        res.send({code:tips[4001].code, msg: tips[4001].msg, data: null})
      }
    }
  } catch (e) {
    next(e)
  }
};

module.exports =  {
  create,
  list,
  del
};
