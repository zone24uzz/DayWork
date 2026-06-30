/**
 * Centralized error handler for all API routes
 */
const errorHandler = (err, req, res, _next) => {
  console.error('API Error:', err.message)

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({ message: messages.join('. ') })
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' })
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return res.status(400).json({ message: 'Duplicate entry' })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' })
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' })
  }

  // Default server error
  res.status(err.status || 500).json({
    message: err.message || 'Server error',
  })
}

module.exports = errorHandler
