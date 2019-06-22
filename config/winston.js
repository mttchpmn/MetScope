const { createLogger, format, transports } = require("winston");
const appRoot = require("app-root-path");

const options = {
  file: {
    level: "info",
    format: format.combine(
      format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss"
      }),
      format.errors({ stack: true }),
      format.splat(),
      format.json()
    ),
    filename: `${appRoot}/logs/app.log`,
    handleExceptions: true,
    json: true,
    maxFiles: 5,
    colorize: false
  },
  console: {
    level: "debug",
    format: format.combine(
      format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss"
      }),
      format.errors({ stack: true }),
      format.splat(),
      format.json()
    ),
    handleExceptions: true,
    json: false,
    colorize: true
  }
};

const logger = createLogger({
  transports: [
    new transports.File(options.file),
    new transports.Console(options.console)
  ],
  exitOnError: false
});

logger.stream = {
  write: function(message, encoding) {
    logger.info(message);
  }
};

module.exports = logger;
