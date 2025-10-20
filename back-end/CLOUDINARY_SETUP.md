# Cloudinary Setup Guide - Product Image & Video Upload

## 📋 Tổng quan

Hệ thống cho phép upload:
- ✅ **Nhiều ảnh** cho mỗi sản phẩm (tối đa 10 ảnh, mỗi ảnh tối đa 10MB)
- ✅ **1 video** cho mỗi sản phẩm (tối đa 100MB)
- ✅ Tự động tối ưu hóa ảnh/video
- ✅ Tự động tạo thumbnail cho video
- ✅ Quản lý ảnh chính (primary image)

---

## 🚀 Bước 1: Tạo tài khoản Cloudinary

1. Truy cập [Cloudinary](https://cloudinary.com/)
2. Đăng ký tài khoản miễn phí
3. Sau khi đăng ký, vào Dashboard để lấy thông tin

---

## 🔑 Bước 2: Lấy API Credentials

Trong Cloudinary Dashboard, bạn sẽ thấy:

```
Cloud Name: your_cloud_name
API Key: 123456789012345
API Secret: abcdefghijklmnopqrstuvwxyz123
```

---

## ⚙️ Bước 3: Cấu hình Backend

### 3.1. Cập nhật file `.env`

Thêm các biến môi trường sau vào file `back-end/.env`:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123
```

### 3.2. Cài đặt dependencies

```bash
cd back-end
npm install
```

Các package đã được thêm:
- `cloudinary@^1.41.0` - Cloudinary SDK
- `multer@^1.4.5-lts.1` - File upload middleware

---

## 📖 Cách sử dụng API

### 1. Tạo sản phẩm với ảnh và video

**Endpoint**: `POST /api/products`

**Content-Type**: `multipart/form-data`

**Body (form-data)**:
```
name: "Wooden Car Puzzle"
description: "A beautiful handcrafted wooden puzzle"
story: "Made by local artisans..."
price: 29.99
category: "Puzzles"
stock: 50
images: [file1.jpg, file2.jpg, file3.jpg]  // Tối đa 10 ảnh
video: demo.mp4  // 1 video (optional)
```

**Ví dụ với cURL**:
```bash
curl -X POST http://localhost:5000/api/products \
  -F "name=Wooden Car Puzzle" \
  -F "price=29.99" \
  -F "description=A beautiful puzzle" \
  -F "category=Puzzles" \
  -F "stock=50" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg" \
  -F "images=@/path/to/image3.jpg" \
  -F "video=@/path/to/demo.mp4"
```

**Response**:
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "product": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Wooden Car Puzzle",
      "price": 29.99,
      "images": [
        {
          "url": "https://res.cloudinary.com/xxx/image/upload/v123/woodtoy/products/abc.jpg",
          "publicId": "woodtoy/products/abc",
          "alt": "Wooden Car Puzzle - Image 1",
          "isPrimary": true
        },
        {
          "url": "https://res.cloudinary.com/xxx/image/upload/v123/woodtoy/products/def.jpg",
          "publicId": "woodtoy/products/def",
          "alt": "Wooden Car Puzzle - Image 2",
          "isPrimary": false
        }
      ],
      "video": {
        "url": "https://res.cloudinary.com/xxx/video/upload/v123/woodtoy/products/video1.mp4",
        "publicId": "woodtoy/products/video1",
        "thumbnail": "https://res.cloudinary.com/xxx/video/upload/v123/woodtoy/products/video1.jpg",
        "duration": 30.5
      },
      "primaryImage": "https://res.cloudinary.com/xxx/image/upload/v123/woodtoy/products/abc.jpg"
    }
  }
}
```

---

### 2. Cập nhật sản phẩm với ảnh/video mới

**Endpoint**: `PUT /api/products/:id`

**Body (form-data)**:
```
name: "Updated Name"
price: 34.99
images: [newImage1.jpg, newImage2.jpg]  // Ảnh mới sẽ được thêm vào
video: newVideo.mp4  // Thay thế video cũ
deletedImages: ["woodtoy/products/oldImage1", "woodtoy/products/oldImage2"]  // JSON array
deleteVideo: "true"  // Xóa video hiện tại
```

**Ví dụ với cURL**:
```bash
curl -X PUT http://localhost:5000/api/products/507f1f77bcf86cd799439011 \
  -F "price=34.99" \
  -F "images=@/path/to/newImage.jpg" \
  -F 'deletedImages=["woodtoy/products/oldImage"]'
```

---

### 3. Thêm ảnh vào sản phẩm đã có

**Endpoint**: `POST /api/products/:id/images`

**Body (form-data)**:
```
images: [image1.jpg, image2.jpg, image3.jpg]
```

---

### 4. Xóa một ảnh cụ thể

**Endpoint**: `DELETE /api/products/:id/images/:publicId`

**Note**: `publicId` cần được URL encode nếu chứa dấu `/`

**Ví dụ**:
```bash
# publicId: woodtoy/products/abc123
# Encoded: woodtoy%2Fproducts%2Fabc123

DELETE /api/products/507f1f77bcf86cd799439011/images/woodtoy%2Fproducts%2Fabc123
```

---

### 5. Đặt ảnh chính (Primary Image)

**Endpoint**: `PUT /api/products/:id/images/:publicId/primary`

**Ví dụ**:
```bash
PUT /api/products/507f1f77bcf86cd799439011/images/woodtoy%2Fproducts%2Fabc123/primary
```

---

## 🔍 Chi tiết Model

### Product Schema

```javascript
{
  name: String (required),
  description: String,
  story: String,
  price: Number (required),
  category: String,
  stock: Number (default: 0),
  
  // Deprecated - Giữ lại để backward compatible
  image: String,
  
  // Multiple images (max 10)
  images: [
    {
      url: String (required),
      publicId: String (required),
      alt: String,
      isPrimary: Boolean (default: false)
    }
  ],
  
  // Single video
  video: {
    url: String (required),
    publicId: String (required),
    thumbnail: String,
    duration: Number
  },
  
  // Virtual field
  primaryImage: String (computed)
}
```

---

## 📝 Testing với Postman/Thunder Client

### Test 1: Tạo sản phẩm với ảnh

1. Mở Postman
2. Tạo request mới: `POST http://localhost:5000/api/products`
3. Chọn tab **Body** → **form-data**
4. Thêm các field:
   - `name` (Text): "Test Product"
   - `price` (Text): "29.99"
   - `images` (File): Chọn ảnh 1
   - `images` (File): Chọn ảnh 2 (cùng key name)
   - `images` (File): Chọn ảnh 3
   - `video` (File): Chọn video
5. Click **Send**

### Test 2: Lấy sản phẩm

```bash
GET http://localhost:5000/api/products/:id
```

### Test 3: Xóa sản phẩm

```bash
DELETE http://localhost:5000/api/products/:id
```

Tất cả ảnh và video sẽ tự động xóa khỏi Cloudinary!

---

## 🎨 Tính năng tự động

### 1. Tối ưu hóa ảnh
- Resize tối đa: 1200x1200px
- Tự động nén với quality "auto:good"
- Tự động convert sang format tối ưu (WebP cho browser hỗ trợ)

### 2. Tối ưu hóa video
- Resize tối đa: 1920x1080px (Full HD)
- Tự động tạo thumbnail từ giây thứ 1
- Nén với quality "auto:good"

### 3. Quản lý media
- Tự động xóa ảnh/video khỏi Cloudinary khi xóa sản phẩm
- Tự động xóa ảnh cũ khi upload ảnh mới thay thế
- Rollback upload nếu có lỗi trong quá trình tạo sản phẩm

---

## 🔐 Bảo mật

### Giới hạn file

- **Ảnh**: 
  - Tối đa 10 ảnh/sản phẩm
  - Mỗi ảnh tối đa 10MB
  - Format: JPEG, PNG, WebP, GIF

- **Video**:
  - Tối đa 1 video/sản phẩm
  - Tối đa 100MB
  - Format: MP4, WebM, MOV, AVI

### Validation

Hệ thống tự động validate:
- File type (mimetype)
- File size
- Số lượng file

---

## 📂 Cấu trúc folder trên Cloudinary

```
woodtoy/
  └── products/
      ├── image1_abc123.jpg
      ├── image2_def456.jpg
      ├── video1_xyz789.mp4
      └── ...
```

Tất cả media được lưu trong folder `woodtoy/products/` để dễ quản lý.

---

## 🐛 Xử lý lỗi

### Lỗi thường gặp

1. **"Invalid file type"**
   - Kiểm tra file format (chỉ chấp nhận JPEG, PNG, WebP, GIF cho ảnh)

2. **"File too large"**
   - Ảnh: Max 10MB
   - Video: Max 100MB

3. **"Maximum 10 images allowed"**
   - Mỗi sản phẩm chỉ được có tối đa 10 ảnh

4. **"Failed to upload images"**
   - Kiểm tra Cloudinary credentials trong `.env`
   - Kiểm tra kết nối internet

5. **"Too many files"**
   - Chỉ upload tối đa 10 ảnh mỗi lần

---

## 🎯 Best Practices

1. **Tối ưu ảnh trước khi upload**
   - Nên resize ảnh xuống kích thước hợp lý trước khi upload
   - Nén ảnh để giảm thời gian upload

2. **Đặt tên file có ý nghĩa**
   - Tên file sẽ được giữ trong Cloudinary
   - Dùng tên mô tả như: `wooden-car-red.jpg`

3. **Quản lý storage**
   - Cloudinary free tier: 25 GB storage
   - Xóa sản phẩm không dùng để tiết kiệm storage

4. **Sử dụng ảnh chính (Primary Image)**
   - Luôn set 1 ảnh làm primary image
   - Ảnh đầu tiên mặc định là primary

5. **Backup**
   - Nên backup publicIds của ảnh/video
   - Có thể restore từ Cloudinary nếu cần

---

## 🔄 Migration từ hệ thống cũ

Nếu bạn đang có sản phẩm với field `image` (string URL cũ):

1. Field `image` vẫn được giữ lại (backward compatible)
2. Sử dụng field `images` array cho ảnh mới
3. Virtual field `primaryImage` sẽ tự động:
   - Ưu tiên ảnh có `isPrimary: true` trong `images`
   - Nếu không có, lấy ảnh đầu tiên trong `images`
   - Nếu không có, fallback về field `image` cũ

---

## 📞 Support

Nếu gặp vấn đề:

1. Kiểm tra logs trong console
2. Kiểm tra Cloudinary Dashboard → Media Library
3. Kiểm tra Network tab trong browser DevTools
4. Xem file `back-end/utils/uploadUtils.js` để debug

---

## 📚 Tài liệu tham khảo

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Multer Documentation](https://github.com/expressjs/multer)

---

## ✅ Checklist triển khai

- [ ] Tạo tài khoản Cloudinary
- [ ] Cấu hình `.env` với credentials
- [ ] Chạy `npm install` trong folder back-end
- [ ] Test upload ảnh với Postman
- [ ] Test upload video với Postman
- [ ] Test xóa ảnh/video
- [ ] Kiểm tra Media Library trên Cloudinary
- [ ] Setup tương tự cho production environment

---

**🎉 Hoàn tất! Hệ thống đã sẵn sàng để upload ảnh và video cho sản phẩm.**

