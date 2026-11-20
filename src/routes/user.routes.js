const router = require("express").Router();
const controller = require("../controllers/user.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const { validate } = require("../middleware/validate.middleware");
const {
  createCompanyAdminSchema, createSalonUserSchema,
  updateUserSchema, statusSchema, userIdParamSchema
} = require("../validators/user.validator");
const { listQuerySchema } = require("../validators/common.validator");
const { z } = require("zod");

const userListSchema = listQuerySchema.extend({
  role: z.enum(["SUPER_ADMIN", "COMPANY_ADMIN", "SALON_OWNER", "SALON_MANAGER", "SALON_STAFF"]).optional()
});

router.use(authenticate);
router.post("/company-admins", requireRole("SUPER_ADMIN"), validate(createCompanyAdminSchema), controller.createCompanyAdmin);
router.post("/salon-owners", requireRole("SUPER_ADMIN", "COMPANY_ADMIN"), validate(createSalonUserSchema), controller.createSalonOwner);
router.post("/managers", requireRole("SUPER_ADMIN", "COMPANY_ADMIN", "SALON_OWNER"), validate(createSalonUserSchema), controller.createManager);
router.post("/staff", requireRole("SUPER_ADMIN", "COMPANY_ADMIN", "SALON_OWNER"), validate(createSalonUserSchema), controller.createStaff);

router.get("/", requireRole("SUPER_ADMIN", "COMPANY_ADMIN", "SALON_OWNER", "SALON_MANAGER"), validate(userListSchema, "query"), controller.list);
router.get("/:userId", requireRole("SUPER_ADMIN", "COMPANY_ADMIN", "SALON_OWNER", "SALON_MANAGER"), validate(userIdParamSchema, "params"), controller.get);
router.patch("/:userId", requireRole("SUPER_ADMIN", "COMPANY_ADMIN", "SALON_OWNER"), validate(userIdParamSchema, "params"), validate(updateUserSchema), controller.update);
router.patch("/:userId/status", requireRole("SUPER_ADMIN", "COMPANY_ADMIN", "SALON_OWNER"), validate(userIdParamSchema, "params"), validate(statusSchema), controller.status);

module.exports = router;
