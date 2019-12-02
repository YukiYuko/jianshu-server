const tips = require("../../utils/tips");
// 删除
const del_controller = (model) => async (req,res,next) => {
  try {
    let {
      id
    } = req.body;
    if (!id) {
      res.send({code: 302, msg: "参数错误", data: null});
    }
    await model.destroy({where: {id}});
    res.send(tips[200]);
  } catch (e) {
    next(e);
  }
};

module.exports = {
  del_controller
};
