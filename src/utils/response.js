function success(res, message, data = null, statusCode = 200, meta = null) {
  return res.status(statusCode).json({ success: true, message, data, meta });
}

module.exports = { success };
