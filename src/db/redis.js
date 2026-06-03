const Redis = require("ioredis");

let redisClient;

function getRedis() {
  if (!redisClient) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
      lazyConnect: true,
    });
  }
  return redisClient;
}

async function connectRedis() {
  const client = getRedis();
  await client.connect();
  console.log("[Redis] Connected via ioredis");
}

module.exports = { getRedis, connectRedis };
