"use strict";

const cheerio = require("cheerio");

const getWebContent = require("../../../../../util/getWebContent");

module.exports = async originUrl => {
  let imageUrl;

  const html = await getWebContent(originUrl, true);
  const $ = cheerio.load(html);
  $("img").map((i, elem) => {
    if (elem.attribs.src.includes("QTHill")) {
      imageUrl = elem.attribs.src;
    }
  });

  return imageUrl;
};
