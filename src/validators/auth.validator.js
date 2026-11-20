const { z } = require("zod");

const loginSchema = z.object({
  email: z.string().email().max(255).transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1).max(128)
}).strict();

const refreshSchema = z.object({
  refreshToken: z.string().min(40).max(256)
}).strict();

const logoutSchema = z.object({
  refreshToken: z.string().min(40).max(256)
}).strict();

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(12).max(128)
    .regex(/[a-z]/, "Must include a lowercase letter")
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[0-9]/, "Must include a number")
    .regex(/[^A-Za-z0-9]/, "Must include a special character")
}).strict();

module.exports = { loginSchema, refreshSchema, logoutSchema, changePasswordSchema };
