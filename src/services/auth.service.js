const { prisma } = require("../config/database");
const { AppError } = require("../utils/app-error");
const { verifyPassword, hashPassword } = require("../utils/password");
const {
  createAccessToken, createRefreshToken, hashRefreshToken, refreshExpiryDate
} = require("../utils/tokens");

const userSelect = {
  id: true, name: true, email: true, phone: true, role: true,
  companyId: true, salonId: true, isActive: true, createdAt: true,
  passwordHash: true,
  company: { select: { id: true, isActive: true } },
  salon: { select: { id: true, companyId: true, isActive: true } }
};

function assertTenantActive(user) {
  if (user.role === "SUPER_ADMIN") return;
  if (!user.companyId || !user.company || !user.company.isActive) {
    throw new AppError(403, "The company associated with this account is unavailable", "COMPANY_INACTIVE");
  }
  if (user.role === "COMPANY_ADMIN") {
    if (user.salonId !== null) throw new AppError(403, "Company Admin account has an invalid salon assignment", "INVALID_TENANT_ASSIGNMENT");
    return;
  }
  if (!user.salonId || !user.salon || !user.salon.isActive || user.salon.companyId !== user.companyId) {
    throw new AppError(403, "The salon associated with this account is unavailable", "SALON_INACTIVE");
  }
}

async function recordActivity(tx, userId, action, metadata = {}) {
  await tx.activityLog.create({
    data: { userId, action, metadata }
  });
}

async function issueSession(user) {
  const refreshToken = createRefreshToken();
  const accessToken = createAccessToken(user);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: refreshExpiryDate()
    }
  });

  return { accessToken, refreshToken };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email }, select: userSelect });

  // Same response for unknown email and incorrect password.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }
  if (!user.isActive) {
    throw new AppError(403, "This account has been deactivated", "ACCOUNT_DEACTIVATED");
  }
  assertTenantActive(user);

  const tokens = await issueSession(user);
  await prisma.activityLog.create({
    data: { userId: user.id, action: "AUTH_LOGIN", metadata: { method: "password" } }
  });

  const { passwordHash, company, salon, ...safeUser } = user;
  return { user: safeUser, ...tokens };
}

async function refreshSession(rawToken) {
  const tokenHash = hashRefreshToken(rawToken);
  const existing = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: { select: userSelect } }
  });

  if (!existing || existing.revokedAt || existing.expiresAt <= new Date() || !existing.user.isActive) {
    if (existing && !existing.revokedAt) {
      await prisma.refreshToken.update({ where: { id: existing.id }, data: { revokedAt: new Date() } });
    }
    throw new AppError(401, "Refresh token is invalid, expired or revoked", "REFRESH_TOKEN_INVALID");
  }

  try {
    assertTenantActive(existing.user);
  } catch (error) {
    await prisma.refreshToken.updateMany({
      where: { userId: existing.userId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
    throw error;
  }

  const newRawToken = createRefreshToken();
  const newHash = hashRefreshToken(newRawToken);
  const newExpiresAt = refreshExpiryDate();

  await prisma.$transaction(async (tx) => {
    const consumed = await tx.refreshToken.updateMany({
      where: { id: existing.id, revokedAt: null, expiresAt: { gt: new Date() } },
      data: { revokedAt: new Date(), replacedByTokenHash: newHash }
    });
    if (consumed.count !== 1) {
      throw new AppError(401, "Refresh token has already been used", "REFRESH_TOKEN_REUSED");
    }
    await tx.refreshToken.create({
      data: { userId: existing.userId, tokenHash: newHash, expiresAt: newExpiresAt }
    });
    await tx.activityLog.create({
      data: { userId: existing.userId, action: "AUTH_REFRESH", metadata: {} }
    });
  });

  const { passwordHash, company, salon, ...safeUser } = existing.user;
  return {
    user: safeUser,
    accessToken: createAccessToken(existing.user),
    refreshToken: newRawToken
  };
}

async function logout(userId, rawToken) {
  const tokenHash = hashRefreshToken(rawToken);
  await prisma.$transaction(async (tx) => {
    await tx.refreshToken.updateMany({
      where: { userId, tokenHash, revokedAt: null },
      data: { revokedAt: new Date() }
    });
    await recordActivity(tx, userId, "AUTH_LOGOUT", {});
  });
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) throw new AppError(404, "User not found", "USER_NOT_FOUND");

  const matches = await verifyPassword(currentPassword, user.passwordHash);
  if (!matches) throw new AppError(400, "Current password is incorrect", "CURRENT_PASSWORD_INVALID");

  const passwordHash = await hashPassword(newPassword);
  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { passwordHash } });
    await tx.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
    await recordActivity(tx, userId, "AUTH_PASSWORD_CHANGED", {});
  });
}

module.exports = { login, refreshSession, logout, changePassword };
