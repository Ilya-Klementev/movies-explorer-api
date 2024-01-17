class UnauthorizedError extends Error {
  constructor(data) {
    super(data.message);
    this.name = 'UnauthorizedError';
    this.statusCode = data.code;
  }
}

module.exports = UnauthorizedError;
