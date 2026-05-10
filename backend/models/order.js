const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name:     { type: String,  required: true },
  image:    { type: String,  required: true },
  price:    { type: Number,  required: true },
  size:     { type: String,  default: "" },
  color:    { type: String,  default: "" },
  quantity: { type: Number,  required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [orderItemSchema],

    shippingAddress: {
      fullName: { type: String, required: true },
      street:   { type: String, required: true },
      city:     { type: String, required: true },
      county:   { type: String, required: true },
      country:  { type: String, default: "Kenya" },
      phone:    { type: String, required: true },
    },

    paymentMethod: {
      type: String,
      required: true,
      enum: ["mpesa", "stripe", "cash_on_delivery"],
    },

    paymentResult: {
      id:         { type: String },
      status:     { type: String },
      updateTime: { type: String },
      reference:  { type: String },
    },

    itemsPrice:    { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    taxPrice:      { type: Number, required: true, default: 0 },
    totalPrice:    { type: Number, required: true, default: 0 },

    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    isPaid:      { type: Boolean, default: false },
    paidAt:      { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },

    trackingNumber: { type: String, default: "" },
    notes:          { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);