const Message = require('../../model/message');
const tips = require("../../utils/tips");
const {del_controller} = require("./public");
const useragent = require('express-useragent');
// 列表
let getChild = async (data) => {
  // 这一步 非常关键 ！！！！！！ 如果没有这一步的话，child设置不上去的，因为初始字段里面没有设置 child
  let rootData = JSON.parse(JSON.stringify(data));
  // let rootData = data;
  let expendPromise = [];
  rootData.forEach(item => {
    expendPromise.push(Message.findAll({
      where : {
        pid : item.id
      }
    }))
  });
  let child = await Promise.all(expendPromise);
  for(let [idx , item] of child.entries()){
    if(item.length > 0){
      item = await getChild(item);
    }
    rootData[idx].child = item;
  }
  return rootData;
};
const list = async (req, res, next) => {
  try {
    let {
      limit = 10, page = 1,
    } = req.body;
    let rootData = await Message.findAndCountAll({
      raw: true,  // 设置返回元数据
      where: {
        pid: 0
      },
      limit,
      offset: (page - 1) * limit,
      order: [
        ['createdAt', 'DESC'],
      ]
    });
    let data = await getChild(rootData.rows);
    res.send({...tips[200], data: {count: rootData.count, rows:data}});
  } catch (e) {
    next(e)
  }
};
// 创建
const create = async (req, res, next) => {
  try {
    let {
      content,
      email,
      nickname,
      link,
      pid
    } = req.body;
    if (!content || !email || !nickname || !link) {
      res.send({code: 302, msg: "请填写完整的信息哦~", data: null})
    } else {
      let source = req.headers['user-agent'];
      let ua = useragent.parse(source);
      const data = await Message.create({
        content,
        email,
        nickname,
        link,
        os: ua.os,
        browser: ua.browser + " | " + ua.version,
        pid
      });
      res.send({...tips[200], data});
    }
  } catch (e) {
    next(e)
  }
};
// 删除
const del = del_controller(Message);
// 修改

module.exports = {
  list,
  create,
  del
};
