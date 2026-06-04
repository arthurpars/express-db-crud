const { getRedis } = require("../../db/redis");

const cartKey = (userId) => `cart:${userId}`;

exports.getCart = async (req, res) => {
  try {
    const cart = await getRedis().hgetall(cartKey(req.params.userId));
    res.json(cart || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || quantity == null) return res.status(400).json({ error: "productId and quantity are required" });
    const qty = parseInt(quantity);
    if (qty <= 0) return res.status(400).json({ error: "quantity must be > 0" });
    const redis = getRedis();
    await redis.hincrby(cartKey(req.params.userId), String(productId), qty);
    const cart = await redis.hgetall(cartKey(req.params.userId));
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.setItem = async (req, res) => {
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
};

exports.removeItem = async (req, res) => {
  try {
    const redis = getRedis();
    const removed = await redis.hdel(cartKey(req.params.userId), String(req.params.productId));
    if (!removed) return res.status(404).json({ error: "Item not in cart" });
    const cart = await redis.hgetall(cartKey(req.params.userId));
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await getRedis().del(cartKey(req.params.userId));
    res.json({ message: `Cart for user ${req.params.userId} cleared` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
