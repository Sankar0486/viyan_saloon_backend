const { AppError } = require("../utils/app-error");

function validate(schema, property = "body") {
  return (req, res, next) => {
    const parsed = schema.safeParse(req[property]);
    if (!parsed.success) {
      const details = parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message
      }));
      return next(new AppError(400, "Validation failed", "VALIDATION_ERROR", details));
    }
    req[property] = parsed.data;
    next();
  };
}

module.exports = { validate };
