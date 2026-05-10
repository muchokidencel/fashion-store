const asyncHandler = require("express-async-handler");
const Order        = require("../models/Order");
const { stkPush, stkQuery } = require("../config/mpesa");

// ── @desc    Initiate M-Pesa STK Push
// ── @route   POST /api/payments/mpesa/stk
// ── @access  Private
const initiateMpesa = asyncHandler(async (req, res) => {
  const { orderId, phone } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Make sure the order belongs to this user
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  if (order.isPaid) {
    res.status(400);
    throw new Error("Order is already paid");
  }

  try {
    const result = await stkPush({
      phone,
      amount:  order.totalPrice,
      orderId: order._id,
    });

    res.json({
      message:          "STK Push sent. Enter your M-Pesa PIN to complete payment.",
      checkoutRequestId: result.CheckoutRequestID,
      merchantRequestId: result.MerchantRequestID,
    });
  } catch (error) {
    console.error("M-Pesa STK Push error:", error.response?.data || error.message);
    res.status(500);
    throw new Error("M-Pesa payment initiation failed. Please try again.");
  }
});

// ── @desc    M-Pesa callback (called by Safaricom)
// ── @route   POST /api/payments/mpesa/callback
// ── @access  Public (Safaricom server)
const mpesaCallback = asyncHandler(async (req, res) => {
  const body = req.body?.Body?.stkCallback;

  if (!body) {
    return res.json({ message: "Invalid callback" });
  }

  const { ResultCode, ResultDesc, CallbackMetadata, CheckoutRequestID } = body;

  // Find the order by searching payment reference
  // In production you would store CheckoutRequestID on the order
  if (ResultCode === 0) {
    // Payment successful
    const meta = CallbackMetadata?.Item || [];
    const getValue = (name) => meta.find((i) => i.Name === name)?.Value;

    const mpesaCode = getValue("MpesaReceiptNumber");
    const amount    = getValue("Amount");
    const phone     = getValue("PhoneNumber");

    console.log(`M-Pesa payment received: ${mpesaCode} — Ksh ${amount} from ${phone}`);

    // Find and update the order
    // (In production, store CheckoutRequestID on order to look it up here)
    res.json({ ResultCode: 0, ResultDesc: "Success" });
  } else {
    console.log(`M-Pesa payment failed: ${ResultDesc}`);
    res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
});

// ── @desc    Query STK Push status
// ── @route   POST /api/payments/mpesa/query
// ── @access  Private
const queryMpesa = asyncHandler(async (req, res) => {
  const { checkoutRequestId, orderId } = req.body;

  try {
    const result = await stkQuery(checkoutRequestId);

    // If payment was successful, mark order as paid
    if (result.ResultCode === "0" || result.ResultCode === 0) {
      const order = await Order.findById(orderId);
      if (order && !order.isPaid) {
        order.isPaid        = true;
        order.paidAt        = Date.now();
        order.status        = "processing";
        order.paymentResult = {
          id:        checkoutRequestId,
          status:    "COMPLETED",
          updateTime: new Date().toISOString(),
          reference: result.MpesaReceiptNumber || checkoutRequestId,
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

// ── @desc    Manual payment confirmation (for Cash on Delivery - admin)
// ── @route   PUT /api/payments/confirm/:orderId
// ── @access  Private/Admin
const confirmPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.isPaid        = true;
  order.paidAt        = Date.now();
  order.status        = "processing";
  order.paymentResult = {
    id:        `MANUAL-${Date.now()}`,
    status:    "CONFIRMED",
    updateTime: new Date().toISOString(),
    reference: req.body.reference || "Manual confirmation",
  };

  const updated = await order.save();
  res.json(updated);
});

module.exports = { initiateMpesa, mpesaCallback, queryMpesa, confirmPayment };