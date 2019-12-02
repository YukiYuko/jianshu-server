const Draft = require('../../model/draft');
const tips = require("../../utils/tips");
const User = require("../../model/user");
const Category = require("../../model/category");
const sequelize = require("../../config/sequelize");
const {del_controller} = require("./public");

// 创建草稿
const create = async (req,res,next) => {
  try {
    let params = req.body;
    let id = req.params.id;
    if (!id) {
      // 没有id
      return res.send({code: 301, msg: "接口参数不对", data: null})
    }
    if (!params.aid) {
      // 没有作者ID
      return res.send({code: 301, msg: "未登录", data: null})
    }
    const Author = await User.findById(params.aid);
    if (!Author) {
      return res.send({code: 302, msg: "查询作者失败", data: null});
    }
    let data;
    if (id !== "create") {
      let post = await Draft.findById(id);
      if (!post) {
        return res.send({code: 302, msg: "没有该草稿", data: null});
      }
      await Draft.update({...params, tags: params.tags.join(",")}, {
        where: {
          id
        }
      });
    } else {
      data = await Draft.create({...params, tags: params.tags.join(",")});
    }
    res.send({code: 200, msg: "成功", data});
  } catch (e) {
    next(e)
  }
};
// 获取草稿详情
const detail = async (req,res,next) => {
  try {
    let id = req.params.id;
    if (!id) {
      return res.send(tips[4001]);
    }
    let data = await Draft.findById(id);
    if (!data) {
      return res.send({code: 302, msg: "没有该草稿", data: null});
    }
    res.send({...tips[200], data});
  } catch (e) {
    next(e);
  }
};
/**
 * @description 草稿列表
 */
const list = async (req,res,next) => {
  try {
    let {
      aid
    } = req.body;
    if (!aid) {
      return res.send({code: 302, msg: "没有用户信息", data: null});
    }
    let data = await Draft.findAndCountAll({
      where: {
        aid
      },
      order: [
        ['createdAt', 'DESC'],
      ],
    });
    res.send({...tips[200], data: {count: data.count, data:data.rows}});
  } catch (e) {
    next(e)
  }
};
// 删除
const del = del_controller(Draft);
module.exports = {
  create,
  detail,
  list,
  del
};
