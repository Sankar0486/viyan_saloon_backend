const router = require("express").Router();
const controller = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");
const { authRateLimit } = require("../middleware/rate-limit.middleware");
const {
  loginSchema, refreshSchema, logoutSchema, changePasswordSchema
} = require("../validators/auth.validator");

router.post("/login", authRateLimit, validate(loginSchema), controller.login);
router.post("/refresh", authRateLimit, validate(refreshSchema), controller.refresh);
router.post("/logout", authenticate, validate(logoutSchema), controller.logout);
router.get("/me", authenticate, controller.me);
router.post("/change-password", authenticate, validate(changePasswordSchema), controller.changePassword);

module.exports = router;
