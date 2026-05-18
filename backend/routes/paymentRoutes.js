const express = require("express");
const router  = express.Router();
const {
  verifyPaystack, paystackWebhook,
  initiateMpesa, mpesaCallback,
  queryMpesa, confirmPayment,
} = require("../controllers/paymentController");
const { protect, admin } = require("../middleware/authMiddleware");

// Paystack
router.post("/paystack/verify",  protect, verifyPaystack);
router.post("/paystack/webhook", paystackWebhook);  // Public — called by Paystack

// M-Pesa
router.post("/mpesa/stk",        protect, initiateMpesa);
router.post("/mpesa/callback",   mpesaCallback);    // Public — called by Safaricom
router.post("/mpesa/query",      protect, queryMpesa);

// Manual (admin)
router.put("/confirm/:orderId",  protect, admin, confirmPayment);

module.exports = router;