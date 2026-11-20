const rateLimit = require("express-rate-limit");

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
    error: { code: "AUTH_RATE_LIMITED", details: null }
  }
});

module.exports = { authRateLimit };
