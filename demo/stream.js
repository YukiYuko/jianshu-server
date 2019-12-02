"use strict";
const fs = require("fs");

// ********************************************读取流
// let rs = fs.createReadStream("aa.txt", "utf-8");
// // 要注意，data事件可能会有多次，每次传递的chunk是流的一部分数据。
// rs.on("data", function(chunk) {
//   console.log("DATA:");
//   console.log(chunk);
// });

// rs.on("end", function() {
//   console.log("END");
// });

// rs.on("error", function(err) {
//   console.log("ERROR: " + err);
// });

// **********************************************写入流
// var ws1 = fs.createWriteStream('output1.txt', 'utf-8');
// ws1.write('使用Stream写入文本数据...\n');
// ws1.write('END.');
// ws1.end();

// var ws2 = fs.createWriteStream('output2.txt');
// ws2.write(Buffer.from('使用Stream写入二进制数据...\n', 'utf-8'));
// ws2.write(Buffer.from('END.', 'utf-8'));
// ws2.end();

// **********************************************管道
var rs = fs.createReadStream('aa.txt');
var ws = fs.createWriteStream('copied.txt');

rs.pipe(ws);


process.stdin.on('data', function (chunk) {
  console.log('stream by stdin', chunk)
  console.log('stream by stdin', chunk.toString())
});
//控制台输入koalakoala后输出结果

