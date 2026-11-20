require("dotenv").config();

const { loadEnv } = require("./src/config/env");
const { createApp } = require("./src/app");
const { prisma } = require("./src/config/database");

async function startServer() {
  const env = loadEnv();
  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(`Premium Salon OS API running on http://localhost:${env.PORT}`);
    console.log(`API base: http://localhost:${env.PORT}/api/v1`);
    console.log(`Swagger docs: http://localhost:${env.PORT}/api-docs`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down...`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

if (require.main === module) {
  startServer().catch(async (error) => {
    console.error("Unable to start server:", error.message);
    await prisma.$disconnect();
    process.exit(1);
  });
}

module.exports = { startServer };
