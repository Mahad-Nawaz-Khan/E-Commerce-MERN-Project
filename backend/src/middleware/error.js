import { ApiError } from '../utils/ApiError.js'

export function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`))
}

export function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode || 500
  let message = err.isOperational ? err.message : 'Internal server error'
  if (err.name === 'ValidationError') {
    statusCode = 422
    message = Object.values(err.errors).map((item) => item.message).join(', ')
  } else if (err.name === 'CastError') {
    statusCode = 400
    message = `Invalid ${err.path}`
  } else if (err.code === 11000) {
    statusCode = 409
    message = 'A record with that value already exists'
  } else if (/Transaction numbers are only allowed/.test(err.message || '')) {
    statusCode = 503
    message = 'Orders require MongoDB replica-set support. Configure your local MongoDB as a replica set.'
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413
    message = 'File is too large. Images must be 10MB or less.'
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400
    message = 'Unexpected file field in upload.'
  } else if (err.code === 'LIMIT_FILE_COUNT') {
    statusCode = 400
    message = 'Too many files uploaded at once.'
  }
  const response = {
    success: false,
    error: {
      code: statusCode,
      message,
    },
  }
  if (err.details) response.error.details = err.details
  if (statusCode === 500) {
    console.error('[error]', err.stack || err)
  }
  res.status(statusCode).json(response)
}
