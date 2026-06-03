const { Router } = require("express");
const { prisma } = require("../../db/prisma");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { user: true, product: true },
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: true, product: true },
    });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { userId, productId, quantity, status } = req.body;
    if (!userId || !productId || !quantity)
      return res
        .status(400)
        .json({ error: "userId, productId, and quantity are required" });

    const order = await prisma.order.create({
      data: {
        userId: parseInt(userId),
        productId: parseInt(productId),
        quantity: parseInt(quantity),
        ...(status && { status }),
      },
      include: { user: true, product: true },
    });
    res.status(201).json(order);
  } catch (err) {
    if (err.code === "P2003")
      return res.status(400).json({ error: "Invalid userId or productId" });
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  try {
    const { quantity, status } = req.body;
    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(quantity != null && { quantity: parseInt(quantity) }),
        ...(status && { status }),
      },
      include: { user: true, product: true },
    });
    res.json(order);
  } catch (err) {
    if (err.code === "P2025")
      return res.status(404).json({ error: "Order not found" });
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  try {
    await prisma.order.delete({ where: { id } });
    res.json({ message: "Order deleted" });
  } catch (err) {
    if (err.code === "P2025")
      return res.status(404).json({ error: "Order not found" });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
