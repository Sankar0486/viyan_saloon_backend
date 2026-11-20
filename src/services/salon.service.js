const { prisma } = require("../config/database");
const { AppError } = require("../utils/app-error");

const salonSelect = {
  id: true, companyId: true, name: true, code: true, email: true, phone: true,
  address: true, timezone: true, isActive: true, createdAt: true, updatedAt: true,
  company: { select: { id: true, name: true, code: true, isActive: true } },
  _count: { select: { users: true } }
};

function assertCompanyScope(auth, companyId) {
  if (auth.role !== "SUPER_ADMIN" && auth.companyId !== companyId) {
    throw new AppError(403, "You cannot access this company's salons", "TENANT_ACCESS_DENIED");
  }
}

async function ensureCompany(companyId) {
  const company = await prisma.company.findUnique({ where: { id: companyId }, select: { id: true, isActive: true } });
  if (!company) throw new AppError(404, "Company not found", "COMPANY_NOT_FOUND");
  if (!company.isActive) throw new AppError(409, "Cannot create or manage salons under an inactive company", "COMPANY_INACTIVE");
  return company;
}

async function createSalon(data, auth) {
  const companyId = auth.role === "SUPER_ADMIN" ? data.companyId : auth.companyId;
  if (!companyId) throw new AppError(400, "companyId is required", "COMPANY_ID_REQUIRED");
  assertCompanyScope(auth, companyId);
  await ensureCompany(companyId);
  try {
    const salon = await prisma.salon.create({
      data: { companyId, name: data.name, code: data.code, email: data.email ?? null, phone: data.phone ?? null, address: data.address ?? null, timezone: data.timezone },
      select: salonSelect
    });
    await prisma.activityLog.create({ data: { userId: auth.userId, action: "SALON_CREATED", metadata: { salonId: salon.id, companyId } } });
    return salon;
  } catch (e) {
    if (e.code === "P2002") throw new AppError(409, "A salon with this code already exists in the company", "SALON_CODE_EXISTS");
    throw e;
  }
}

async function listSalons(auth, { page, limit, search, isActive, companyId }) {
  const where = {};
  if (auth.role === "SUPER_ADMIN") {
    if (companyId) where.companyId = companyId;
  } else if (auth.role === "COMPANY_ADMIN") {
    if (!auth.companyId) throw new AppError(403, "Company scope is required", "TENANT_SCOPE_REQUIRED");
    where.companyId = auth.companyId;
  } else {
    if (!auth.salonId) throw new AppError(403, "Salon scope is required", "TENANT_SCOPE_REQUIRED");
    where.id = auth.salonId;
  }
  if (search) where.OR = [
    { name: { contains: search, mode: "insensitive" } },
    { code: { contains: search, mode: "insensitive" } }
  ];
  if (typeof isActive === "boolean") where.isActive = isActive;
  const [items, total] = await prisma.$transaction([
    prisma.salon.findMany({ where, select: salonSelect, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
    prisma.salon.count({ where })
  ]);
  return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

async function getSalon(salonId, auth) {
  const where = { id: salonId };
  if (auth.role !== "SUPER_ADMIN") {
    if (auth.role === "COMPANY_ADMIN") where.companyId = auth.companyId;
    else where.id = auth.salonId;
  }
  const salon = await prisma.salon.findFirst({ where, select: salonSelect });
  if (!salon) throw new AppError(404, "Salon not found", "SALON_NOT_FOUND");
  return salon;
}

async function updateSalon(salonId, data, auth) {
  const current = await getSalon(salonId, auth);
  if (auth.role !== "SUPER_ADMIN" && auth.role !== "COMPANY_ADMIN") {
    throw new AppError(403, "Only Super Admin or Company Admin can update salon details", "FORBIDDEN");
  }
  try {
    const salon = await prisma.salon.update({ where: { id: current.id }, data, select: salonSelect });
    await prisma.activityLog.create({ data: { userId: auth.userId, action: "SALON_UPDATED", metadata: { salonId } } });
    return salon;
  } catch (e) {
    if (e.code === "P2002") throw new AppError(409, "A salon with this code already exists in the company", "SALON_CODE_EXISTS");
    throw e;
  }
}

async function setSalonStatus(salonId, isActive, auth) {
  const current = await getSalon(salonId, auth);
  if (auth.role !== "SUPER_ADMIN" && auth.role !== "COMPANY_ADMIN") {
    throw new AppError(403, "Only Super Admin or Company Admin can change salon status", "FORBIDDEN");
  }
  const salon = await prisma.salon.update({ where: { id: current.id }, data: { isActive }, select: salonSelect });
  await prisma.activityLog.create({ data: { userId: auth.userId, action: isActive ? "SALON_ACTIVATED" : "SALON_DEACTIVATED", metadata: { salonId } } });
  return salon;
}

async function salonDropdown(auth, { companyId, search }) {
  const where = {
    isActive: true
  };

  if (auth.role === "SUPER_ADMIN") {
    if (companyId) where.companyId = companyId;
  } else if (auth.role === "COMPANY_ADMIN") {
    if (!auth.companyId) {
      throw new AppError(
        403,
        "Company scope is required",
        "TENANT_SCOPE_REQUIRED"
      );
    }

    where.companyId = auth.companyId;
  } else {
    if (!auth.salonId) {
      throw new AppError(
        403,
        "Salon scope is required",
        "TENANT_SCOPE_REQUIRED"
      );
    }

    where.id = auth.salonId;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } }
    ];
  }

  return prisma.salon.findMany({
    where,
    select: {
      id: true,
      name: true,
      code: true,
      companyId: true
    },
    orderBy: {
      name: "asc"
    }
  });
}

module.exports = { createSalon, listSalons, getSalon, updateSalon, setSalonStatus, salonDropdown };
