const constants = require('../../utils/constants');

function handleError(err, req, res, next) {
  const statusCode = err.statusCode || constants.resError.serverError.code;
  const serverErrorCode = constants.resError.serverError.code;
  const errorMessage = constants.resError.serverError.message;

  const message = statusCode === serverErrorCode
    ? errorMessage
    : err.message;
  res.status(statusCode).send({ message });
  next();
}

module.exports = { handleError };
