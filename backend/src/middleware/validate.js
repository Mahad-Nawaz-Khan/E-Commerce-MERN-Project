import { validationResult } from 'express-validator'
import { ApiError } from '../utils/ApiError.js'

export function validate(rules) {
  return async (req, res, next) => {
    await Promise.all(rules.map((rule) => rule.run(req)))
    const result = validationResult(req)
    if (result.isEmpty()) return next()
    const details = result.array().reduce((acc, e) => { acc[e.path] = e.msg; return acc }, {})
    next(ApiError.unprocessable('Validation failed', details))
  }
}
