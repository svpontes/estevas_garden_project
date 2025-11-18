// backend/middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Define status 500
  const status = err.statusCode || 500;

  // Define pattern message
  const message = err.message || 'Intern server Error.';

  res.status(status).json({
    success: false,
    error: {
      status,
      message,
    },
  });
}

module.exports = errorHandler;
