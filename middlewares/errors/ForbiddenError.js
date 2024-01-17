class ForbiddenError extends Error {
  constructor(resError) {
    super(resError.message);
    this.name = 'ConflictError';
    this.statusCode = resError.code;
  }
}

module.exports = ForbiddenError;
