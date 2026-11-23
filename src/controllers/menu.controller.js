const menuService = require("../services/menu.service");
const { success } = require("../utils/response");

async function getMyMenus(req, res, next) {
  try {
    const menus = await menuService.getUserMenus(req.auth);

    return success(
      res,
      "Menus retrieved successfully",
      menus
    );
  } catch (error) {
    next(error);
  }
}

module.exports = { getMyMenus };