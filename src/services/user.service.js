const { prisma } = require("../config/database");
const { AppError } = require("../utils/app-error");
const { hashPassword } = require("../utils/password");

const safeSelect = {
  id: true, name: true, email: true, phone: true, role: true,
  companyId: true, salonId: true, isActive: true, createdAt: true, updatedAt: true
};

async function resolveScope(auth, requestedCompanyId, salonId) {
  let companyId = requestedCompanyId || null;
  let salon = null;

  if (auth.role === "SUPER_ADMIN") {
    if (!salonId) throw new AppError(400, "salonId is required for salon-level users", "SALON_ID_REQUIRED");
    salon = await prisma.salon.findUnique({ where: { id: salonId }, select: { id: true, companyId: true, isActive: true, company: { select: { isActive: true } } } });
  } else if (auth.role === "COMPANY_ADMIN") {
    companyId = auth.companyId;
    if (!companyId) throw new AppError(403, "Company scope is required", "TENANT_SCOPE_REQUIRED");
    salon = await prisma.salon.findFirst({ where: { id: salonId, companyId }, select: { id: true, companyId: true, isActive: true, company: { select: { isActive: true } } } });
  } else if (auth.role === "SALON_OWNER") {
    companyId = auth.companyId;
    if (!auth.salonId || salonId !== auth.salonId) throw new AppError(403, "You can create users only in your assigned salon", "TENANT_ACCESS_DENIED");
    salon = await prisma.salon.findFirst({ where: { id: auth.salonId, companyId: auth.companyId }, select: { id: true, companyId: true, isActive: true, company: { select: { isActive: true } } } });
  } else {
    throw new AppError(403, "You cannot create user accounts", "FORBIDDEN");
  }

  if (!salon) throw new AppError(404, "Salon not found in your permitted company", "SALON_NOT_FOUND");
  if (!salon.isActive || !salon.company.isActive) throw new AppError(409, "Cannot create users in an inactive company or salon", "TENANT_INACTIVE");
  if (companyId && companyId !== salon.companyId) throw new AppError(400, "Salon does not belong to the specified company", "COMPANY_SALON_MISMATCH");
  return { companyId: salon.companyId, salonId: salon.id };
}

async function createCompanyAdmin(data, auth) {
  if (auth.role !== "SUPER_ADMIN") throw new AppError(403, "Only Super Admin can create Company Admin accounts", "FORBIDDEN");
  const company = await prisma.company.findUnique({ where: { id: data.companyId }, select: { id: true, isActive: true } });
  if (!company) throw new AppError(404, "Company not found", "COMPANY_NOT_FOUND");
  if (!company.isActive) throw new AppError(409, "Cannot create an admin for an inactive company", "COMPANY_INACTIVE");
  try {
    const user = await prisma.user.create({
      data: { name: data.name, email: data.email, phone: data.phone ?? null, passwordHash: await hashPassword(data.password), role: "COMPANY_ADMIN", companyId: company.id },
      select: safeSelect
    });
    await prisma.activityLog.create({ data: { userId: auth.userId, action: "COMPANY_ADMIN_CREATED", metadata: { createdUserId: user.id, companyId: company.id } } });
    return user;
  } catch (e) {
    if (e.code === "P2002") throw new AppError(409, "A user with this email already exists", "EMAIL_ALREADY_EXISTS");
    throw e;
  }
}

async function createSalonUser(role, data, auth) {
  if (!["SALON_OWNER", "SALON_MANAGER", "SALON_STAFF"].includes(role)) {
    throw new AppError(400, "Unsupported salon user role", "INVALID_ROLE");
  }
  if (role === "SALON_OWNER" && !["SUPER_ADMIN", "COMPANY_ADMIN"].includes(auth.role)) {
    throw new AppError(403, "Only Super Admin or Company Admin can create Salon Owners", "FORBIDDEN");
  }
  if (["SALON_MANAGER", "SALON_STAFF"].includes(role) && !["SUPER_ADMIN", "COMPANY_ADMIN", "SALON_OWNER"].includes(auth.role)) {
    throw new AppError(403, "You cannot create this user role", "FORBIDDEN");
  }
  const scope = await resolveScope(auth, data.companyId, data.salonId);
  try {
    const user = await prisma.user.create({
      data: {
        name: data.name, email: data.email, phone: data.phone ?? null,
        passwordHash: await hashPassword(data.password), role,
        companyId: scope.companyId, salonId: scope.salonId
      },
      select: safeSelect
    });
    await prisma.activityLog.create({
      data: { userId: auth.userId, action: `${role}_CREATED`, metadata: { createdUserId: user.id, companyId: scope.companyId, salonId: scope.salonId } }
    });
    return user;
  } catch (e) {
    if (e.code === "P2002") throw new AppError(409, "A user with this email already exists", "EMAIL_ALREADY_EXISTS");
    throw e;
  }
}

function scopedUserWhere(auth) {
  if (auth.role === "SUPER_ADMIN") return {};
  if (!auth.companyId) throw new AppError(403, "Company scope is required", "TENANT_SCOPE_REQUIRED");
  if (auth.role === "COMPANY_ADMIN") return { companyId: auth.companyId };
  if (!auth.salonId) throw new AppError(403, "Salon scope is required", "TENANT_SCOPE_REQUIRED");
  return { companyId: auth.companyId, salonId: auth.salonId };
}

async function listUsers(auth, { page, limit, search, role, isActive }) {
  const where = scopedUserWhere(auth);
  if (role) where.role = role;
  if (typeof isActive === "boolean") where.isActive = isActive;
  if (search) where.OR = [
    { name: { contains: search, mode: "insensitive" } },
    { email: { contains: search, mode: "insensitive" } },
    { phone: { contains: search, mode: "insensitive" } }
  ];
  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({ where, select: safeSelect, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
    prisma.user.count({ where })
  ]);
  return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

async function getUser(userId, auth) {
  const user = await prisma.user.findFirst({ where: { id: userId, ...scopedUserWhere(auth) }, select: safeSelect });
  if (!user) throw new AppError(404, "User not found", "USER_NOT_FOUND");
  return user;
}

async function updateUser(userId, data, auth) {
  if (!["SUPER_ADMIN", "COMPANY_ADMIN", "SALON_OWNER"].includes(auth.role)) {
    throw new AppError(403, "You cannot update user profiles", "FORBIDDEN");
  }
  const existing = await getUser(userId, auth);
  if (existing.role === "SUPER_ADMIN" && auth.role !== "SUPER_ADMIN") throw new AppError(403, "You cannot update a Super Admin", "FORBIDDEN");
  try {
    const user = await prisma.user.update({ where: { id: existing.id }, data, select: safeSelect });
    await prisma.activityLog.create({ data: { userId: auth.userId, action: "USER_UPDATED", metadata: { targetUserId: userId } } });
    return user;
  } catch (e) {
    if (e.code === "P2002") throw new AppError(409, "A user with this email already exists", "EMAIL_ALREADY_EXISTS");
    throw e;
  }
}

async function setUserStatus(userId, isActive, auth) {
  if (!["SUPER_ADMIN", "COMPANY_ADMIN", "SALON_OWNER"].includes(auth.role)) {
    throw new AppError(403, "You cannot change user status", "FORBIDDEN");
  }
  if (userId === auth.userId && !isActive) throw new AppError(400, "You cannot deactivate your own account", "SELF_DEACTIVATION_NOT_ALLOWED");
  const existing = await getUser(userId, auth);
  if (existing.role === "SUPER_ADMIN" && auth.role !== "SUPER_ADMIN") throw new AppError(403, "You cannot change a Super Admin account", "FORBIDDEN");
  const user = await prisma.user.update({ where: { id: existing.id }, data: { isActive }, select: safeSelect });
  if (!isActive) {
    await prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
  }
  await prisma.activityLog.create({ data: { userId: auth.userId, action: isActive ? "USER_ACTIVATED" : "USER_DEACTIVATED", metadata: { targetUserId: userId } } });
  return user;
}

module.exports = { createCompanyAdmin, createSalonUser, listUsers, getUser, updateUser, setUserStatus };
