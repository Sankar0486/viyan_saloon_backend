
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * ============================================================
 * PERMISSION DEFINITIONS
 * These keys must match menu.config.js exactly.
 * ============================================================
 */

const permissions = [
  // Dashboard
  ["dashboard.view", "View dashboard"],

  // Company management
  ["companies.view", "View companies"],
  ["companies.create", "Create companies"],

  // Salon management
  ["salons.view", "View salons"],
  ["salons.create", "Create salons"],

  // User management
  ["users.view", "View users"],
  ["users.create", "Create users"],

  // Subscription management
  ["subscriptions.view", "View subscription information"],

  // Feature management
  ["features.manage", "Manage platform features"],

  // Billing
  ["billing.create", "Create bills"],
  ["billing.view_history", "View billing history"],
  ["billing.refund", "Process refunds"],
  ["billing.view_dues", "View advance and due payments"],

  // Customers
  ["customers.view", "View customers"],
  ["customers.view_categories", "View customer categories"],
  ["customers.view_history", "View customer visit history"],
  ["customers.view_assigned", "View assigned customers"],

  // Marketing
  ["marketing.create", "Create WhatsApp marketing campaigns"],
  ["marketing.view_history", "View marketing campaign history"],
  ["marketing.view", "View marketing campaigns"],

  // Service reminders
  ["reminders.manage", "Manage service reminders"],
  ["reminders.view", "View service reminders"],

  // Staff management
  ["staff.view", "View staff"],
  ["staff.create", "Create staff"],
  ["staff.manage_salary", "Manage staff salaries"],
  ["staff.manage_commission", "Manage staff commissions"],
  ["staff.manage_leave", "Manage staff leaves"],
  ["staff.view_performance", "View staff performance"],

  // Attendance
  ["attendance.view", "View attendance"],
  ["attendance.view_history", "View attendance history"],
  ["attendance.configure", "Configure GPS attendance"],
  ["attendance.check_in", "Check in and check out"],

  // Services and pricing
  ["services.view", "View services"],
  ["services.create", "Create services"],
  ["services.manage_categories", "Manage service categories"],
  ["services.manage_combos", "Manage service combo offers"],

  // Reports
  ["reports.view", "View reports and analytics"],
  ["reports.view_daily", "View daily sales reports"],
  ["reports.view_monthly", "View monthly sales reports"],
  ["reports.view_staff", "View staff reports"],
  ["reports.view_services", "View service sales reports"],
  ["reports.view_own", "View own performance reports"],

  // Activity logs
  ["activity_logs.view", "View activity logs"],

  // Settings
  ["settings.view", "View settings"],

  // Appointments
  ["appointments.view_assigned", "View assigned appointments"],

  // Profile
  ["profile.view", "View own profile"]
];

/**
 * ============================================================
 * ROLE PERMISSION ASSIGNMENTS
 * These permissions control which menu items each role sees.
 * ============================================================
 */

const defaults = {
  // ----------------------------------------------------------
  // SUPER ADMIN
  // ----------------------------------------------------------
  SUPER_ADMIN: [
    "dashboard.view",

    "companies.view",
    "companies.create",

    "salons.view",
    "salons.create",

    "users.view",
    "users.create",

    "subscriptions.view",

    "features.manage",

    "reports.view",

    "activity_logs.view",

    "settings.view"
  ],

  // ----------------------------------------------------------
  // COMPANY ADMIN
  // ----------------------------------------------------------
  COMPANY_ADMIN: [
    "dashboard.view",

    "salons.view",
    "salons.create",

    "users.view",
    "users.create",

    "reports.view",

    "subscriptions.view",

    "settings.view"
  ],

  // ----------------------------------------------------------
  // SALON OWNER
  // ----------------------------------------------------------
  SALON_OWNER: [
    "dashboard.view",

    // Billing
    "billing.create",
    "billing.view_history",
    "billing.refund",
    "billing.view_dues",

    // Customers
    "customers.view",
    "customers.view_categories",
    "customers.view_history",

    // Marketing
    "marketing.create",
    "marketing.view_history",

    // Reminders
    "reminders.manage",
    "reminders.view",

    // Staff
    "staff.view",
    "staff.create",
    "staff.manage_salary",
    "staff.manage_commission",
    "staff.manage_leave",
    "staff.view_performance",

    // Attendance
    "attendance.view",
    "attendance.view_history",
    "attendance.configure",

    // Services
    "services.view",
    "services.create",
    "services.manage_categories",
    "services.manage_combos",

    // Reports
    "reports.view_daily",
    "reports.view_monthly",
    "reports.view_staff",
    "reports.view_services",

    // Subscription and settings
    "subscriptions.view",
    "settings.view"
  ],

  // ----------------------------------------------------------
  // SALON MANAGER
  // ----------------------------------------------------------
  SALON_MANAGER: [
    "dashboard.view",

    // Billing
    "billing.create",
    "billing.view_history",

    // Customers
    "customers.view",

    // Marketing
    "marketing.view",

    // Reminders
    "reminders.view",

    // Staff
    "staff.view",

    // Attendance
    "attendance.view",

    // Services
    "services.view",

    // Reports
    "reports.view"
  ],

  // ----------------------------------------------------------
  // SALON STAFF
  // ----------------------------------------------------------
  SALON_STAFF: [
    "dashboard.view",

    // Billing
    "billing.create",

    // Assigned customers
    "customers.view_assigned",

    // Assigned appointments
    "appointments.view_assigned",

    // Attendance
    "attendance.check_in",

    // Own performance
    "reports.view_own",

    // Own profile
    "profile.view"
  ]
};

/**
 * ============================================================
 * VALIDATION
 * Ensure every assigned permission is defined.
 * ============================================================
 */

function validatePermissions() {
  const definedKeys = new Set(
    permissions.map(([key]) => key)
  );

  for (const [role, rolePermissions] of Object.entries(defaults)) {
    for (const key of rolePermissions) {
      if (!definedKeys.has(key)) {
        throw new Error(
          `Undefined permission "${key}" assigned to role "${role}"`
        );
      }
    }
  }

  const uniqueKeys = new Set(permissions.map(([key]) => key));

  if (uniqueKeys.size !== permissions.length) {
    throw new Error("Duplicate permission keys found in permissions list.");
  }
}

/**
 * ============================================================
 * SEED FUNCTION
 * ============================================================
 */


async function main() {
  console.log("========================================");
  console.log("Starting role permission seed...");
  console.log("========================================");

  validatePermissions();

  await prisma.$transaction(
    async (tx) => {
      // 1. Create or update all permissions.
      const permissionMap = {};

      for (const [key, description] of permissions) {
        const permission = await tx.permission.upsert({
          where: { key },
          update: { description },
          create: {
            key,
            description
          }
        });

        permissionMap[key] = permission.id;
      }

      console.log(`Created/updated ${permissions.length} permissions.`);

      // 2. Create missing role-permission assignments.
      let assignmentCount = 0;

      for (const [role, keys] of Object.entries(defaults)) {
        for (const key of keys) {
          await tx.rolePermission.upsert({
            where: {
              role_permissionId: {
                role,
                permissionId: permissionMap[key]
              }
            },
            update: {},
            create: {
              role,
              permissionId: permissionMap[key]
            }
          });

          assignmentCount++;
        }

        console.log(`${role}: ${keys.length} permissions processed.`);
      }

      console.log("----------------------------------------");
      console.log(`Total permissions: ${permissions.length}`);
      console.log(`Total role assignments: ${assignmentCount}`);
      console.log("----------------------------------------");
    },
    {
      maxWait: 10000,
      timeout: 60000
    }
  );

  console.log("Permission seed completed successfully.");
}


main()
  .catch((error) => {
    console.error("Permission seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
