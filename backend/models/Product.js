const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name:    { type: String, required: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Men", "Women", "Kids", "Accessories", "Shoes"],
    },
    subCategory: {
      type: String,
      default: "",
    },
    brand: {
      type: String,
      default: "",
    },
    images: [
      {
        url:      { type: String, required: true },
        altText:  { type: String, default: "" },
      },
    ],
    sizes: [
      {
        size:     { type: String },  // XS, S, M, L, XL, XXL or shoe sizes
        stock:    { type: Number, default: 0 },
      },
    ],
    colors: [{ type: String }],
    tags:   [{ type: String }],
    reviews:     [reviewSchema],
    rating:      { type: Number, default: 0 },
    numReviews:  { type: Number, default: 0 },
    isFeatured:  { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    sku: {
      type: String,
      unique: true,
      default: () => `SKU-${Date.now()}`,
    },
  },
  { timestamps: true }
);

// Auto-calculate average rating when reviews change
productSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    this.rating =
      this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length;
    this.numReviews = this.reviews.length;
  }
};

module.exports = mongoose.model("Product", productSchema);