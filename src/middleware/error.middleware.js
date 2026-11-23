const { AppError } = require("../utils/app-error");

function notFound(req, res, next) {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`, "ROUTE_NOT_FOUND"));
}

function errorHandler(error, req, res, next) {
  const isOperational = error instanceof AppError;
  const statusCode = isOperational ? error.statusCode : 500;
  const code = isOperational ? error.code : "INTERNAL_SERVER_ERROR";
  const message = isOperational ? error.message : "An unexpected server error occurred";

  if (process.env.NODE_ENV !== "test") {
    const log = { method: req.method, path: req.originalUrl, statusCode, code };
    if (statusCode >= 500) console.error("API error:", log, error);
    else console.warn("API request rejected:", log,req.body);
  }

  const body = {
    success: false,
    message,
    error: {
      code,
      details: isOperational ? error.details : null
    }
  };

  if (process.env.NODE_ENV === "development" && !isOperational) {
    body.error.debugMessage = error.message;
  }

  res.status(statusCode).json(body);
}

module.exports = { notFound, errorHandler };
