const { Router } = require("express");
const Order = require("../../models/mongo/Order");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("items.productId", "name price");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "name email")
      .populate("items.productId", "name price");
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    if (err.name === "CastError")
      return res.status(400).json({ error: "Invalid ID format" });
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { userId, items, status } = req.body;
    if (!userId || !items?.length)
      return res.status(400).json({ error: "userId and items[] are required" });

    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const order = await Order.create({ userId, items, status, total });
    res.status(201).json(order);
  } catch (err) {
    if (err.name === "CastError")
      return res.status(400).json({ error: "Invalid ID format" });
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { items, status } = req.body;
    const update = {};
    if (items?.length) {
      update.items = items;
      update.total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
    }
    if (status) update.status = status;

    const order = await Order.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    })
      .populate("userId", "name email")
      .populate("items.productId", "name price");
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    if (err.name === "CastError")
      return res.status(400).json({ error: "Invalid ID format" });
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ message: "Order deleted" });
  } catch (err) {
    if (err.name === "CastError")
      return res.status(400).json({ error: "Invalid ID format" });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
