const rateLimit = require('express-rate-limit');
const constants = require('../utils/constants');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: constants.resSuccess.rateLimitMessage,
  headers: true,
});

module.exports = limiter;
