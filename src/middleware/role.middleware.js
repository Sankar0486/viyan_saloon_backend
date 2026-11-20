const { prisma } = require("../config/database");
const { AppError } = require("../utils/app-error");

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.auth) return next(new AppError(401, "Authentication required", "UNAUTHENTICATED"));
    if (!allowedRoles.includes(req.auth.role)) {
      return next(new AppError(403, "You do not have access to this resource", "FORBIDDEN"));
    }
    next();
  };
}

function requirePermission(permissionKey) {
  return async (req, res, next) => {
    try {
      if (!req.auth) throw new AppError(401, "Authentication required", "UNAUTHENTICATED");
      if (req.auth.role === "SUPER_ADMIN") return next();

      const assignment = await prisma.rolePermission.findFirst({
        where: {
          role: req.auth.role,
          permission: { key: permissionKey }
        },
        select: { id: true }
      });

      if (!assignment) throw new AppError(403, "Permission denied", "PERMISSION_DENIED");
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { requireRole, requirePermission };
