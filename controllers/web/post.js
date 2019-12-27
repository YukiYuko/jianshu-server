const Article = require('../../model/post');
const tips = require("../../utils/tips");
const User = require("../../model/user");
const Draft = require("../../model/draft");
const Like = require("../../model/like");
const Up = require("../../model/up");
const Tag = require("../../model/label");
const tag_relationship = require("../../model/tag_relationship");
const Category = require("../../model/category");
const Comments = require("../../model/comments");
const sequelize = require("../../config/sequelize");
const {ParameterException} = require("../../utils/Exception");

// tag_relationship.belongsTo(Article, { foreignKey: 'postId', as: 'article' });

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
      desc,
      is_draft,
      postId
    } = req.body;
    if (!is_draft && (!title || !content || !tags.length || !cid)) {
      // 如果不是草稿
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
      if (postId) {
        await Draft.destroy({where: {id:postId}});
      }
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
      aid,
      status
    } = req.body;
    let criteria = {
      status: status || 2
    };
    if (searchType) {
      criteria[searchType] = {$like: `%${searchVal}%`};
    }
    if (cid) {
      criteria["cid"] = cid;
    }
    if (aid) {
      criteria["aid"] = aid;
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
        {
          model: tag_relationship, // 关联查询
          as: 'tags', // 别名
          include: [
            {
              model: Tag,
              as: "tag",
              attributes: ['name']
            }
          ]
        }
      ]
    });
    let json = JSON.parse(JSON.stringify(data));
    let re = json.map((item) => {
      if (item.images) {
        // if (item.images.includes(",")) {
        //   return {...item, images: item.images.split(",")}
        // } else {
        //   return {...item}
        // }
        return {...item, images: item.images.split(",")}
      } else {
        return {...item, images: []}
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
      type = 1 //  1为随机文章, 2为最近更新, 3为热门文章
    } = req.body;
    let order = Number(type) === 1 ? sequelize.random() : null;
    let criteria = Number(type) === 3 ? {
      isHot: 1
    } : {};
    let data = await Article.findAll({
      order,
      limit,
      where: criteria,
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
        return {...item, label: [], images: []}
      }
    });
    res.send({code: 200, msg: "成功", data: re});
  } catch (e) {
    next(e);
  }
};
// 根据标签查询文章
const TagList = async (req,res,next) => {
  try {
    let {
      limit = 10,
      tagId,
      page = 1,
      uid
    } = req.body;
    //
    // let data = await Article.findAll({
    //   include: [
    //     {
    //       model: tag_relationship, // 关联查询
    //       as: 'tags', // 别名
    //       where: {
    //
    //       }
    //     },
    //   ]
    // });
    let count = await tag_relationship.count({
      where: {
        tagId
      }
    });
    let currentTag = await Tag.findOne({
      where: {
        id: tagId
      }
    });
    let sql = `
      SELECT p.title, p.images, p.createdAt, p.id, u.username createBy, u.avatar, s.name
      FROM posts AS p
      LEFT JOIN tag_relationships as t ON p.id = t.postId
      JOIN system_labels as s ON s.id = t.tagId
      JOIN users as u ON p.aid = u.id
      WHERE t.tagId = ${tagId} LIMIT ${(page-1) * limit}, ${limit}
    `;
    let data = await sequelize.query(sql,{type : sequelize.QueryTypes.SELECT});
    let re = [];
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        let sql2 = `
          SELECT s.*
          FROM system_labels as s
          INNER JOIN tag_relationships as t ON t.tagId = s.id
          WHERE t.postId = ${data[key].id}
        `;
        let item = await sequelize.query(sql2,{type : sequelize.QueryTypes.SELECT});
        let isLike = await Like.findOne({
          where: {
            uid,
            postId: data[key].id
          }
        });
        re.push({...data[key], tags: item, isLike: isLike ? 1:0})
      }
    }
    res.send({code: 200, msg: "成功", data: re, count, tagName: currentTag.name});
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
      },
      {
        model: tag_relationship, // 关联查询
        as: 'tags', // 别名
        include: [
          {
            model: Tag,
            as: "tag",
            attributes: ['name']
          }
        ]
      }
    ];
    if (uid) {
      include.push({
        model: Like, // 关联查询
        as: 'likes', // 别名
        required: false,
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
      aid,
      cid,
      desc
    } = req.body;
    if (!id || !aid) {
      res.send({code: 302, msg: "无效的ID", data: null})
    }
    let data = await Article.update({
      title,
      content,
      cid,
      desc,
      status: 1
    },{
      where: {id}
    });
    for (let item of tags) {
      await tag_relationship.update({
        tagId: item
      },{
        where: {postId: data.id}
      })
    }
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
// 评论点赞和取消点赞
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
  TagList
};
