const dayjs  = require("dayjs");

module.exports =  {
  day_format(time) {
    if(!time)return '';
    return dayjs(time).format("YYYY-MM-DD-HH-mm-ss")
  }
};
