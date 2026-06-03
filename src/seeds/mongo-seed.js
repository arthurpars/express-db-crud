require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/mongo/User");
const Product = require("../models/mongo/Product");
const Order = require("../models/mongo/Order");

async function seedMongo() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("[MongoDB] Connected for seeding");

  await Order.deleteMany();
  await User.deleteMany();
  await Product.deleteMany();

  const [alice, bob, carol] = await User.insertMany([
    { name: "Alice Martin", email: "alice@example.com" },
    { name: "Bob Chen", email: "bob@example.com" },
    { name: "Carol Smith", email: "carol@example.com" },
  ]);

  const [laptop, headphones, keyboard] = await Product.insertMany([
    {
      name: "Laptop Pro 15",
      price: 1299.99,
      stock: 50,
      category: "Electronics",
    },
    {
      name: "Noise-Cancelling Headphones",
      price: 299.99,
      stock: 120,
      category: "Electronics",
    },
    {
      name: "Mechanical Keyboard",
      price: 149.99,
      stock: 75,
      category: "Accessories",
    },
  ]);

  await Order.insertMany([
    {
      userId: alice._id,
      items: [{ productId: laptop._id, quantity: 1, price: laptop.price }],
      status: "completed",
      total: laptop.price,
    },
    {
      userId: bob._id,
      items: [
        { productId: headphones._id, quantity: 2, price: headphones.price },
        { productId: keyboard._id, quantity: 1, price: keyboard.price },
      ],
      status: "processing",
      total: headphones.price * 2 + keyboard.price,
    },
  ]);

  console.log("MongoDB seed complete: 3 users, 3 products, 2 orders");
  await mongoose.disconnect();
}

if (require.main === module) {
  seedMongo().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = seedMongo;
