
const menuConfig = {
  SUPER_ADMIN: [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: "layout-dashboard",
      path: "/dashboard",
      permission: "dashboard.view",
    },
    {
      id: "companies",
      title: "Company Management",
      icon: "building-2",
      children: [
        {
          id: "company-list",
          title: "All Companies",
          path: "/companies",
          permission: "companies.view",
        },
        {
          id: "company-create",
          title: "Create Company",
          path: "/companies/create",
          permission: "companies.create",
        },
      ],
    },
    {
      id: "salons",
      title: "Salon Management",
      icon: "store",
      children: [
        {
          id: "salon-list",
          title: "All Salons",
          path: "/salons",
          permission: "salons.view",
        },
        {
          id: "salon-create",
          title: "Create Salon",
          path: "/salons/create",
          permission: "salons.create",
        },
      ],
    },
    {
      id: "users",
      title: "User Management",
      icon: "users",
      children: [
        {
          id: "all-users",
          title: "All Users",
          path: "/users",
          permission: "users.view",
        },
        {
          id: "create-user",
          title: "Create User",
          path: "/users/create",
          permission: "users.create",
        },
      ],
    },
    {
      id: "subscriptions",
      title: "Subscription Management",
      icon: "credit-card",
      children: [
        {
          id: "subscription-plans",
          title: "Subscription Plans",
          path: "/subscriptions/plans",
          permission: "subscriptions.view",
        },
        {
          id: "salon-subscriptions",
          title: "Salon Subscriptions",
          path: "/subscriptions/salons",
          permission: "subscriptions.view",
        },
        {
          id: "subscription-payments",
          title: "Payments",
          path: "/subscriptions/payments",
          permission: "subscriptions.view",
        },
      ],
    },
    {
      id: "features",
      title: "Feature Management",
      icon: "layers",
      path: "/features",
      permission: "features.manage",
    },
    {
      id: "reports",
      title: "Reports & Analytics",
      icon: "chart-no-axes-combined",
      children: [
        {
          id: "platform-revenue",
          title: "Platform Revenue",
          path: "/reports/revenue",
          permission: "reports.view",
        },
        {
          id: "salon-reports",
          title: "Salon Reports",
          path: "/reports/salons",
          permission: "reports.view",
        },
      ],
    },
    {
      id: "activity-logs",
      title: "Activity Logs",
      icon: "history",
      path: "/activity-logs",
      permission: "activity_logs.view",
    },
    {
      id: "settings",
      title: "Settings",
      icon: "settings",
      path: "/settings",
      permission: "settings.view",
    },
  ],

  COMPANY_ADMIN: [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: "layout-dashboard",
      path: "/dashboard",
      permission: "dashboard.view",
    },
    {
      id: "salons",
      title: "Salon Management",
      icon: "store",
      children: [
        {
          id: "salon-list",
          title: "All Salons",
          path: "/salons",
          permission: "salons.view",
        },
        {
          id: "salon-create",
          title: "Create Salon",
          path: "/salons/create",
          permission: "salons.create",
        },
      ],
    },
    {
      id: "users",
      title: "User Management",
      icon: "users",
      children: [
        {
          id: "user-list",
          title: "All Users",
          path: "/users",
          permission: "users.view",
        },
        {
          id: "user-create",
          title: "Create User",
          path: "/users/create",
          permission: "users.create",
        },
      ],
    },
    {
      id: "reports",
      title: "Reports & Analytics",
      icon: "chart-no-axes-combined",
      path: "/reports",
      permission: "reports.view",
    },
    {
      id: "subscriptions",
      title: "Subscription",
      icon: "credit-card",
      path: "/subscription",
      permission: "subscriptions.view",
    },
    {
      id: "settings",
      title: "Company Settings",
      icon: "settings",
      path: "/settings",
      permission: "settings.view",
    },
  ],

  SALON_OWNER: [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: "layout-dashboard",
      path: "/dashboard",
      permission: "dashboard.view",
    },
    {
      id: "billing",
      title: "Billing",
      icon: "receipt",
      children: [
        {
          id: "quick-billing",
          title: "Quick Billing",
          path: "/billing/new",
          permission: "billing.create",
        },
        {
          id: "bill-history",
          title: "Bill History",
          path: "/billing/history",
          permission: "billing.view_history",
        },
        {
          id: "refunds",
          title: "Refunds",
          path: "/billing/refunds",
          permission: "billing.refund",
        },
        {
          id: "due-payments",
          title: "Advance & Due Payments",
          path: "/billing/due-payments",
          permission: "billing.view_dues",
        },
      ],
    },
    {
      id: "customers",
      title: "Customer Management",
      icon: "users",
      children: [
        {
          id: "customer-list",
          title: "All Customers",
          path: "/customers",
          permission: "customers.view",
        },
        {
          id: "customer-categories",
          title: "Customer Categories",
          path: "/customers/categories",
          permission: "customers.view_categories",
        },
        {
          id: "customer-history",
          title: "Visit History",
          path: "/customers/history",
          permission: "customers.view_history",
        },
      ],
    },
    {
      id: "marketing",
      title: "WhatsApp Marketing",
      icon: "message-circle",
      children: [
        {
          id: "campaign-create",
          title: "Create Campaign",
          path: "/marketing/create",
          permission: "marketing.create",
        },
        {
          id: "campaign-history",
          title: "Campaign History",
          path: "/marketing/history",
          permission: "marketing.view_history",
        },
      ],
    },
    {
      id: "reminders",
      title: "Service Reminders",
      icon: "bell",
      children: [
        {
          id: "reminder-settings",
          title: "Reminder Settings",
          path: "/reminders/settings",
          permission: "reminders.manage",
        },
        {
          id: "reminder-history",
          title: "Reminder History",
          path: "/reminders/history",
          permission: "reminders.view",
        },
      ],
    },
    {
      id: "staff",
      title: "Staff Management",
      icon: "users-round",
      children: [
        {
          id: "staff-list",
          title: "All Staff",
          path: "/staff",
          permission: "staff.view",
        },
        {
          id: "staff-create",
          title: "Add Staff",
          path: "/staff/create",
          permission: "staff.create",
        },
        {
          id: "staff-salary",
          title: "Salary Management",
          path: "/staff/salary",
          permission: "staff.manage_salary",
        },
        {
          id: "staff-commission",
          title: "Commission",
          path: "/staff/commission",
          permission: "staff.manage_commission",
        },
        {
          id: "staff-leaves",
          title: "Leave Management",
          path: "/staff/leaves",
          permission: "staff.manage_leave",
        },
        {
          id: "staff-performance",
          title: "Staff Performance",
          path: "/staff/performance",
          permission: "staff.view_performance",
        },
      ],
    },
    {
      id: "attendance",
      title: "GPS Attendance",
      icon: "map-pin",
      children: [
        {
          id: "attendance-live",
          title: "Live Attendance",
          path: "/attendance",
          permission: "attendance.view",
        },
        {
          id: "attendance-history",
          title: "Attendance History",
          path: "/attendance/history",
          permission: "attendance.view_history",
        },
        {
          id: "attendance-settings",
          title: "GPS Settings",
          path: "/attendance/settings",
          permission: "attendance.configure",
        },
      ],
    },
    {
      id: "services",
      title: "Services & Pricing",
      icon: "scissors",
      children: [
        {
          id: "service-list",
          title: "All Services",
          path: "/services",
          permission: "services.view",
        },
        {
          id: "service-create",
          title: "Add Service",
          path: "/services/create",
          permission: "services.create",
        },
        {
          id: "service-categories",
          title: "Categories",
          path: "/services/categories",
          permission: "services.manage_categories",
        },
        {
          id: "service-combos",
          title: "Combo Offers",
          path: "/services/combos",
          permission: "services.manage_combos",
        },
      ],
    },
    {
      id: "reports",
      title: "Reports & Analytics",
      icon: "chart-no-axes-combined",
      children: [
        {
          id: "daily-reports",
          title: "Daily Sales",
          path: "/reports/daily",
          permission: "reports.view_daily",
        },
        {
          id: "monthly-reports",
          title: "Monthly Sales",
          path: "/reports/monthly",
          permission: "reports.view_monthly",
        },
        {
          id: "staff-reports",
          title: "Staff Performance",
          path: "/reports/staff",
          permission: "reports.view_staff",
        },
        {
          id: "service-reports",
          title: "Service Sales",
          path: "/reports/services",
          permission: "reports.view_services",
        },
      ],
    },
    {
      id: "subscription",
      title: "Subscription",
      icon: "credit-card",
      path: "/subscription",
      permission: "subscriptions.view",
    },
    {
      id: "settings",
      title: "Settings",
      icon: "settings",
      path: "/settings",
      permission: "settings.view",
    },
  ],

  SALON_MANAGER: [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: "layout-dashboard",
      path: "/dashboard",
      permission: "dashboard.view",
    },
    {
      id: "billing",
      title: "Billing",
      icon: "receipt",
      children: [
        {
          id: "quick-billing",
          title: "Quick Billing",
          path: "/billing/new",
          permission: "billing.create",
        },
        {
          id: "bill-history",
          title: "Bill History",
          path: "/billing/history",
          permission: "billing.view_history",
        },
      ],
    },
    {
      id: "customers",
      title: "Customers",
      icon: "users",
      path: "/customers",
      permission: "customers.view",
    },
    {
      id: "marketing",
      title: "WhatsApp Marketing",
      icon: "message-circle",
      path: "/marketing",
      permission: "marketing.view",
    },
    {
      id: "reminders",
      title: "Service Reminders",
      icon: "bell",
      path: "/reminders",
      permission: "reminders.view",
    },
    {
      id: "staff",
      title: "Staff Management",
      icon: "users-round",
      path: "/staff",
      permission: "staff.view",
    },
    {
      id: "attendance",
      title: "Attendance",
      icon: "map-pin",
      path: "/attendance",
      permission: "attendance.view",
    },
    {
      id: "services",
      title: "Services",
      icon: "scissors",
      path: "/services",
      permission: "services.view",
    },
    {
      id: "reports",
      title: "Reports",
      icon: "chart-no-axes-combined",
      path: "/reports",
      permission: "reports.view",
    },
  ],

  SALON_STAFF: [
    {
      id: "dashboard",
      title: "My Dashboard",
      icon: "layout-dashboard",
      path: "/dashboard",
      permission: "dashboard.view",
    },
    {
      id: "my-billing",
      title: "Billing",
      icon: "receipt",
      path: "/billing",
      permission: "billing.create",
    },
    {
      id: "my-customers",
      title: "My Customers",
      icon: "users",
      path: "/my-customers",
      permission: "customers.view_assigned",
    },
    {
      id: "appointments",
      title: "My Appointments",
      icon: "calendar",
      path: "/my-appointments",
      permission: "appointments.view_assigned",
      feature: "appointments",
    },
    {
      id: "attendance",
      title: "GPS Attendance",
      icon: "map-pin",
      path: "/attendance",
      permission: "attendance.check_in",
    },
    {
      id: "performance",
      title: "My Performance",
      icon: "chart-line",
      path: "/my-performance",
      permission: "reports.view_own",
    },
    {
      id: "profile",
      title: "My Profile",
      icon: "user",
      path: "/profile",
      permission: "profile.view",
    },
  ],
};

module.exports = menuConfig;
