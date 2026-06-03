require("dotenv").config();
const Redis = require("ioredis");

async function seedRedis() {
  const redis = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
  });

  // Clear existing demo carts
  const keysToDelete = await redis.keys("cart:demo-*");
  if (keysToDelete.length) await redis.del(...keysToDelete);

  // cart:demo-1 — alice's cart
  await redis.hset("cart:demo-1", {
    "prod-101": "1",
    "prod-102": "3",
  });

  // cart:demo-2 — bob's cart
  await redis.hset("cart:demo-2", {
    "prod-103": "2",
  });

  console.log("Redis seed complete: 2 demo carts (cart:demo-1, cart:demo-2)");
  await redis.quit();
}

if (require.main === module) {
  seedRedis().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = seedRedis;
