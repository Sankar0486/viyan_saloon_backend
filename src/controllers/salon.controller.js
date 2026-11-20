const service = require("../services/salon.service");
const { success } = require("../utils/response");

async function create(req, res, next) {
  try { success(res, "Salon created successfully", await service.createSalon(req.body, req.auth), 201); }
  catch (e) { next(e); }
}
async function list(req, res, next) {
  try {
    const result = await service.listSalons(req.auth, { ...req.query, page: req.query.page, limit: req.query.limit });
    success(res, "Salons retrieved successfully", result.items, 200, result.meta);
  } catch (e) { next(e); }
}
async function get(req, res, next) {
  try { success(res, "Salon retrieved successfully", await service.getSalon(req.params.salonId, req.auth)); }
  catch (e) { next(e); }
}
async function update(req, res, next) {
  try { success(res, "Salon updated successfully", await service.updateSalon(req.params.salonId, req.body, req.auth)); }
  catch (e) { next(e); }
}
async function status(req, res, next) {
  try { success(res, "Salon status updated successfully", await service.setSalonStatus(req.params.salonId, req.body.isActive, req.auth)); }
  catch (e) { next(e); }
}
async function dropdown(req, res, next) {
  try {
    const data = await service.salonDropdown(req.auth, {
      companyId: req.query.companyId,
      search: req.query.search
    });

    success(res, "Salons retrieved successfully", data);
  } catch (e) {
    next(e);
  }
}
module.exports = { create, list, get, update, status };
