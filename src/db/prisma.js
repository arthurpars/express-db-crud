const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function connectPrisma() {
  await prisma.$connect();
  console.log("[PostgreSQL] Connected via Prisma");
}

module.exports = { prisma, connectPrisma };
