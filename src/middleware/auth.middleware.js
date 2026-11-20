const { prisma } = require("../config/database");
const { verifyAccessToken } = require("../utils/tokens");
const { AppError } = require("../utils/app-error");

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      throw new AppError(401, "Authentication token is required", "AUTH_TOKEN_REQUIRED");
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new AppError(401, "Invalid or expired access token", "AUTH_TOKEN_INVALID");
    }

    if (payload.tokenType !== "access" || !payload.sub) {
      throw new AppError(401, "Invalid access token", "AUTH_TOKEN_INVALID");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        companyId: true, salonId: true, isActive: true, createdAt: true,
        company: { select: { id: true, isActive: true } },
        salon: { select: { id: true, companyId: true, isActive: true } }
      }
    });

    if (!user || !user.isActive) {
      throw new AppError(401, "User account is unavailable", "ACCOUNT_UNAVAILABLE");
    }

    if (user.role !== "SUPER_ADMIN") {
      if (!user.companyId || !user.company || !user.company.isActive) {
        throw new AppError(403, "The company associated with this account is unavailable", "COMPANY_INACTIVE");
      }
      if (user.role === "COMPANY_ADMIN") {
        if (user.salonId !== null) throw new AppError(403, "Company Admin account has an invalid salon assignment", "INVALID_TENANT_ASSIGNMENT");
      } else {
        if (!user.salonId || !user.salon || !user.salon.isActive || user.salon.companyId !== user.companyId) {
          throw new AppError(403, "The salon associated with this account is unavailable", "SALON_INACTIVE");
        }
      }
    }

    req.auth = {
      userId: user.id,
      role: user.role,
      companyId: user.companyId,
      salonId: user.salonId
    };
    req.user = {
      id: user.id, name: user.name, email: user.email, phone: user.phone,
      role: user.role, companyId: user.companyId, salonId: user.salonId,
      isActive: user.isActive, createdAt: user.createdAt
    };
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { authenticate };
