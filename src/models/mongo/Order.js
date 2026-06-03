const { Schema, model } = require("mongoose");

const orderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 },
    },
  ],
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "completed", "cancelled"],
    default: "pending",
  },
  total: { type: Number, required: true, min: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = model("Order", orderSchema);
