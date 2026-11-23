
const router = require("express").Router();

const controller = require("../controllers/menu.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.get("/me", authenticate, controller.getMyMenus);

module.exports = router;
