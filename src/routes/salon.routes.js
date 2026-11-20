const router = require("express").Router();
const controller = require("../controllers/salon.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const { validate } = require("../middleware/validate.middleware");
const { createSalonSchema, updateSalonSchema, statusSchema, salonIdParamSchema } = require("../validators/salon.validator");
const { listQuerySchema } = require("../validators/common.validator");
const { z } = require("zod");

const salonListSchema = listQuerySchema.extend({ companyId: z.string().uuid().optional() });

router.use(authenticate);
router.post("/", requireRole("SUPER_ADMIN", "COMPANY_ADMIN"), validate(createSalonSchema), controller.create);
router.get("/", requireRole("SUPER_ADMIN", "COMPANY_ADMIN", "SALON_OWNER", "SALON_MANAGER", "SALON_STAFF"), validate(salonListSchema, "query"), controller.list);
router.get(
  "/dropdown",
  requireRole(
    "SUPER_ADMIN",
    "COMPANY_ADMIN",
    "SALON_OWNER",
    "SALON_MANAGER",
    "SALON_STAFF"
  ),
  controller.dropdown
);
router.get("/:salonId", requireRole("SUPER_ADMIN", "COMPANY_ADMIN", "SALON_OWNER", "SALON_MANAGER", "SALON_STAFF"), validate(salonIdParamSchema, "params"), controller.get);
router.patch("/:salonId", requireRole("SUPER_ADMIN", "COMPANY_ADMIN"), validate(salonIdParamSchema, "params"), validate(updateSalonSchema), controller.update);
router.patch("/:salonId/status", requireRole("SUPER_ADMIN", "COMPANY_ADMIN"), validate(salonIdParamSchema, "params"), validate(statusSchema), controller.status);
module.exports = router;
