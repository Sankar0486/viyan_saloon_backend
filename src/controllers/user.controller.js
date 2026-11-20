const service = require("../services/user.service");
const { success } = require("../utils/response");

async function createCompanyAdmin(req, res, next) {
  try { success(res, "Company Admin created successfully", await service.createCompanyAdmin(req.body, req.auth), 201); }
  catch (e) { next(e); }
}
function createRole(role, label) {
  return async (req, res, next) => {
    try { success(res, `${label} created successfully`, await service.createSalonUser(role, req.body, req.auth), 201); }
    catch (e) { next(e); }
  };
}
async function list(req, res, next) {
  try {
    const result = await service.listUsers(req.auth, req.query);
    success(res, "Users retrieved successfully", result.items, 200, result.meta);
  } catch (e) { next(e); }
}
async function get(req, res, next) {
  try { success(res, "User retrieved successfully", await service.getUser(req.params.userId, req.auth)); }
  catch (e) { next(e); }
}
async function update(req, res, next) {
  try { success(res, "User updated successfully", await service.updateUser(req.params.userId, req.body, req.auth)); }
  catch (e) { next(e); }
}
async function status(req, res, next) {
  try { success(res, "User status updated successfully", await service.setUserStatus(req.params.userId, req.body.isActive, req.auth)); }
  catch (e) { next(e); }
}
module.exports = {
  createCompanyAdmin, createSalonOwner: createRole("SALON_OWNER", "Salon Owner"),
  createManager: createRole("SALON_MANAGER", "Manager"),
  createStaff: createRole("SALON_STAFF", "Staff"),
  list, get, update, status
};
