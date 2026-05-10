const express = require("express");
const router  = express.Router();
const {
  getProducts, getFeaturedProducts, getProductById,
  createProduct, updateProduct, deleteProduct, createReview,
} = require("../controllers/productController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/",           getProducts);
router.get("/featured",   getFeaturedProducts);
router.get("/:id",        getProductById);
router.post("/",          protect, admin, createProduct);
router.put("/:id",        protect, admin, updateProduct);
router.delete("/:id",     protect, admin, deleteProduct);
router.post("/:id/reviews", protect, createReview);

module.exports = router;