const Article = require('../../model/post');
const tips = require("../../utils/tips");
const Admin = require("../../model/admins");
const User = require("../../model/user");
const Like = require("../../model/like");
const Up = require("../../model/up");
const tag_relationship = require("../../model/tag_relationship");
const Category = require("../../model/category");
const Comments = require("../../model/comments");
const sequelize = require("../../config/sequelize");

// 创建文章
const create = async (req,res,next) => {
  try {
    let {
      title,
      content,
      tags,
      aid,
      cid,
      images,
      desc
    } = req.body;
    if (!title || !content || !tags.length || !cid) {
      res.send({code: 302, msg: "请填写完整的信息", data: null})
    } else {
      /*****************多图上传********************/
      // let images = [];
      // if (fileList && fileList.length) {
      //   fileList.forEach((item) => {
      //     let base64Data = item.thumbUrl.replace(/^data:image\/\w+;base64,/, "");
      //     let type = item.type.split("/")[1];
      //     let name = day_format(Date.now(), "YYYY-MM-DD-HH-mm-ss") + item.uid + '.' + type;
      //     let data = new Buffer(base64Data, 'base64');
      //     fs.writeFileSync(path.join("", `public/upload/${name}`), data);
      //     images.push('http://' + req.headers.host + '/upload/' + name )
      //   });
      //   console.log(images);
      // }
       /******************************************/
      const Author = await User.findById(aid);
      if (!Author) {
        res.send({code: 302, msg: "查询作者失败", data: null});
        return
      }
      const data = await Article.create({
        title,
        content,
        cid,
        aid: aid || 1,
        images,
        desc,
        status: 1
      });
      for (let item of tags) {
        await tag_relationship.create({
          postId: data.id,
          tagId: item
        })
      }
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
      cid,
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
        // sequelize.random(),
        ['createdAt', 'DESC'],
      ],
      // order: sequelize.random(),
      include: [
        {
          model: User, // 关联查询
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
          // 加上这个条件之后只会查询评论的pid为0的。。。？ 为什么
          // where: {
          //   pid: 0
          // }
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
        return {...item, images: item.images.split(","), label: []}
      } else {
        return {...item, label: []}
      }
    });
    res.send({code: 200, msg: "成功", data: {data: re, count}});
  } catch (e) {
    next(e);
  }
};
// 获取随机文章
const listRand = async (req,res,next) => {
  try {
    let {
      limit = 5,
      type = 1 //  1为随机文章, 2为最近更新
    } = req.body;
    let order = sequelize.random();
    let data = await Article.findAll({
      order,
      limit,
      include: [
        {
          model: User, // 关联查询
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
          // where: {
          //   pid: 0
          // }
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
        return {...item, images: item.images.split(","), label: []}
      } else {
        return {...item, label: []}
      }
    });
    res.send({code: 200, msg: "成功", data: re});
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
        model: User, // 关联查询
        as: 'author', // 别名
        attributes: ['username']
        // where: {} // Admin的查询条件
      }
    ];
    if (uid) {
      include.push({
        model: Like, // 关联查询
        as: 'likes', // 别名
        // attributes: ['id'],
        required: false,
        // where: {
        //   uid
        // }
      })
    }
    let data = await Article.findById(id, {
      include
    });
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
      tags,
      cid,
      desc,
      images
    } = req.body;
    if (!id) {
      res.send({code: 302, msg: "无效的ID", data: null})
    }
    let data = await Article.update({
      title,
      content,
      cid,
      desc,
      images
    },{
      where: {id}
    });
    // 每次更新都是先删除以前的关联关系，再新增
    await tag_relationship.destroy({where: {postId:data.id}});
    for (let item of tags) {
      await tag_relationship.create({
        postId: data.id,
        tagId: item
      })
    }
    res.send({...tips[200]});
  } catch (e) {
    next(e);
  }
};
// 修改文章状态
const updateStatus = async (req,res,next) => {
  try {
    let {
      id,
      status
    } = req.body;
    if (!id || [1, 2, 3].indexOf(status) < 0) {
      res.send({code: 302, msg: "无效的参数", data: null})
    }
    await Article.update({
      status
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
// 文章点赞和取消点赞
const up = async (req, res, next) => {
  try {
    let {
      commentId,
      uid,
      status = 1
    } = req.body;
    if (!commentId && !uid) {
      return res.send(tips[4001]);
    }
    if (parseInt(status) === 1) {
      await Up.create({
        commentId,
        uid
      });
    } else {
      await Up.destroy({
        where: {
          commentId,
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
  like,
  up,
  listRand,
  updateStatus
};
