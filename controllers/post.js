const Article = require('../model/post');
const tips = require("../utils/tips");
const Admin = require("../model/admins");
const Like = require("../model/like");
const Category = require("../model/category");
const Comments = require("../model/comments");
const {getClientIp} = require("../utils");
const fs = require("fs");
const {day_format} = require("../utils/index");
const path = require("path");

// 创建文章
const create = async (req,res,next) => {
  try {
    let {
      title,
      content,
      label,
      aid,
      cid,
      fileList,
      desc
    } = req.body;
    if (!title || !content || !label || !cid) {
      res.send({code: 302, msg: "请填写完整的信息", data: null})
    } else {
      let images = [];
      if (fileList && fileList.length) {
        fileList.forEach((item) => {
          let base64Data = item.thumbUrl.replace(/^data:image\/\w+;base64,/, "");
          let type = item.type.split("/")[1];
          let name = day_format(Date.now()) + item.uid + '.' + type;
          let data = new Buffer(base64Data, 'base64');
          fs.writeFileSync(path.join("", `public/upload/${name}`), data);
          images.push('http://' + req.headers.host + '/upload/' + name )
        });
        console.log(images);
      }
      const data = await Article.create({
        title,
        content,
        label: label.join(","),
        cid,
        aid: aid || 1,
        images: images.join(","),
        desc
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
      searchVal,
      cid
    } = req.body;
    let criteria = {};
    if (searchType) {
      criteria[searchType] = {$like: `%${searchVal}%`};
    }
    if (cid) {
      criteria["cid"] = cid;
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
      include: [
        {
          model: Admin, // 关联查询
          as: 'author', // 别名
          attributes: ['username']
          // where: {} // Admin的查询条件
        },
        {
          model: Category, // 关联查询
          as: 'category', // 别名
        },
        {
          model: Comments, // 关联查询
          as: 'comments', // 别名
        },
        {
          model: Like, // 关联查询
          as: 'likes', // 别名
        },
      ]
    });
    let json = JSON.parse(JSON.stringify(data));
    let re = json.map((item) => {
      if (item.images) {
        return {...item, images: item.images.split(","), label: item.label.split(",")}
      } else {
        return {...item, label: item.label.split(",")}
      }
    });
    res.send({code: 200, msg: "成功", data: {data: re, count}});
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
      id,
      uid = ""
    } = req.body;
    if (!id) {
      return res.send(tips[4001]);
    }
    let include = [
      {
        model: Admin, // 关联查询
        as: 'author', // 别名
        attributes: ['username']
        // where: {} // Admin的查询条件
      }
    ];
    if (uid) {
      include.push({
        model: Like, // 关联查询
        as: 'likes', // 别名
        attributes: ['id'],
        required: false,
        where: {
          uid
        }
      })
    }
    let data = await Article.findById(id, {
      include
    });
    console.log("data", data)
    // 如果是博客中访问文章详情访问一次加一
    if (req.originalUrl === '/web/article/detail') {
      let readNum = data.readNum || 0;
      readNum+=1;
      await Article.update({
        readNum,
      },{
        where: {id}
      });
    }
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
      cid,
      desc
    } = req.body;
    if (!id) {
      res.send({code: 302, msg: "无效的ID", data: null})
    }
    await Article.update({
      title,
      content,
      label: label.join(","),
      cid,
      aid,
      desc
    },{
      where: {id}
    });
    res.send({...tips[200]});
  } catch (e) {
    next(e);
  }
};

// 文章点赞和取消点赞
const like = async (req, res, next) => {
  try {
    let {
      postId,
      uid,
      status = 1
    } = req.body;
    if (!postId && !uid) {
      return res.send(tips[4001]);
    }
    if (parseInt(status) === 1) {
      await Like.create({
        postId,
        uid
      });
    } else {
      await Like.destroy({
        where: {
          postId,
          uid
        }
      });
    }
    res.send({...tips[200]});
  } catch (e) {
    next(e);
  }
};
//
module.exports = {
  create,
  list,
  del,
  detail,
  update,
  like
};
