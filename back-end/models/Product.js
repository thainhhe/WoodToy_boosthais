import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a product name"],
    trim: true,
    maxlength: [200, "Product name cannot exceed 200 characters"],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, "Description cannot exceed 2000 characters"],
  },
  story: {
    type: String,
    trim: true,
    maxlength: [5000, "Story cannot exceed 5000 characters"],
  },
  price: {
    type: Number,
    required: [true, "Please provide a product price"],
    min: [0, "Price cannot be negative"],
  },
  image: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
    maxlength: [100, "Category cannot exceed 100 characters"],
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, "Stock cannot be negative"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Product", productSchema);
