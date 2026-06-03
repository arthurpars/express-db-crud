const { Router } = require("express");
const User = require("../../models/mongo/User");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    if (err.name === "CastError")
      return res.status(400).json({ error: "Invalid ID format" });
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email)
      return res.status(400).json({ error: "name and email are required" });
    const user = await User.create({ name, email });
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ error: "Email already exists" });
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...(name && { name }), ...(email && { email }) },
      { new: true, runValidators: true },
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    if (err.name === "CastError")
      return res.status(400).json({ error: "Invalid ID format" });
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    if (err.name === "CastError")
      return res.status(400).json({ error: "Invalid ID format" });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
