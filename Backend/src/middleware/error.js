const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
};

const handler = (err, req, res, next) => {
  console.error('Error:', err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Server error' });
};

module.exports = { notFound, handler };
