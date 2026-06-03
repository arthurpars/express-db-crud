require("dotenv").config();
const { execSync } = require("child_process");
const seedMongo = require("../src/seeds/mongo-seed");
const seedRedis = require("../src/seeds/redis-seed");

async function main() {
  console.log("\n=== Seeding PostgreSQL (Prisma) ===");
  execSync("npx prisma db seed", { stdio: "inherit" });

  console.log("\n=== Seeding MongoDB (Mongoose) ===");
  await seedMongo();

  console.log("\n=== Seeding Redis (ioredis) ===");
  await seedRedis();

  console.log("\nAll databases seeded successfully.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
