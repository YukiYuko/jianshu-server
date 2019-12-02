const Song = require('../../model/songs');
const tips = require("../../utils/tips");
// const {del_controller} = require("./public");

// 列表
const list = async (req, res, next) => {
  try {
    let {limit} = req.body;
    let data = await Song.findAll({
      limit
    });
    res.send({...tips[200], data});
  } catch (e) {
    next(e)
  }
};

module.exports = {
  list
};
