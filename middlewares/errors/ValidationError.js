class ValidationError extends Error {
  constructor(resError) {
    super(resError.message);
    this.name = 'ValidationError';
    this.statusCode = resError.code;
  }
}

module.exports = ValidationError;
