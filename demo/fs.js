const fs = require("fs");
// *********************************************************读文件
/*
fs.readFile("aa.txt", 'utf-8', (err, data) => {
  if (err) {
    console.log(err);
  } else {
    console.log(data);
  }
});
*/
// fs.readFile("aa.txt", (err, data) => {
//   if (err) {
//     console.log(err);
//   } else {
//     // 当读取二进制文件时，不传入文件编码时，回调函数的data参数将返回一个Buffer对象。在Node.js中，Buffer对象就是一个包含零个或任意个字节的数组（注意和Array不同）。
//     let text = data.toString('utf-8');
//     console.log(text)
//     let buf = Buffer.from(text);
//     console.log(buf)
//   }
// });

// ******************************************************写文件

// let str = "hello node.js";
// fs.writeFile("hello.txt", str, err => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("ok.");
//   }
// });

// ******************************************************获取文件信息
fs.stat("hello.txt", function(err, stat) {
  if (err) {
    console.log(err);
  } else {
    // 是否是文件:
    console.log("isFile: " + stat.isFile());
    // 是否是目录:
    console.log("isDirectory: " + stat.isDirectory());
    if (stat.isFile()) {
      // 文件大小:
      console.log("size: " + stat.size);
      // 创建时间, Date对象:
      console.log("birth time: " + stat.birthtime);
      // 修改时间, Date对象:
      console.log("modified time: " + stat.mtime);
    }
  }
});
