const mongoose = require("mongoose");

async function connectMongo() {
  const uri = process.env.MONGO_URI;
  await mongoose.connect(uri);
  console.log("[MongoDB] Connected via Mongoose");
}

module.exports = { connectMongo };
