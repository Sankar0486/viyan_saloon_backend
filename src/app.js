const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const { loadEnv } = require("./config/env");
const apiRoutes = require("./routes");
const { notFound, errorHandler } = require("./middleware/error.middleware");

const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "Premium Salon OS API",
    version: "2.0.0",
    description: "V2 authentication, company, salon and user management APIs"
  },
  servers: [{ url: "/api/v1" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
          error: {
            type: "object",
            properties: {
              code: { type: "string" },
              details: { nullable: true }
            }
          }
        }
      }
    }
  },
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: { "200": { description: "API is running" } }
      }
    },
    "/auth/login": {
      post: {
        summary: "Login",
        requestBody: {
          required: true,
          content: { "application/json": { schema: {
            type: "object", required: ["email", "password"],
            properties: { email: { type: "string", format: "email" }, password: { type: "string" } }
          } } }
        },
        responses: { "200": { description: "Authenticated" }, "401": { description: "Invalid credentials" } }
      }
    },
    "/auth/refresh": {
      post: {
        summary: "Rotate refresh token",
        requestBody: { required: true, content: { "application/json": { schema: {
          type: "object", required: ["refreshToken"],
          properties: { refreshToken: { type: "string" } }
        } } } },
        responses: { "200": { description: "Token rotated" }, "401": { description: "Invalid refresh token" } }
      }
    },
    "/auth/logout": {
      post: {
        summary: "Revoke refresh token",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Logged out" } }
      }
    },
    "/auth/me": {
      get: {
        summary: "Get current user",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Current user" }, "401": { description: "Unauthenticated" } }
      }
    },
    "/auth/change-password": {
      post: {
        summary: "Change password and revoke sessions",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Password changed" } }
      }
    },

    "/companies": {
      get: { summary: "List companies (Super Admin)", security: [{ bearerAuth: [] }], responses: { "200": { description: "Company list" }, "403": { description: "Forbidden" } } },
      post: { summary: "Create company (Super Admin)", security: [{ bearerAuth: [] }], responses: { "201": { description: "Company created" }, "409": { description: "Duplicate company code" } } }
    },
    "/companies/{companyId}": {
      get: { summary: "Get company", security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "companyId", required: true, schema: { type: "string", format: "uuid" } }], responses: { "200": { description: "Company details" }, "404": { description: "Not found" } } },
      patch: { summary: "Update company", security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "companyId", required: true, schema: { type: "string", format: "uuid" } }], responses: { "200": { description: "Company updated" } } }
    },
    "/companies/{companyId}/status": {
      patch: { summary: "Activate or deactivate company", security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "companyId", required: true, schema: { type: "string", format: "uuid" } }], responses: { "200": { description: "Company status updated" } } }
    },
    "/salons": {
      get: { summary: "List salons in the caller's permitted scope", security: [{ bearerAuth: [] }], responses: { "200": { description: "Salon list" }, "403": { description: "Forbidden" } } },
      post: { summary: "Create salon (Super Admin or Company Admin)", security: [{ bearerAuth: [] }], responses: { "201": { description: "Salon created" }, "409": { description: "Duplicate salon code" } } }
    },
    "/salons/{salonId}": {
      get: { summary: "Get a salon in the caller's permitted scope", security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "salonId", required: true, schema: { type: "string", format: "uuid" } }], responses: { "200": { description: "Salon details" }, "404": { description: "Not found in permitted scope" } } },
      patch: { summary: "Update salon (Super Admin or owning Company Admin)", security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "salonId", required: true, schema: { type: "string", format: "uuid" } }], responses: { "200": { description: "Salon updated" } } }
    },
    "/salons/{salonId}/status": {
      patch: { summary: "Activate or deactivate salon", security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "salonId", required: true, schema: { type: "string", format: "uuid" } }], responses: { "200": { description: "Salon status updated" } } }
    },
    "/users/company-admins": {
      post: { summary: "Create Company Admin (Super Admin)", security: [{ bearerAuth: [] }], responses: { "201": { description: "Company Admin created" } } }
    },
    "/users/salon-owners": {
      post: { summary: "Create Salon Owner", security: [{ bearerAuth: [] }], responses: { "201": { description: "Salon Owner created" } } }
    },
    "/users/managers": {
      post: { summary: "Create Salon Manager", security: [{ bearerAuth: [] }], responses: { "201": { description: "Manager created" } } }
    },
    "/users/staff": {
      post: { summary: "Create Salon Staff", security: [{ bearerAuth: [] }], responses: { "201": { description: "Staff created" } } }
    },
    "/users": {
      get: { summary: "List users in the caller's permitted scope", security: [{ bearerAuth: [] }], responses: { "200": { description: "User list" } } }
    },
    "/users/{userId}": {
      get: { summary: "Get a user in the caller's permitted scope", security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "userId", required: true, schema: { type: "string", format: "uuid" } }], responses: { "200": { description: "User details" } } },
      patch: { summary: "Update user profile fields", security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "userId", required: true, schema: { type: "string", format: "uuid" } }], responses: { "200": { description: "User updated" } } }
    },
    "/users/{userId}/status": {
      patch: { summary: "Activate or deactivate a user", security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "userId", required: true, schema: { type: "string", format: "uuid" } }], responses: { "200": { description: "User status updated" } } }
    },
    "/tenancy/salons/{salonId}/access-check": {
      get: {
        summary: "Verify access to a salon (foundation example)",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "salonId", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Access verified" }, "403": { description: "Tenant access denied" } }
      }
    }
  }
};

function createApp() {
  const env = loadEnv();
  const app = express();

  if (env.TRUST_PROXY === "1") app.set("trust proxy", 1);

  app.disable("x-powered-by");
  app.use(helmet());
  const origins = env.CORS_ORIGINS.split(",").map((x) => x.trim()).filter(Boolean);
  app.use(cors({
    origin(origin, callback) {
      if (!origin || origins.includes("*") || origins.includes(origin)) return callback(null, true);
      return callback(new Error("Origin is not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false
  }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));

  app.get("/health", (req, res) => {
    res.status(200).json({ success: true, message: "Premium Salon OS API is healthy", data: { status: "ok" } });
  });
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use("/api/v1", apiRoutes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
