
const router = require("express").Router();

const controller = require("../controllers/company.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const { validate } = require("../middleware/validate.middleware");

const {
  createCompanySchema,
  updateCompanySchema,
  statusSchema,
  idParamSchema,
} = require("../validators/company.validator");

const { listQuerySchema } = require("../validators/common.validator");

router.use(authenticate, requireRole("SUPER_ADMIN"));

// Create company
router.post(
  "/",
  validate(createCompanySchema),
  controller.create
);

// Company dropdown - define before /:companyId
router.get("/dropdown", controller.dropdown);

// Company list
router.get(
  "/",
  validate(listQuerySchema, "query"),
  controller.list
);

// Company details
router.get(
  "/:companyId",
  validate(idParamSchema, "params"),
  controller.get
);

// Update company
router.patch(
  "/:companyId",
  validate(idParamSchema, "params"),
  validate(updateCompanySchema),
  controller.update
);

// Activate / Deactivate
router.patch(
  "/:companyId/status",
  validate(idParamSchema, "params"),
  validate(statusSchema),
  controller.status
);

module.exports = router;
