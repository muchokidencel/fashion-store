const asyncHandler = require("express-async-handler");
const Order        = require("../models/Order");
const Product      = require("../models/Product");

// ── @desc    Create new order
// ── @route   POST /api/orders
// ── @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems, shippingAddress,
    paymentMethod, itemsPrice,
    shippingPrice, taxPrice, totalPrice,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  });

  res.status(201).json(order);
});

// ── @desc    Get logged in user orders
// ── @route   GET /api/orders/myorders
// ── @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// ── @desc    Get order by ID
// ── @route   GET /api/orders/:id
// ── @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  // Allow only the order owner or admin
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to view this order");
  }
  res.json(order);
});

// ── @desc    Update order to paid
// ── @route   PUT /api/orders/:id/pay
// ── @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.isPaid          = true;
  order.paidAt          = Date.now();
  order.status          = "processing";
  order.paymentResult   = {
    id:         req.body.id,
    status:     req.body.status,
    updateTime: req.body.update_time,
    reference:  req.body.reference,
  };

  const updated = await order.save();
  res.json(updated);
});

// ── @desc    Get all orders (admin)
// ── @route   GET /api/orders
// ── @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const page     = Number(req.query.page)     || 1;
  const pageSize = Number(req.query.pageSize) || 20;

  const count  = await Order.countDocuments();
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ orders, page, pages: Math.ceil(count / pageSize), total: count });
});

// ── @desc    Update order status (admin)
// ── @route   PUT /api/orders/:id/status
// ── @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.status = req.body.status;
  if (req.body.status === "delivered") {
    order.isDelivered  = true;
    order.deliveredAt  = Date.now();
  }
  if (req.body.trackingNumber) order.trackingNumber = req.body.trackingNumber;

  const updated = await order.save();
  res.json(updated);
});

// ── @desc    Delete order (admin)
// ── @route   DELETE /api/orders/:id
// ── @access  Private/Admin
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  await order.deleteOne();
  res.json({ message: "Order deleted" });
});

module.exports = {
  createOrder, getMyOrders, getOrderById,
  updateOrderToPaid, getAllOrders,
  updateOrderStatus, deleteOrder,
};