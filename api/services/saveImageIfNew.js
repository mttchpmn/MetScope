// External imports
const fs = require("fs");
const util = require("util");
const axios = require("axios");
const appPath = require("app-root-path");
const moment = require("moment");

// Internal imports
const winston = require("../config/winston");
const pool = require("../config/db");
const Webcam = require("../../database/models").Webcam;

// Convert fs callback functions to Promises
const access = util.promisify(fs.access);
const mkdir = util.promisify(fs.mkdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

// Wrapper function that returns True if directory exists
const _dirExists = dirPath =>
  new Promise((resolve, reject) => {
    access(dirPath)
      .then(() => resolve(true))
      .catch(() => resolve(false));
  });

// Wrapper function for readability
const _saveFile = (webcamName, url, fileName) =>
  new Promise((resolve, reject) => {
    let newBuffer;

    axios({ method: "get", url: url, responseType: "arraybuffer" })
      .then(response => Buffer.from(response.data))
      .then(buf => {
        newBuffer = buf;
        return Webcam.findOne({
          where: { name: webcamName }
        });
      })
      .then(webcam => {
        console.log("webcam :", webcam);
        if (!webcam) {
          winston.warn("Found no rows in databse - will save image as new");
          return;
        }
        winston.info(`Found latest image on disk: ${webcam.location}`);
        return readFile(webcam.location);
      })
      .then(oldBuffer => {
        if (!oldBuffer) return false;
        return oldBuffer.equals(newBuffer);
      })
      .then(imageExists => {
        if (!imageExists) {
          winston.info("Image is new and will be saved");
          return writeFile(
            `${appPath}/images/${webcamName}/${fileName}`,
            newBuffer
          );
        }
        winston.info(
          "Image is the same as latest on disk and will not be saved"
        );
        resolve(false);
      })
      .then(() => resolve(true))
      .catch(err => reject(err));
  });

module.exports = (webcamName, url) =>
  new Promise((resolve, reject) => {
    winston.info("Saving image to file...");
    const fileName = `${moment.utc().format("YYYYMMDDTHHmm")}Z.jpg`;

    _dirExists(`${appPath}/images/${webcamName}/`)
      .then(exists => {
        if (!exists) {
          winston.warn(`${webcamName} directory did not exist.  Creating...`);
          return mkdir(`${appPath}/images/${webcamName}`);
        }
        winston.info(`${webcamName} directory exists. Will use.`);
        return;
      })
      .then(() => _saveFile(webcamName, url, fileName))
      .then(imageSaved => {
        if (imageSaved) {
          winston.info("File saved successfully");
          resolve(fileName);
        }
        resolve();
      })
      .catch(err => reject(err));
  });
