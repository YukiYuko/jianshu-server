const Article = require('../model/post');
const tips = require("../utils/tips");
const Admin = require("../model/admins");

// 创建文章
const create = async (req,res,next) => {
  try {
    let {
      title,
      content,
      label,
      aid,
      cid
    } = req.body;
    if (!title || !content || !label || !cid) {
      res.send({code: 302, msg: "请填写完整的信息", data: null})
    } else {
      const data = await Article.create({
        title,
        content,
        label: label.join(","),
        cid,
        aid: aid || 1
      });
      res.send({code: 200, msg: "成功", data});
    }
  } catch (e) {
    next(e);
  }
};
// 文章列表
const list = async (req,res,next) => {
  try {
    let {
      limit = 10, page = 1,
      searchType,
      searchVal
    } = req.body;
    let criteria = {};
    if (searchType) {
      criteria[searchType] = {$like: `%${searchVal}%`};
    }
    let count = await Article.count({
      where: criteria
    });
    let data = await Article.findAll({
      where: criteria,
      limit,
      offset: (page - 1) * limit,
      order: [
        ['createdAt', 'DESC']
      ],
      include: {
        model: Admin, // 关联查询
        as: 'author', // 别名
        attributes: ['username']
        // where: {} // Admin的查询条件
      }
    });
    res.send({code: 200, msg: "成功", data: {data, count}});
  } catch (e) {
    next(e);
  }
};
// 删除文章
const del = async (req,res,next) => {
  try {
    let {
      id
    } = req.body;
    await Article.destroy({where: {id}});
    res.send(tips[200]);
  } catch (e) {
    next(e);
  }
};
// 获取文章详情
const detail = async (req,res,next) => {
  try {
    let {
      id
    } = req.body;
    let data = await Article.findById(id);
    res.send({...tips[200], data});
  } catch (e) {
    next(e);
  }
};
// 修改文章
const update = async (req,res,next) => {
  try {
    let {
      id,
      title,
      content,
      label,
      aid = 1,
      cid
    } = req.body;
    if (!id) {
      res.send({code: 302, msg: "无效的ID", data: null})
    }
    await Article.update({
      title,
      content,
      label: label.join(","),
      cid,
      aid
    },{
      where: {id}
    });
    res.send({...tips[200]});
  } catch (e) {
    next(e);
  }
};


module.exports = {
  create,
  list,
  del,
  detail,
  update
};
