const { z } = require("zod");

const createSalonSchema = z.object({
  companyId: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(150),
  code: z.string().trim().min(2).max(40).regex(/^[A-Za-z0-9_-]+$/).transform(v => v.toUpperCase()),
  email: z.string().trim().email().max(255).toLowerCase().optional().nullable(),
  phone: z.string().trim().min(7).max(20).optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  timezone: z.string().trim().min(2).max(80).default("Asia/Kolkata")
}).strict();

const updateSalonSchema = z.object({
  name: z.string().trim().min(2).max(150).optional(),
  code: z.string().trim().min(2).max(40).regex(/^[A-Za-z0-9_-]+$/).transform(v => v.toUpperCase()).optional(),
  email: z.string().trim().email().max(255).toLowerCase().optional().nullable(),
  phone: z.string().trim().min(7).max(20).optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  timezone: z.string().trim().min(2).max(80).optional()
}).strict().refine(v => Object.keys(v).length > 0, "At least one field is required");

const statusSchema = z.object({ isActive: z.boolean() }).strict();
const salonIdParamSchema = z.object({ salonId: z.string().uuid() });
module.exports = { createSalonSchema, updateSalonSchema, statusSchema, salonIdParamSchema };
