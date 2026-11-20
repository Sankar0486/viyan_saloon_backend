const router = require("express").Router();
const authRoutes = require("./auth.routes");
const companyRoutes = require("./company.routes");
const salonRoutes = require("./salon.routes");
const userRoutes = require("./user.routes");
const { authenticate } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const { requireSalonAccess } = require("../middleware/tenant.middleware");
const { success } = require("../utils/response");

router.use("/auth", authRoutes);
router.use("/companies", companyRoutes);
router.use("/salons", salonRoutes);
router.use("/users", userRoutes);

// Retained V1 compatibility endpoint.
router.get(
  "/tenancy/salons/:salonId/access-check",
  authenticate,
  requireRole("SUPER_ADMIN", "COMPANY_ADMIN", "SALON_OWNER", "SALON_MANAGER", "SALON_STAFF"),
  (req, res, next) => {
    if (req.auth.role === "COMPANY_ADMIN") {
      return res.status(403).json({
        success: false, message: "Company admins must use company-scoped operations",
        error: { code: "SALON_SCOPE_NOT_AVAILABLE", details: null }
      });
    }
    next();
  },
  requireSalonAccess("salonId"),
  (req, res) => success(res, "Salon access verified", {
    salonId: req.params.salonId,
    authenticatedUserId: req.auth.userId
  })
);

module.exports = router;
