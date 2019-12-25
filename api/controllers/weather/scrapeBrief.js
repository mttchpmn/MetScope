"use strict";

const moment = require("moment");

const winston = require("../../config/winston");
const retrieveBrief = require("../../services/retrieveBrief");
const Brief = require("../../../database/models").Brief;

module.exports = async (req, response) => {
  const brief = await retrieveBrief();

  console.log("brief :", brief);

  await Brief.create({
    identifier: brief.info.identifier,
    date: brief.info.issueDate,
    from: brief.info.validFrom,
    to: brief.info.validTo,
    info: brief.info,
    aerodromes: brief.aerodromes,
    aaw: brief.aaw,
    sigmet: brief.sigmet,
    charts: brief.charts
  });
  winston.info(
    `IFIS brief added to database successfully with identifier: ${brief.identifier}`
  );

  return response.status(200).json({ data: { brief } });
};
