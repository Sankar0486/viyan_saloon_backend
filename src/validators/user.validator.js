const { z } = require("zod");

const baseUserSchema = {
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255).toLowerCase(),
  phone: z.string().trim().min(7).max(20).optional().nullable(),
  password: z.string().min(12).max(128)
    .regex(/[a-z]/, "Must include a lowercase letter")
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[0-9]/, "Must include a number")
    .regex(/[^A-Za-z0-9]/, "Must include a special character")
};

const createCompanyAdminSchema = z.object({
  ...baseUserSchema,
  companyId: z.string().uuid()
}).strict();

const createSalonUserSchema = z.object({
  ...baseUserSchema,
  companyId: z.string().uuid().optional(),
  salonId: z.string().uuid()
}).strict();

const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().email().max(255).toLowerCase().optional(),
  phone: z.string().trim().min(7).max(20).optional().nullable()
}).strict().refine(v => Object.keys(v).length > 0, "At least one field is required");

const statusSchema = z.object({ isActive: z.boolean() }).strict();
const userIdParamSchema = z.object({ userId: z.string().uuid() });
module.exports = {
  createCompanyAdminSchema, createSalonUserSchema,
  updateUserSchema, statusSchema, userIdParamSchema
};
