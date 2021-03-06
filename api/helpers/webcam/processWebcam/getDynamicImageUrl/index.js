"use strict";
const appPath = require("app-root-path");

const winston = require("../../../../services/winston");
const checkPathIsValid = require("../../../util/checkPathIsValid");

class WebcamError extends Error {
  constructor(message) {
    super(message);
    this.name = "WebcamError";
  }
}

module.exports = async webcam => {
  try {
    const scraperPath = `./scrapers/${webcam.area}/${webcam.code}`;
    const valid = await checkPathIsValid(
      `${appPath}/api/helpers/webcam/processWebcam/getDynamicImageUrl/scrapers/${webcam.area}/${webcam.code}.js`
    );
    if (!valid) throw new WebcamError("No scraper module.");

    const scrapeUrl = require(scraperPath);
    const imageUrl = await scrapeUrl(webcam.originUrl);

    return imageUrl;
  } catch (error) {
    throw error;
  }
};
