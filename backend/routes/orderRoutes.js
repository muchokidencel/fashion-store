const express = require("express");
const router  = express.Router();
const {
  createOrder, getMyOrders, getOrderById,
  updateOrderToPaid, getAllOrders,
  updateOrderStatus, deleteOrder,
} = require("../controllers/orderController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/",              protect, admin, getAllOrders);
router.post("/",             protect, createOrder);
router.get("/myorders",      protect, getMyOrders);
router.get("/:id",           protect, getOrderById);
router.put("/:id/pay",       protect, updateOrderToPaid);
router.put("/:id/status",    protect, admin, updateOrderStatus);
router.delete("/:id",        protect, admin, deleteOrder);

module.exports = router;