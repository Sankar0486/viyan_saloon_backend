
const { prisma } = require("../config/database");
const menuConfig = require("../config/menu.config");

async function getUserMenus(user) {
  const rolePermissions = await prisma.rolePermission.findMany({
    where: {
      role: user.role,
    },
    select: {
      permission: {
        select: {
          key: true,
        },
      },
    },
  });

  const permissions = new Set(
    rolePermissions.map((rp) => rp.permission.key)
  );

  function filterMenus(items) {
  return items
    .map((item) => {
      // Check parent permission first
      if (
        item.permission &&
        !permissions.has(item.permission)
      ) {
        return null;
      }

      if (item.children) {
        const children = filterMenus(item.children);

        return children.length
          ? { ...item, children }
          : null;
      }

      return { ...item };
    })
    .filter(Boolean);
}

  const menus = menuConfig[user.role];

  if (!menus) {
    return [];
  }

  return filterMenus(menus);
}

module.exports = { getUserMenus };
