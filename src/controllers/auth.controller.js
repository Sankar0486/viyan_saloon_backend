const authService = require("../services/auth.service");
const { prisma } = require("../config/database");
const { success } = require("../utils/response");
const { publicUser } = require("../utils/serializers");

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    success(res, "Login successful", result, 200);
  } catch (error) { next(error); }
}

async function refresh(req, res, next) {
  try {
    const result = await authService.refreshSession(req.body.refreshToken);
    success(res, "Token refreshed successfully", result);
  } catch (error) { next(error); }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.auth.userId, req.body.refreshToken);
    success(res, "Logout successful", null);
  } catch (error) { next(error); }
}

async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.auth.userId },
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        companyId: true, salonId: true, isActive: true, createdAt: true
      }
    });
    success(res, "Current user retrieved successfully", publicUser(user));
  } catch (error) { next(error); }
}

async function changePassword(req, res, next) {
  try {
    await authService.changePassword(
      req.auth.userId, req.body.currentPassword, req.body.newPassword
    );
    success(res, "Password changed. Please log in again.", null);
  } catch (error) { next(error); }
}

module.exports = { login, refresh, logout, me, changePassword };
