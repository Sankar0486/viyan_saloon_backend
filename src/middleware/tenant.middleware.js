const { AppError } = require("../utils/app-error");

/**
 * Checks a tenant identifier from a route parameter against the authenticated
 * user's database-derived tenant scope. Do not use client-supplied tenant IDs
 * as query filters without applying this check.
 */
function requireSalonAccess(paramName = "salonId") {
  return (req, res, next) => {
    const requestedSalonId = req.params[paramName];
    const auth = req.auth;

    if (!auth) return next(new AppError(401, "Authentication required", "UNAUTHENTICATED"));
    if (auth.role === "SUPER_ADMIN") return next();

    if (!requestedSalonId || !auth.salonId || requestedSalonId !== auth.salonId) {
      return next(new AppError(403, "You cannot access this salon", "TENANT_ACCESS_DENIED"));
    }
    next();
  };
}

function requireCompanyAccess(paramName = "companyId") {
  return (req, res, next) => {
    const requestedCompanyId = req.params[paramName];
    const auth = req.auth;

    if (!auth) return next(new AppError(401, "Authentication required", "UNAUTHENTICATED"));
    if (auth.role === "SUPER_ADMIN") return next();

    if (!requestedCompanyId || !auth.companyId || requestedCompanyId !== auth.companyId) {
      return next(new AppError(403, "You cannot access this company", "TENANT_ACCESS_DENIED"));
    }
    next();
  };
}

/** Use this helper in every future tenant-scoped Prisma query. */
function salonWhere(auth, extra = {}) {
  if (auth.role === "SUPER_ADMIN") return { ...extra };
  if (!auth.salonId) throw new AppError(403, "Salon scope is required", "TENANT_SCOPE_REQUIRED");
  return { ...extra, salonId: auth.salonId };
}

function companyWhere(auth, extra = {}) {
  if (auth.role === "SUPER_ADMIN") return { ...extra };
  if (!auth.companyId) throw new AppError(403, "Company scope is required", "TENANT_SCOPE_REQUIRED");
  return { ...extra, companyId: auth.companyId };
}

module.exports = { requireSalonAccess, requireCompanyAccess, salonWhere, companyWhere };
