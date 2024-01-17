class CastError extends Error {
  constructor(resError) {
    super(resError.message);
    this.name = 'CastError';
    this.statusCode = resError.code;
  }
}

module.exports = CastError;
