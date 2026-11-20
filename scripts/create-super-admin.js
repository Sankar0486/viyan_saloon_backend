require("dotenv").config();
const readline = require("node:readline/promises");
const { stdin, stdout } = require("node:process");
const { PrismaClient } = require("@prisma/client");
const { hashPassword } = require("../src/utils/password");

const prisma = new PrismaClient();

async function main() {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  try {
    const name = (await rl.question("Super Admin name: ")).trim();
    const email = (await rl.question("Super Admin email: ")).trim().toLowerCase();
    const password = await rl.question("Strong password (minimum 12 characters): ");

    if (!name || !email || password.length < 12) {
      throw new Error("Name, valid email and a password of at least 12 characters are required.");
    }
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      throw new Error("Password must contain lowercase, uppercase, number and special character.");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("A user with this email already exists.");

    const user = await prisma.user.create({
      data: {
        name, email, passwordHash: await hashPassword(password),
        role: "SUPER_ADMIN", isActive: true
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    console.log("Super Admin created:", user);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Super Admin creation failed:", error.message);
  process.exit(1);
});
