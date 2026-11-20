function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    companyId: user.companyId,
    salonId: user.salonId,
    isActive: user.isActive,
    createdAt: user.createdAt
  };
}

module.exports = { publicUser };
