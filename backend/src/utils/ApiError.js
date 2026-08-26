export class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message)
    this.statusCode = statusCode
    this.details = details
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
  static badRequest(msg = 'Bad request', details) { return new ApiError(400, msg, details) }
  static unauthorized(msg = 'Unauthorized') { return new ApiError(401, msg) }
  static forbidden(msg = 'Forbidden') { return new ApiError(403, msg) }
  static notFound(msg = 'Not found') { return new ApiError(404, msg) }
  static conflict(msg = 'Conflict') { return new ApiError(409, msg) }
  static unprocessable(msg = 'Validation failed', details) { return new ApiError(422, msg, details) }
  static notImplemented(msg = 'Not implemented') { return new ApiError(501, msg) }
}
