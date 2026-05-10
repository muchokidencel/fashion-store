const asyncHandler = require("express-async-handler");
const Product      = require("../models/Product");

// ── @desc    Get all products (with filters)
// ── @route   GET /api/products
// ── @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 12;
  const page     = Number(req.query.page)     || 1;

  const keyword  = req.query.keyword
    ? { name: { $regex: req.query.keyword, $options: "i" } }
    : {};
  const category = req.query.category ? { category: req.query.category } : {};
  const minPrice = req.query.minPrice  ? { price: { $gte: Number(req.query.minPrice) } } : {};
  const maxPrice = req.query.maxPrice  ? { price: { $lte: Number(req.query.maxPrice) } } : {};

  const filter = {
    isPublished: true,
    ...keyword,
    ...category,
    ...minPrice,
    ...maxPrice,
  };

  const count    = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// ── @desc    Get featured products
// ── @route   GET /api/products/featured
// ── @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isPublished: true }).limit(8);
  res.json(products);
});

// ── @desc    Get single product
// ── @route   GET /api/products/:id
// ── @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(product);
});

// ── @desc    Create product (admin)
// ── @route   POST /api/products
// ── @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name, description, price, discountPrice,
    category, subCategory, brand,
    images, sizes, colors, tags,
    isFeatured, isPublished,
  } = req.body;

  const product = await Product.create({
    name, description, price,
    discountPrice: discountPrice || 0,
    category, subCategory, brand,
    images:  images  || [],
    sizes:   sizes   || [],
    colors:  colors  || [],
    tags:    tags    || [],
    isFeatured:  isFeatured  || false,
    isPublished: isPublished !== undefined ? isPublished : true,
  });

  res.status(201).json(product);
});

// ── @desc    Update product (admin)
// ── @route   PUT /api/products/:id
// ── @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  Object.assign(product, req.body);
  const updated = await product.save();
  res.json(updated);
});

// ── @desc    Delete product (admin)
// ── @route   DELETE /api/products/:id
// ── @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  await product.deleteOne();
  res.json({ message: "Product deleted" });
});

// ── @desc    Create product review
// ── @route   POST /api/products/:id/reviews
// ── @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) {
    res.status(400);
    throw new Error("You have already reviewed this product");
  }

  product.reviews.push({
    user:    req.user._id,
    name:    req.user.name,
    rating:  Number(rating),
    comment,
  });

  product.updateRating();
  await product.save();
  res.status(201).json({ message: "Review added" });
});

module.exports = {
  getProducts, getFeaturedProducts, getProductById,
  createProduct, updateProduct, deleteProduct, createReview,
};