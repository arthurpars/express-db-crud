const { prisma } = require("../../db/prisma");

const parseId = (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return null; }
  return id;
};

exports.getAll = async (req, res) => {
  try {
    const users = await prisma.user.findMany({ include: { orders: true } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  const id = parseId(req, res); if (!id) return;
  try {
    const user = await prisma.user.findUnique({ where: { id }, include: { orders: true } });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: "name and email are required" });
    const user = await prisma.user.create({ data: { name, email } });
    res.status(201).json(user);
  } catch (err) {
    if (err.code === "P2002") return res.status(409).json({ error: "Email already exists" });
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  const id = parseId(req, res); if (!id) return;
  try {
    const { name, email } = req.body;
    const user = await prisma.user.update({
      where: { id },
      data: { ...(name && { name }), ...(email && { email }) },
    });
    res.json(user);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "User not found" });
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  const id = parseId(req, res); if (!id) return;
  try {
    await prisma.user.delete({ where: { id } });
    res.json({ message: "User deleted" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "User not found" });
    if (err.code === "P2003") return res.status(409).json({ error: "Cannot delete user with existing orders" });
    res.status(500).json({ error: err.message });
  }
};
