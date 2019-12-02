const express = require('express');
const router = express.Router();
const multer = require("multer");
const tips = require("../../utils/tips");
const fs = require('fs');
const {day_format} = require("../../utils/index");
let createFolder = function(folder){
  try{
    fs.accessSync(folder);
  }catch(e){
    fs.mkdirSync(folder);
  }
};

const uploadFolder = 'public/upload';

createFolder(uploadFolder);

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/upload')
  },
  filename: function (req, file, cb) {
    let type = file.mimetype.split("/")[1];
    cb(null, file.fieldname + '-' + day_format(Date.now(), "YYYY-MM-DD-HH-mm-ss") + '.' + type);
  }
});
const upload = multer({ storage });
/* GET users listing. */
router.post("/single", upload.single('avatar'), async (req, res, next) => {
  try {
    let url = { url: 'http://' + req.headers.host + '/upload/' + req.file.filename };
    res.json({
      code : 200,
      data : url
    });
  } catch (e) {
    next(e)
  }
});

module.exports = router;
