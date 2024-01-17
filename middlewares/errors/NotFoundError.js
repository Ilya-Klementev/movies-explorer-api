class NotFoundError extends Error {
  constructor(resError) {
    super(resError.message);
    this.name = 'NotFoundError';
    this.statusCode = resError.code;
  }
}

module.exports = NotFoundError;
