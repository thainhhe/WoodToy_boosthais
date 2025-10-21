import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "Product is required"],
  },
  name: {
    type: String,
    required: [true, "Product name is required"],
  },
  image: String,
  category: String,
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"],
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Quantity must be at least 1"],
  },
  subtotal: {
    type: Number,
    required: [true, "Subtotal is required"],
  },
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    orderNumber: {
      type: String,
      unique: true,
      required: [true, "Order number is required"],
    },
    items: [orderItemSchema],
    
    // Pricing
    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: [0, "Subtotal cannot be negative"],
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, "Tax cannot be negative"],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },
    total: {
      type: Number,
      required: [true, "Total is required"],
      min: [0, "Total cannot be negative"],
    },
    
    // Shipping Address
    shippingAddress: {
      fullName: {
        type: String,
        required: [true, "Full name is required"],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, "Phone number is required"],
        match: [
          /^(\+84|0)[3|5|7|8|9][0-9]{8}$/,
          "Please provide a valid Vietnamese phone number"
        ],
      },
      street: {
        type: String,
        required: [true, "Street address is required"],
        trim: true,
      },
      ward: {
        type: String,
        trim: true,
      },
      district: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      country: {
        type: String,
        default: "Vietnam",
        trim: true,
      },
    },
    
    // Payment
    paymentMethod: {
      type: String,
      enum: ["COD", "Bank Transfer", "Credit Card", "E-Wallet"],
      default: "COD",
      required: [true, "Payment method is required"],
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    paymentDate: Date,
    transactionId: String,
    
    // Order Status
    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Processing",
        "Shipping",
        "Delivered",
        "Cancelled",
        "Refunded"
      ],
      default: "Pending",
      required: [true, "Order status is required"],
    },
    
    // Status History
    statusHistory: [{
      status: String,
      note: String,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    }],
    
    // Additional Info
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    cancelReason: String,
    deliveredAt: Date,
    cancelledAt: Date,
  },
  {
    timestamps: true,
  }
);

// Generate order number before saving
orderSchema.pre("save", async function (next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments();
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    this.orderNumber = `ORD${dateStr}${String(count + 1).padStart(5, "0")}`;
  }
  next();
});

// Indexes for performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });

export default mongoose.model("Order", orderSchema);

