# Product API Updates - Images & Video Support

## 🔄 Đã cập nhật

Tất cả các API liên quan đến Product đã được cập nhật để hỗ trợ nhiều ảnh và video:

---

## 📦 Product Model Changes

### Before (Old Structure)
```javascript
{
  name: String,
  price: Number,
  image: String,  // Single image URL
  category: String,
  stock: Number
}
```

### After (New Structure)
```javascript
{
  name: String,
  price: Number,
  
  // Legacy field (backward compatible)
  image: String,
  
  // New fields
  images: [
    {
      url: String,
      publicId: String,
      alt: String,
      isPrimary: Boolean
    }
  ],
  
  video: {
    url: String,
    publicId: String,
    thumbnail: String,
    duration: Number
  },
  
  // Virtual field
  primaryImage: String (computed)
}
```

---

## 🛒 Cart API Updates

### GET /api/cart
**Response** bây giờ bao gồm:
```json
{
  "success": true,
  "data": {
    "cart": {
      "items": [
        {
          "product": {
            "_id": "...",
            "name": "Wooden Car",
            "price": 29.99,
            "image": "old-url.jpg",           // Legacy
            "images": [                        // NEW
              {
                "url": "https://res.cloudinary.com/.../image1.jpg",
                "publicId": "woodtoy/products/image1",
                "isPrimary": true
              }
            ],
            "video": {                         // NEW
              "url": "https://res.cloudinary.com/.../video.mp4",
              "thumbnail": "https://res.cloudinary.com/.../thumb.jpg"
            }
          },
          "quantity": 2,
          "price": 29.99,
          "productSnapshot": {
            "name": "Wooden Car",
            "image": "primary-image-url.jpg",  // Auto uses primaryImage
            "category": "Toys"
          }
        }
      ]
    }
  }
}
```

### POST /api/cart/items
- **Snapshot** tự động lấy `primaryImage` (ảnh đầu tiên hoặc ảnh được đánh dấu primary)
- Response populate đầy đủ `images` và `video`

---

## 📦 Order API Updates

### POST /api/orders (Checkout)
**Order items** bây giờ lưu primary image:
```json
{
  "items": [
    {
      "product": "product-id",
      "name": "Wooden Car",
      "image": "primary-image-url.jpg",  // Auto from primaryImage
      "price": 29.99,
      "quantity": 2
    }
  ]
}
```

### GET /api/orders
**Response** populate đầy đủ product info:
```json
{
  "data": [
    {
      "orderNumber": "ORD20241020001",
      "items": [
        {
          "name": "Wooden Car",
          "image": "snapshot-image.jpg",
          "product": {
            "name": "Wooden Car",
            "image": "old-url.jpg",
            "images": [...],    // NEW
            "video": {...}      // NEW
          }
        }
      ]
    }
  ]
}
```

### GET /api/orders/:id
- Populate đầy đủ `images` và `video` của product

### GET /api/orders/admin/all
- Populate đầy đủ `images` và `video` của product

---

## 🎯 Product API (Main)

### GET /api/products
**Response**:
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "...",
        "name": "Wooden Car",
        "price": 29.99,
        "image": "old-url.jpg",        // Legacy (backward compatible)
        "images": [                     // NEW
          {
            "url": "https://res.cloudinary.com/.../img1.jpg",
            "publicId": "woodtoy/products/img1",
            "alt": "Wooden Car - Image 1",
            "isPrimary": true
          },
          {
            "url": "https://res.cloudinary.com/.../img2.jpg",
            "publicId": "woodtoy/products/img2",
            "alt": "Wooden Car - Image 2",
            "isPrimary": false
          }
        ],
        "video": {                      // NEW
          "url": "https://res.cloudinary.com/.../video.mp4",
          "publicId": "woodtoy/products/video",
          "thumbnail": "https://res.cloudinary.com/.../thumb.jpg",
          "duration": 30.5
        },
        "primaryImage": "https://res.cloudinary.com/.../img1.jpg"  // Virtual field
      }
    ]
  }
}
```

### GET /api/products/:id
**Response** đầy đủ với tất cả ảnh và video:
```json
{
  "success": true,
  "data": {
    "product": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Wooden Car Puzzle",
      "description": "A beautiful puzzle",
      "story": "Made by local artisans...",
      "price": 29.99,
      "category": "Puzzles",
      "stock": 50,
      
      "image": "old-url.jpg",          // Legacy
      
      "images": [                       // Multiple images
        {
          "url": "https://res.cloudinary.com/xxx/image/upload/v123/woodtoy/products/img1.jpg",
          "publicId": "woodtoy/products/img1",
          "alt": "Wooden Car Puzzle - Image 1",
          "isPrimary": true
        },
        {
          "url": "https://res.cloudinary.com/xxx/image/upload/v123/woodtoy/products/img2.jpg",
          "publicId": "woodtoy/products/img2",
          "alt": "Wooden Car Puzzle - Image 2",
          "isPrimary": false
        }
      ],
      
      "video": {                        // Video
        "url": "https://res.cloudinary.com/xxx/video/upload/v123/woodtoy/products/demo.mp4",
        "publicId": "woodtoy/products/demo",
        "thumbnail": "https://res.cloudinary.com/xxx/video/upload/v123/woodtoy/products/demo.jpg",
        "duration": 45.2
      },
      
      "primaryImage": "https://res.cloudinary.com/xxx/.../img1.jpg",  // Computed
      
      "createdAt": "2024-10-20T10:00:00.000Z",
      "updatedAt": "2024-10-20T10:00:00.000Z"
    }
  }
}
```

---

## 🔑 Key Points

### 1. Backward Compatibility
- Field `image` vẫn tồn tại để tương thích ngược
- Các API cũ vẫn hoạt động bình thường
- Frontend có thể dùng `image` hoặc `images[0]` hoặc `primaryImage`

### 2. Primary Image Logic
```javascript
// Priority order:
1. images.find(img => img.isPrimary === true).url
2. images[0].url (first image)
3. image (legacy field)
4. null
```

### 3. Cart Snapshot
- Khi add to cart, snapshot lưu `primaryImage`
- Đảm bảo luôn có ảnh hiển thị trong cart

### 4. Order Snapshot
- Khi checkout, order lưu `primaryImage`
- Ảnh snapshot không thay đổi dù product update

---

## 🎨 Frontend Usage Examples

### Display Product Card
```jsx
function ProductCard({ product }) {
  // Method 1: Use primaryImage (recommended)
  const imageUrl = product.primaryImage;
  
  // Method 2: Use first image from array
  const imageUrl = product.images?.[0]?.url;
  
  // Method 3: Fallback chain
  const imageUrl = product.primaryImage || 
                   product.images?.[0]?.url || 
                   product.image || 
                   '/placeholder.jpg';
  
  return (
    <div>
      <img src={imageUrl} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
    </div>
  );
}
```

### Display Product Gallery
```jsx
function ProductGallery({ product }) {
  return (
    <div>
      {/* Image Gallery */}
      <div className="images">
        {product.images?.map((img, index) => (
          <img 
            key={index}
            src={img.url} 
            alt={img.alt}
            className={img.isPrimary ? 'primary' : ''}
          />
        ))}
      </div>
      
      {/* Video Player */}
      {product.video && (
        <video controls poster={product.video.thumbnail}>
          <source src={product.video.url} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
```

### Display in Cart
```jsx
function CartItem({ item }) {
  const product = item.product;
  
  // Use snapshot image (frozen at add-to-cart time)
  const snapshotImage = item.productSnapshot.image;
  
  // Or use current product image
  const currentImage = product.primaryImage || product.images?.[0]?.url;
  
  return (
    <div>
      <img src={snapshotImage} alt={item.productSnapshot.name} />
      <p>{item.quantity} x ${item.price}</p>
    </div>
  );
}
```

---

## 📋 Migration Guide

### For Existing Products

Nếu bạn có sản phẩm cũ với field `image`:

1. **No action required** - Vẫn hoạt động bình thường
2. **Optional**: Migrate to new structure
   ```javascript
   // Run this script to migrate old products
   const products = await Product.find({ images: { $exists: false } });
   
   for (const product of products) {
     if (product.image) {
       // Convert old image to new images array
       product.images = [{
         url: product.image,
         publicId: extractPublicId(product.image),
         alt: `${product.name} - Image 1`,
         isPrimary: true
       }];
       await product.save();
     }
   }
   ```

### For New Products

Luôn sử dụng `images` array và `video` object khi tạo mới:
```javascript
// Good ✅
const product = await Product.create({
  name: "Wooden Car",
  price: 29.99,
  images: [
    { url: "...", publicId: "...", isPrimary: true }
  ],
  video: { url: "...", publicId: "..." }
});

// Avoid (legacy) ❌
const product = await Product.create({
  name: "Wooden Car",
  price: 29.99,
  image: "single-image-url.jpg"
});
```

---

## ✅ Testing Checklist

- [x] GET /api/products - Returns images & video
- [x] GET /api/products/:id - Returns full product with images & video
- [x] GET /api/cart - Populates product images & video
- [x] POST /api/cart/items - Saves primaryImage in snapshot
- [x] GET /api/orders - Populates product images & video
- [x] GET /api/orders/:id - Full product info with media
- [x] POST /api/orders - Saves primaryImage in order items
- [x] Backward compatibility with old `image` field

---

**✨ Tất cả API đã được cập nhật để hỗ trợ nhiều ảnh và video!**

