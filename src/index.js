require("dotenv").config();
const express = require("express");
const { connectPrisma } = require("./db/prisma");
const { connectMongo } = require("./db/mongoose");
const { connectRedis } = require("./db/redis");

const pgUsersRouter = require("./routes/pg/users");
const pgProductsRouter = require("./routes/pg/products");
const pgOrdersRouter = require("./routes/pg/orders");

const mongoUsersRouter = require("./routes/mongo/users");
const mongoProductsRouter = require("./routes/mongo/products");
const mongoOrdersRouter = require("./routes/mongo/orders");

const redisCartRouter = require("./routes/redis/cart");

const app = express();
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/pg/users", pgUsersRouter);
app.use("/pg/products", pgProductsRouter);
app.use("/pg/orders", pgOrdersRouter);

app.use("/mongo/users", mongoUsersRouter);
app.use("/mongo/products", mongoProductsRouter);
app.use("/mongo/orders", mongoOrdersRouter);

app.use("/redis/cart/:userId", redisCartRouter);

app.use((req, res) => res.status(404).json({ error: "Route not found" }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

async function start() {
  const results = await Promise.allSettled([
    connectPrisma(),
    connectMongo(),
    connectRedis(),
  ]);

  results.forEach((r, i) => {
    const label = ["PostgreSQL", "MongoDB", "Redis"][i];
    if (r.status === "rejected")
      console.error(`[${label}] Connection FAILED:`, r.reason.message);
  });

  const port = parseInt(process.env.PORT || "3000");
  app.listen(port, () =>
    console.log(`Server running on http://localhost:${port}`),
  );
}

start();
