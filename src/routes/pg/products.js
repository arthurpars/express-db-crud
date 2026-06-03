const { Router } = require("express");
const { prisma } = require("../../db/prisma");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, price, stock } = req.body;
    if (!name || price == null)
      return res.status(400).json({ error: "name and price are required" });
    const product = await prisma.product.create({
      data: { name, price: parseFloat(price), stock: parseInt(stock ?? 0) },
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  try {
    const { name, price, stock } = req.body;
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(price != null && { price: parseFloat(price) }),
        ...(stock != null && { stock: parseInt(stock) }),
      },
    });
    res.json(product);
  } catch (err) {
    if (err.code === "P2025")
      return res.status(404).json({ error: "Product not found" });
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  try {
    await prisma.product.delete({ where: { id } });
    res.json({ message: "Product deleted" });
  } catch (err) {
    if (err.code === "P2025")
      return res.status(404).json({ error: "Product not found" });
    if (err.code === "P2003")
      return res
        .status(409)
        .json({ error: "Cannot delete product with existing orders" });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
