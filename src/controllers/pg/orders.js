const { prisma } = require("../../db/prisma");

const include = { user: true, product: true };

const parseId = (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return null; }
  return id;
};

exports.getAll = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({ include });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  const id = parseId(req, res); if (!id) return;
  try {
    const order = await prisma.order.findUnique({ where: { id }, include });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { userId, productId, quantity, status } = req.body;
    if (!userId || !productId || !quantity)
      return res.status(400).json({ error: "userId, productId, and quantity are required" });
    const order = await prisma.order.create({
      data: {
        userId: parseInt(userId),
        productId: parseInt(productId),
        quantity: parseInt(quantity),
        ...(status && { status }),
      },
      include,
    });
    res.status(201).json(order);
  } catch (err) {
    if (err.code === "P2003") return res.status(400).json({ error: "Invalid userId or productId" });
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  const id = parseId(req, res); if (!id) return;
  try {
    const { quantity, status } = req.body;
    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(quantity != null && { quantity: parseInt(quantity) }),
        ...(status && { status }),
      },
      include,
    });
    res.json(order);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Order not found" });
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  const id = parseId(req, res); if (!id) return;
  try {
    await prisma.order.delete({ where: { id } });
    res.json({ message: "Order deleted" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Order not found" });
    res.status(500).json({ error: err.message });
  }
};
