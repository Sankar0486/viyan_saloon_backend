
const { prisma } = require("../config/database");
const { AppError } = require("../utils/app-error");

const companySelect = {
  id: true,
  name: true,
  code: true,
  email: true,
  phone: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      salons: true,
      users: true,
    },
  },
};

function mapDbError(error) {
  if (error.code === "P2002") {
    throw new AppError(
      409,
      "Company code already exists",
      "COMPANY_CODE_EXISTS"
    );
  }
  throw error;
}

// 1. Create company
async function createCompany(data, actorId) {
  try {
    const company = await prisma.company.create({
      data,
      select: companySelect,
    });

    await prisma.activityLog.create({
      data: {
        userId: actorId,
        action: "COMPANY_CREATED",
        metadata: { companyId: company.id },
      },
    });

    return company;
  } catch (error) {
    mapDbError(error);
  }
}

// 2. Get all companies with pagination and search
async function listCompanies({
  page,
  limit,
  search,
  isActive,
}) {
  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (typeof isActive === "boolean") {
    where.isActive = isActive;
  }

  const [items, total] = await prisma.$transaction([
    prisma.company.findMany({
      where,
      select: companySelect,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.company.count({ where }),
  ]);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// 3. Get individual company details
async function getCompany(companyId) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      ...companySelect,
      salons: {
        select: {
          id: true,
          name: true,
          code: true,
          isActive: true,
        },
      },
    },
  });

  if (!company) {
    throw new AppError(
      404,
      "Company not found",
      "COMPANY_NOT_FOUND"
    );
  }

  return company;
}

// 4. Update company
async function updateCompany(companyId, data, actorId) {
  await getCompany(companyId);

  try {
    const company = await prisma.company.update({
      where: { id: companyId },
      data,
      select: companySelect,
    });

    await prisma.activityLog.create({
      data: {
        userId: actorId,
        action: "COMPANY_UPDATED",
        metadata: { companyId },
      },
    });

    return company;
  } catch (error) {
    mapDbError(error);
  }
}

// 5. Activate / Deactivate company
async function setCompanyStatus(companyId, isActive, actorId) {
  await getCompany(companyId);

  const company = await prisma.company.update({
    where: { id: companyId },
    data: { isActive },
    select: companySelect,
  });

  await prisma.activityLog.create({
    data: {
      userId: actorId,
      action: isActive
        ? "COMPANY_ACTIVATED"
        : "COMPANY_DEACTIVATED",
      metadata: { companyId },
    },
  });

  return company;
}

// 6. Dropdown - Only company ID and name
async function getCompanyDropdown() {
  return prisma.company.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      code: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

module.exports = {
  createCompany,
  listCompanies,
  getCompany,
  updateCompany,
  setCompanyStatus,
  getCompanyDropdown,
};
