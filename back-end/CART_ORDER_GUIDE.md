# Cart & Order System Guide

## Overview
Complete shopping cart and order management system with checkout, payment tracking, and order history.

---

## 🛒 Cart System

### Features
- ✅ Add products to cart
- ✅ Update item quantities
- ✅ Remove items from cart
- ✅ Clear entire cart
- ✅ Auto-calculate totals
- ✅ Stock validation
- ✅ Product snapshot (name, image, category)

### Cart Model
```javascript
{
  user: ObjectId (ref: User) - unique per user
  items: [
    {
      product: ObjectId (ref: Product)
      quantity: Number (min: 1)
      price: Number
      productSnapshot: {
        name, image, category
      }
    }
  ]
  totalItems: Number (auto-calculated)
  totalPrice: Number (auto-calculated)
  timestamps
}
```

### Cart API Endpoints

#### GET /api/cart
Get user's shopping cart
- **Auth**: Required
- **Response**: Cart object with populated products

#### POST /api/cart/items
Add item to cart
- **Auth**: Required
- **Body**:
  ```json
  {
    "productId": "507f1f77bcf86cd799439011",
    "quantity": 2
  }
  ```
- **Features**:
  - Creates cart if doesn't exist
  - Adds new item or increases quantity if exists
  - Validates stock availability
- **Response**: Updated cart

#### PUT /api/cart/items/:productId
Update item quantity
- **Auth**: Required
- **Body**:
  ```json
  {
    "quantity": 5
  }
  ```
- **Features**:
  - Validates stock
  - Updates price if product price changed
- **Response**: Updated cart

#### DELETE /api/cart/items/:productId
Remove item from cart
- **Auth**: Required
- **Response**: Updated cart

#### DELETE /api/cart
Clear entire cart
- **Auth**: Required
- **Response**: Empty cart

---

## 📦 Order System

### Features
- ✅ Checkout from cart
- ✅ Auto-generate order numbers (ORD20241019000001)
- ✅ Multiple payment methods (COD, Bank Transfer, Credit Card, E-Wallet)
- ✅ Order status tracking
- ✅ Payment status tracking
- ✅ Shipping address management
- ✅ Order history with pagination
- ✅ Cancel orders (Pending/Confirmed only)
- ✅ Admin order management
- ✅ Status history tracking
- ✅ Auto stock management
- ✅ Tax calculation (10%)
- ✅ Discount support

### Order Model
```javascript
{
  user: ObjectId (ref: User)
  orderNumber: String (unique, auto-generated)
  items: [
    {
      product: ObjectId
      name: String (snapshot)
      image, category, price, quantity, subtotal
    }
  ]
  
  // Pricing
  subtotal: Number
  tax: Number (10%)
  discount: Number (default: 0)
  total: Number
  
  // Shipping
  shippingAddress: {
    fullName, phone (required)
    street, ward, district, city (required)
    country (default: Vietnam)
  }
  
  // Payment
  paymentMethod: "COD" | "Bank Transfer" | "Credit Card" | "E-Wallet"
  paymentStatus: "Pending" | "Paid" | "Failed" | "Refunded"
  paymentDate, transactionId
  
  // Status
  status: "Pending" | "Confirmed" | "Processing" | 
          "Shipping" | "Delivered" | "Cancelled" | "Refunded"
  statusHistory: [{
    status, note, updatedBy, timestamp
  }]
  
  // Additional
  notes, cancelReason
  deliveredAt, cancelledAt
  timestamps
}
```

### Order API Endpoints

#### POST /api/orders (Checkout)
Create order from cart
- **Auth**: Required
- **Body**:
  ```json
  {
    "shippingAddress": {
      "fullName": "Nguyen Van A",
      "phone": "0912345678",
      "street": "123 Nguyen Hue",
      "ward": "Ben Nghe",
      "district": "District 1",
      "city": "Ho Chi Minh City",
      "country": "Vietnam"
    },
    "paymentMethod": "COD",
    "notes": "Please call before delivery",
    "discount": 50000
  }
  ```
- **Features**:
  - Validates cart not empty
  - Validates stock for all items
  - Calculates tax (10%)
  - Generates order number
  - Reduces product stock
  - Clears cart after order
  - Creates status history
- **Response**: Order object (201 Created)

#### GET /api/orders
Get user's order history
- **Auth**: Required
- **Query Params**:
  - `page` (default: 1)
  - `limit` (default: 10)
  - `status` (optional filter)
- **Response**: Paginated orders

#### GET /api/orders/:id
Get specific order
- **Auth**: Required
- **Access**: Order owner or admin
- **Response**: Order details

#### PUT /api/orders/:id/cancel
Cancel order (User)
- **Auth**: Required
- **Access**: Order owner only
- **Conditions**: Status must be "Pending" or "Confirmed"
- **Body**:
  ```json
  {
    "reason": "Changed my mind"
  }
  ```
- **Features**:
  - Restores product stock
  - Updates status to "Cancelled"
  - Adds to status history
- **Response**: Updated order

---

## 👨‍💼 Admin Order Management

### GET /api/orders/admin/all
Get all orders (Admin only)
- **Auth**: Required (Admin)
- **Query Params**:
  - `page`, `limit`
  - `status` (filter by order status)
  - `paymentStatus` (filter by payment status)
- **Response**: Paginated all orders

### PUT /api/orders/:id/status
Update order status (Admin only)
- **Auth**: Required (Admin)
- **Body**:
  ```json
  {
    "status": "Shipping",
    "note": "Order has been shipped via Express Delivery"
  }
  ```
- **Valid Statuses**:
  - Pending → Confirmed → Processing → Shipping → Delivered
  - Or: Pending → Cancelled
  - Or: Any → Refunded
- **Auto Actions**:
  - **Delivered**: Sets `deliveredAt`, marks payment as "Paid"
  - **Cancelled**: Restores stock, sets `cancelledAt`
- **Response**: Updated order with status history

### PUT /api/orders/:id/payment
Update payment status (Admin only)
- **Auth**: Required (Admin)
- **Body**:
  ```json
  {
    "paymentStatus": "Paid",
    "transactionId": "TXN123456789"
  }
  ```
- **Valid Payment Statuses**: Pending, Paid, Failed, Refunded
- **Response**: Updated order

---

## 📊 Order Status Flow

```
Pending (User creates order)
  ↓
Confirmed (Admin confirms)
  ↓
Processing (Admin processes)
  ↓
Shipping (Order shipped)
  ↓
Delivered (Customer received)

Alternative flows:
- Pending/Confirmed → Cancelled (by user/admin)
- Any status → Refunded (by admin)
```

---

## 🔄 Stock Management

### Automatic Stock Updates
- **Add to Cart**: Validates available stock
- **Checkout**: Reduces stock by ordered quantity
- **Cancel Order**: Restores stock
- **Stock Validation**: Prevents overselling

---

## 💰 Pricing Calculation

```javascript
Subtotal = Sum of (item.price × item.quantity)
Tax = Subtotal × 0.1 (10%)
Total = Subtotal + Tax - Discount
```

---

## 🔐 Security & Access Control

### Cart Endpoints
- All require authentication
- Users can only access their own cart

### Order Endpoints
- User orders: Authentication required
- View order: Owner or admin
- Cancel order: Owner only (Pending/Confirmed)
- Update status: Admin only
- Update payment: Admin only
- View all orders: Admin only

---

## 📖 Usage Examples

### 1. Shopping Flow (User)
```bash
# 1. Add items to cart
POST /api/cart/items
{
  "productId": "xyz123",
  "quantity": 2
}

# 2. View cart
GET /api/cart

# 3. Update quantity
PUT /api/cart/items/xyz123
{
  "quantity": 3
}

# 4. Checkout
POST /api/orders
{
  "shippingAddress": {...},
  "paymentMethod": "COD",
  "discount": 0
}

# 5. View order history
GET /api/orders?page=1&limit=10

# 6. Cancel order (if needed)
PUT /api/orders/:orderId/cancel
{
  "reason": "Changed my mind"
}
```

### 2. Order Management (Admin)
```bash
# 1. View all orders
GET /api/orders/admin/all?status=Pending

# 2. Confirm order
PUT /api/orders/:orderId/status
{
  "status": "Confirmed",
  "note": "Order confirmed"
}

# 3. Update to shipping
PUT /api/orders/:orderId/status
{
  "status": "Shipping",
  "note": "Shipped via Express"
}

# 4. Mark as delivered
PUT /api/orders/:orderId/status
{
  "status": "Delivered",
  "note": "Successfully delivered"
}

# 5. Update payment (if needed)
PUT /api/orders/:orderId/payment
{
  "paymentStatus": "Paid",
  "transactionId": "TXN123"
}
```

---

## 🎯 Best Practices

1. **Always validate stock** before adding to cart
2. **Check order status** before allowing cancellation
3. **Log all status changes** in statusHistory
4. **Restore stock** when cancelling orders
5. **Use pagination** for order lists
6. **Verify order ownership** before showing details
7. **Admin only** for status/payment updates
8. **Clear cart** after successful checkout

---

## 🐛 Error Handling

All endpoints use standardized error responses:
```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

Common errors:
- **400**: Validation errors, insufficient stock, empty cart
- **401**: Unauthorized (no token)
- **403**: Forbidden (not owner/not admin)
- **404**: Cart/Order/Product not found
- **500**: Server error

---

## 📝 Testing Checklist

- [x] Cart CRUD operations
- [x] Stock validation
- [x] Checkout process
- [x] Order status updates
- [x] Payment status updates
- [x] Order cancellation
- [x] Stock restoration on cancel
- [x] Admin order management
- [x] Pagination
- [x] Access control
- [x] Error handling

---

## 🚀 Next Steps

Potential enhancements:
- Payment gateway integration (Stripe, PayPal, VNPay)
- Email notifications for order updates
- Order tracking with real-time updates
- Discount coupons/vouchers
- Order reviews and ratings
- Export orders to CSV/PDF
- Advanced analytics dashboard
- Abandoned cart recovery
- Multiple addresses per user
- Wishlist feature

