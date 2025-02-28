class ApiError extends Error {
  constructor(
    status,
    message = "Something went wrong!",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.success = false;
    this.status = status;
    this.message = message;
    this.errors = errors;
    this.timestamp = new Date().toISOString();

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
