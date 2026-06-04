const Order = require("../../models/mongo/Order");

const populate = (query) =>
  query.populate("userId", "name email").populate("items.productId", "name price");

exports.getAll = async (req, res) => {
  try {
    const orders = await populate(Order.find());
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const order = await populate(Order.findById(req.params.id));
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ error: "Invalid ID format" });
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { userId, items, status } = req.body;
    if (!userId || !items?.length) return res.status(400).json({ error: "userId and items[] are required" });
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = await Order.create({ userId, items, status, total });
    res.status(201).json(order);
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ error: "Invalid ID format" });
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { items, status } = req.body;
    const update = {};
    if (items?.length) {
      update.items = items;
      update.total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
    if (status) update.status = status;
    const order = await populate(
      Order.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
    );
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ error: "Invalid ID format" });
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ message: "Order deleted" });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ error: "Invalid ID format" });
    res.status(500).json({ error: err.message });
  }
};
