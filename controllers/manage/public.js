const tips = require("../../utils/tips");
// 删除
const del_controller = (model) => async (req,res,next) => {
  try {
    let {
      id
    } = req.body;
    await model.destroy({where: {id}});
    res.send(tips[200]);
  } catch (e) {
    next(e);
  }
};

module.exports = {
  del_controller
};
