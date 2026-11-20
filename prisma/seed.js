require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const permissions = [
  ["company.read", "View company information"],
  ["company.manage", "Manage companies"],
  ["salon.read", "View salons"],
  ["salon.manage", "Manage salons"],
  ["user.read", "View users"],
  ["user.manage", "Manage users"],
  ["billing.read", "View billing (reserved for future module)"],
  ["billing.manage", "Manage billing (reserved for future module)"],
  ["reports.read", "View reports (reserved for future module)"]
];

const defaults = {
  COMPANY_ADMIN: ["company.read", "salon.read", "salon.manage", "user.read", "user.manage", "reports.read"],
  SALON_OWNER: ["salon.read", "user.read", "user.manage", "billing.read", "billing.manage", "reports.read"],
  SALON_MANAGER: ["salon.read", "user.read", "billing.read", "billing.manage", "reports.read"],
  SALON_STAFF: ["salon.read", "billing.read"]
};

async function main() {
  const map = {};
  for (const [key, description] of permissions) {
    const item = await prisma.permission.upsert({
      where: { key }, update: { description }, create: { key, description }
    });
    map[key] = item.id;
  }

  for (const [role, keys] of Object.entries(defaults)) {
    for (const key of keys) {
      await prisma.rolePermission.upsert({
        where: { role_permissionId: { role, permissionId: map[key] } },
        update: {},
        create: { role, permissionId: map[key] }
      });
    }
  }
  console.log("Permission seed completed.");
}

main().catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(async () => prisma.$disconnect());
