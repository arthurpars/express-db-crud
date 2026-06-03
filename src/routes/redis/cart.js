const { Router } = require("express");
const { getRedis } = require("../../db/redis");

const router = Router({ mergeParams: true });

function cartKey(userId) {
  return `cart:${userId}`;
}

// GET /redis/cart/:userId — retrieve full cart as { productId: quantity, ... }
router.get("/", async (req, res) => {
  try {
    const redis = getRedis();
    const cart = await redis.hgetall(cartKey(req.params.userId));
    res.json(cart || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /redis/cart/:userId/item — add or increment item
router.post("/item", async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || quantity == null) return res.status(400).json({ error: "productId and quantity are required" });

    const redis = getRedis();
    const qty = parseInt(quantity);
    if (qty <= 0) return res.status(400).json({ error: "quantity must be > 0" });

    await redis.hincrby(cartKey(req.params.userId), String(productId), qty);
    const cart = await redis.hgetall(cartKey(req.params.userId));
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /redis/cart/:userId/item/:productId — set exact quantity
router.put("/item/:productId", async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity == null) return res.status(400).json({ error: "quantity is required" });

    const qty = parseInt(quantity);
    if (qty <= 0) return res.status(400).json({ error: "quantity must be > 0; use DELETE to remove" });

    const redis = getRedis();
    await redis.hset(cartKey(req.params.userId), String(req.params.productId), qty);
    const cart = await redis.hgetall(cartKey(req.params.userId));
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /redis/cart/:userId/item/:productId — remove one item
router.delete("/item/:productId", async (req, res) => {
  try {
    const redis = getRedis();
    const removed = await redis.hdel(cartKey(req.params.userId), String(req.params.productId));
    if (!removed) return res.status(404).json({ error: "Item not in cart" });
    const cart = await redis.hgetall(cartKey(req.params.userId));
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /redis/cart/:userId — clear entire cart
router.delete("/", async (req, res) => {
  try {
    const redis = getRedis();
    await redis.del(cartKey(req.params.userId));
    res.json({ message: `Cart for user ${req.params.userId} cleared` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
