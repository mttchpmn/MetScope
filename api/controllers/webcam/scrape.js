"use strict";

const winston = require("../../services/winston");
const webcamList = require("../../../config/webcams").all;
const scrapeStatic = require("./scrapers/_static");

module.exports = (req, res) => {
  const webcamName = req.params.name;
  winston.info(`Scraping webcam for ${webcamName}`);

  const allCamNames = webcamList.map(cam => cam.code);
  const requestedCam = webcamList.filter(cam => cam.code === webcamName)[0];

  // Return 404 if we can't find the requested webcam
  if (!allCamNames.includes(webcamName)) {
    winston.warn(`Scraper for webcam: ${webcamName} not found`);
    return res.status(404).json({
      message: `Webcam scraper not found.  Available webcams are: ${allCamNames}`
    });
  }

  if (requestedCam.static === false) {
    const scrapeDynamic = require(`./scrapers/${webcamName}`);
    scrapeDynamic(webcamName, requestedCam.originUrl)
      .then(({ code, newImage }) =>
        res
          .status(200)
          .json({ message: "Scrape successful", data: { code, newImage } })
      )
      .catch(err => {
        winston.error(err.message);
        res.status(500).json({ error: "Internal error" });
      });
  }

  scrapeStatic(webcamName, requestedCam.originUrl)
    .then(({ code, newImage }) =>
      res
        .status(200)
        .json({ message: "Scrape successful", data: { code, newImage } })
    )
    .catch(err => {
      winston.error(err.message);
      res.status(500).json({ error: "Internal error" });
    });
};
