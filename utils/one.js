const puppeteer = require('puppeteer');
// 爬取数据的url
const OneUrl = "http://wufazhuce.com/";

module.exports = async () => {
  const browser = await (puppeteer.launch({
    // 若是手动下载的chromium需要指定chromium地址, 默认引用地址为 /项目目录/node_modules/puppeteer/.local-chromium/
    executablePath: 'D:\\chrome-win\\chrome',
    //设置超时时间
    timeout: 15000,
    //如果是访问https页面 此属性会忽略https错误
    ignoreHTTPSErrors: true,
    // 打开开发者工具, 当此值为true时, headless总为false
    devtools: false,
    // 关闭headless模式, 不会打开浏览器
    headless: true
  }));
  const page = await browser.newPage();
  await page.goto(OneUrl);
  const dimensions = await page.evaluate((sel) => {
    const getText = (v, selector) => {
      return v.querySelector(selector) && v.querySelector(selector).innerText;
    };
    const dom = document.querySelector("#carousel-one").querySelectorAll(".item")[0];
    return {
      title: getText(dom, ".fp-one-imagen-footer"),
      vol: getText(dom, ".titulo"),
      day: getText(dom, ".dom"),
      date: getText(dom, ".may"),
      content: getText(dom, ".fp-one-cita a"),
      src: dom.querySelector(".fp-one-imagen").src
    }
  });
  await browser.close();
  return dimensions;
};
