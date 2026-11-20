
const { z } = require("zod");

exports.createCompanySchema = z.object({
  body: z.object({
    name: z.string().min(2),
    code: z.string().min(2).max(30),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
  }),
});

exports.updateCompanySchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    code: z.string().min(2).max(30).optional(),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: "At least one field is required",
  }),
});

exports.statusSchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  }),
});

exports.idParamSchema = z.object({
  params: z.object({
    companyId: z.string().uuid(),
  }),
});
