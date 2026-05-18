const asyncHandler = require("express-async-handler");
const axios        = require("axios");
const Order        = require("../models/Order");
const { stkPush, stkQuery } = require("../config/mpesa");

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

// ── @desc    Verify Paystack payment
// ── @route   POST /api/payments/paystack/verify
// ── @access  Private
const verifyPaystack = asyncHandler(async (req, res) => {
  const { reference, orderId } = req.body;

  if (!reference || !orderId) {
    res.status(400);
    throw new Error("Reference and orderId are required");
  }

  // Verify with Paystack API
  try {
    const { data } = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      }
    );

    if (data.data.status === "success") {
      const order = await Order.findById(orderId);
      if (!order) {
        res.status(404);
        throw new Error("Order not found");
      }

      if (order.isPaid) {
        return res.json({ success: true, message: "Order already paid" });
      }

      // Mark order as paid
      order.isPaid        = true;
      order.paidAt        = Date.now();
      order.status        = "processing";
      order.paymentResult = {
        id:         data.data.id,
        status:     data.data.status,
        updateTime: new Date().toISOString(),
        reference:  reference,
      };

      await order.save();
      res.json({ success: true, message: "Payment verified and order updated!" });
    } else {
      res.status(400);
      throw new Error("Payment verification failed");
    }
  } catch (error) {
    if (error.response?.status === 404) {
      res.status(400);
      throw new Error("Invalid payment reference");
    }
    throw error;
  }
});

// ── @desc    Paystack webhook (called by Paystack)
// ── @route   POST /api/payments/paystack/webhook
// ── @access  Public
const paystackWebhook = asyncHandler(async (req, res) => {
  const crypto = require("crypto");
  const hash   = crypto
    .createHmac("sha512", PAYSTACK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    return res.status(401).json({ message: "Invalid signature" });
  }

  const { event, data } = req.body;

  if (event === "charge.success") {
    // Find order by reference stored in metadata
    const orderId = data.metadata?.orderId;
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && !order.isPaid) {
        order.isPaid        = true;
        order.paidAt        = Date.now();
        order.status        = "processing";
        order.paymentResult = {
          id:         data.id,
          status:     "success",
          updateTime: new Date().toISOString(),
          reference:  data.reference,
        };
        await order.save();
      }
    }
  }

  res.json({ received: true });
});

// ── @desc    Initiate M-Pesa STK Push
// ── @route   POST /api/payments/mpesa/stk
// ── @access  Private
const initiateMpesa = asyncHandler(async (req, res) => {
  const { orderId, phone } = req.body;
  const order = await Order.findById(orderId);
  if (!order) { res.status(404); throw new Error("Order not found"); }
  if (order.user.toString() !== req.user._id.toString()) { res.status(403); throw new Error("Not authorized"); }
  if (order.isPaid) { res.status(400); throw new Error("Order is already paid"); }

  try {
    const result = await stkPush({ phone, amount: order.totalPrice, orderId: order._id });
    res.json({
      message: "STK Push sent. Enter your M-Pesa PIN to complete payment.",
      checkoutRequestId: result.CheckoutRequestID,
      merchantRequestId: result.MerchantRequestID,
    });
  } catch (error) {
    res.status(500);
    throw new Error("M-Pesa payment initiation failed. Please try again.");
  }
});

// ── @desc    M-Pesa callback
// ── @route   POST /api/payments/mpesa/callback
// ── @access  Public
const mpesaCallback = asyncHandler(async (req, res) => {
  const body = req.body?.Body?.stkCallback;
  if (!body) return res.json({ message: "Invalid callback" });
  const { ResultCode, ResultDesc } = body;
  if (ResultCode === 0) {
    console.log("M-Pesa payment successful");
  } else {
    console.log(`M-Pesa payment failed: ${ResultDesc}`);
  }
  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

// ── @desc    Query M-Pesa STK status
// ── @route   POST /api/payments/mpesa/query
// ── @access  Private
const queryMpesa = asyncHandler(async (req, res) => {
  const { checkoutRequestId, orderId } = req.body;
  try {
    const result = await stkQuery(checkoutRequestId);
    if (result.ResultCode === "0" || result.ResultCode === 0) {
      const order = await Order.findById(orderId);
      if (order && !order.isPaid) {
        order.isPaid        = true;
        order.paidAt        = Date.now();
        order.status        = "processing";
        order.paymentResult = {
          id:         checkoutRequestId,
          status:     "COMPLETED",
          updateTime: new Date().toISOString(),
          reference:  result.MpesaReceiptNumber || checkoutRequestId,
        };
        await order.save();
      }
      res.json({ paid: true, message: "Payment confirmed!" });
    } else {
      res.json({ paid: false, message: result.ResultDesc || "Payment pending" });
    }
  } catch (error) {
    res.json({ paid: false, message: "Could not verify payment status." });
  }
});

// ── @desc    Manual payment confirmation (admin)
// ── @route   PUT /api/payments/confirm/:orderId
// ── @access  Private/Admin
const confirmPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) { res.status(404); throw new Error("Order not found"); }
  order.isPaid        = true;
  order.paidAt        = Date.now();
  order.status        = "processing";
  order.paymentResult = {
    id:         `MANUAL-${Date.now()}`,
    status:     "CONFIRMED",
    updateTime: new Date().toISOString(),
    reference:  req.body.reference || "Manual confirmation",
  };
  const updated = await order.save();
  res.json(updated);
});

module.exports = {
  verifyPaystack, paystackWebhook,
  initiateMpesa, mpesaCallback, queryMpesa, confirmPayment,
};