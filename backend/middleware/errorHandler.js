const logger = require('../utils/logger');

// Express global error handler middleware
const errorHandler = (err, req, res, _next) => {
  logger.error('Unhandled request error:', err);

  // Check if error is from multer limits
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'File size too large. Maximum limit is 10 MB.'
    });
  }

  // Handle custom validation or generic errors
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;
