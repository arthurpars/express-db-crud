const Product = require("../../models/mongo/Product");

exports.getAll = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ error: "Invalid ID format" });
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, price, stock, category } = req.body;
    if (!name || price == null) return res.status(400).json({ error: "name and price are required" });
    const product = await Product.create({ name, price, stock, category });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, price, stock, category } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(price != null && { price }),
        ...(stock != null && { stock }),
        ...(category && { category }),
      },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ error: "Invalid ID format" });
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ error: "Invalid ID format" });
    res.status(500).json({ error: err.message });
  }
};
