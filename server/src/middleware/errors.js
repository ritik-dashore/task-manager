function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Request body contains malformed JSON.' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request body must be smaller than 100 KB.' });
  }
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    const message = error.name === 'ValidationError'
      ? Object.values(error.errors).map(item => item.message).join(' ')
      : `Invalid value for ${error.path}.`;
    return res.status(400).json({ success: false, message });
  }
  if (error.code === 11000) {
    return res.status(409).json({ success: false, message: 'A task with those details already exists.' });
  }

  const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 500 ? error.status : 500;
  if (status >= 500) console.error('Request failed:', error.message);
  return res.status(status).json({
    success: false,
    message: status === 500 ? 'An unexpected server error occurred.' : error.message,
  });
}

module.exports = { notFound, errorHandler };
