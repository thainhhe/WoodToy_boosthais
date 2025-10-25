# Blog System - Complete Guide

## 📋 Tổng quan

Hệ thống Blog đầy đủ với các tính năng:
- ✅ CRUD blog posts (Create, Read, Update, Delete)
- ✅ Upload nhiều ảnh cho mỗi blog (max 20 ảnh)
- ✅ Featured image (ảnh đại diện)
- ✅ Categories và Tags
- ✅ Comments system
- ✅ Like/Unlike functionality
- ✅ Views counter
- ✅ Draft/Published status
- ✅ SEO fields (meta title, meta description)
- ✅ Auto-generate slug từ title
- ✅ Reading time calculator
- ✅ Text search (title, content, tags)
- ✅ **Hỗ trợ blog content rất dài** (không giới hạn độ dài)

---

## 🗂️ Blog Model Structure

### **Các trường chính:**

#### **1. Title (Tiêu đề)**
```javascript
title: {
  type: String,
  required: true,
  minlength: 10,
  maxlength: 200
}
```
- **Bắt buộc**: Phải có
- **Độ dài**: 10-200 ký tự
- **Ví dụ**: "10 Tips for Choosing Safe Wooden Toys"

#### **2. Slug (URL-friendly title)**
```javascript
slug: {
  type: String,
  unique: true,
  lowercase: true
}
```
- **Auto-generated** từ title
- **Unique**: Không trùng lặp
- **Ví dụ**: `10-tips-for-choosing-safe-wooden-toys-1234567890`

#### **3. Excerpt (Tóm tắt ngắn)**
```javascript
excerpt: {
  type: String,
  maxlength: 500
}
```
- **Optional**: Có thể bỏ trống
- **Auto-generated** từ 200 ký tự đầu của content nếu không cung cấp
- **Hiển thị**: Trong danh sách blog

#### **4. Content (Nội dung chính)**
```javascript
content: {
  type: String,
  required: true,
  minlength: 100,
  // ✅ KHÔNG giới hạn độ dài - Hỗ trợ blog rất dài!
}
```
- **Bắt buộc**: Phải có
- **Độ dài tối thiểu**: 100 ký tự
- **Độ dài tối đa**: ✅ **KHÔNG GIỚI HẠN** (có thể rất dài)
- **Server limit**: 50MB payload
- **Hỗ trợ**: HTML, Markdown, hoặc plain text

#### **5. Author (Tác giả)**
```javascript
author: {
  type: ObjectId,
  ref: "User",
  required: true
}
```
- **Auto-set**: Lấy từ `req.user._id` khi tạo
- **Populated**: Trả về thông tin user (name, email, avatar)

#### **6. Featured Image (Ảnh đại diện)**
```javascript
featuredImage: {
  type: String, // Cloudinary URL
}
```
- **Optional**: Có thể không có
- **Upload**: Qua form-data với key `featuredImage`
- **Ví dụ**: `https://res.cloudinary.com/.../featured.jpg`

#### **7. Images (Nhiều ảnh)**
```javascript
images: [{
  url: String,      // Cloudinary URL
  publicId: String, // Để xóa sau này
  alt: String,      // Alt text cho SEO
  isPrimary: Boolean // Ảnh chính
}]
```
- **Max**: 20 ảnh/blog
- **Upload**: Qua form-data với key `images` (multiple files)
- **Auto-delete**: Tự động xóa khỏi Cloudinary khi xóa blog

#### **8. Category (Danh mục)**
```javascript
category: {
  type: String,
  required: true,
  enum: ["News", "Tutorial", "Review", "Story", "Tips", "Crafts", "Other"]
}
```
- **Bắt buộc**: Phải chọn 1 category
- **Giá trị**: Chỉ chấp nhận các giá trị trong enum

#### **9. Tags (Thẻ)**
```javascript
tags: [String] // Max 10 tags
```
- **Optional**: Có thể không có
- **Max**: 10 tags
- **Format**: Array of strings
- **Ví dụ**: `["wooden toys", "safety", "kids", "parenting"]`

#### **10. Status (Trạng thái)**
```javascript
status: {
  type: String,
  enum: ["draft", "published"],
  default: "draft"
}
```
- **draft**: Nháp, chỉ admin/author xem được
- **published**: Công khai, mọi người xem được
- **Default**: draft

#### **11. Views (Lượt xem)**
```javascript
views: {
  type: Number,
  default: 0
}
```
- **Auto-increment**: Tự động +1 mỗi lần người dùng xem blog

#### **12. Likes (Người thích)**
```javascript
likes: [ObjectId] // Array of User IDs
```
- **Array**: Danh sách ID của users đã like
- **Count**: Virtual field `likesCount`

#### **13. Comments (Bình luận)**
```javascript
comments: [{
  user: ObjectId,
  content: String, // Max 1000 ký tự
  createdAt: Date
}]
```
- **Nested**: Lưu trực tiếp trong blog document
- **Max content**: 1000 ký tự/comment
- **Count**: Virtual field `commentsCount`

#### **14. SEO Fields**
```javascript
metaTitle: {
  type: String,
  maxlength: 70 // Google recommended
}
metaDescription: {
  type: String,
  maxlength: 160 // Google recommended
}
```
- **Optional**: Cho SEO tốt hơn
- **Khuyến nghị**: Nên điền để tối ưu SEO

#### **15. Timestamps**
```javascript
publishedAt: Date,  // Thời điểm publish
createdAt: Date,    // Auto by Mongoose
updatedAt: Date     // Auto by Mongoose
```

---

## 🔄 Virtual Fields (Computed)

### **1. primaryImage**
```javascript
blog.primaryImage
// Trả về: URL của ảnh chính
// Priority: images.isPrimary → images[0] → featuredImage → null
```

### **2. likesCount**
```javascript
blog.likesCount
// Trả về: Số lượng likes
```

### **3. commentsCount**
```javascript
blog.commentsCount
// Trả về: Số lượng comments
```

### **4. readingTime**
```javascript
blog.readingTime
// Trả về: Thời gian đọc (phút)
// Tính toán: 200 words/minute
```

---

## 📡 API Endpoints

### **Public Endpoints (Không cần đăng nhập)**

#### **1. GET /api/blogs - Lấy danh sách blogs**

**Query Parameters:**
```javascript
page=1           // Trang số (default: 1)
limit=10         // Số blog/trang (default: 10)
category=Tips    // Lọc theo category
search=wooden    // Tìm kiếm trong title, content, tags
tags=safety,kids // Lọc theo tags (comma-separated)
status=published // Chỉ admin mới filter được draft
```

**Response:**
```json
{
  "success": true,
  "message": "Blogs retrieved successfully",
  "data": [
    {
      "_id": "...",
      "title": "10 Tips for Choosing Wooden Toys",
      "slug": "10-tips-for-choosing-wooden-toys-1234567890",
      "excerpt": "Discover the best ways...",
      "author": {
        "_id": "...",
        "name": "John Doe",
        "avatar": "https://..."
      },
      "featuredImage": "https://...",
      "category": "Tips",
      "tags": ["wooden toys", "safety"],
      "status": "published",
      "views": 1234,
      "likesCount": 56,
      "commentsCount": 12,
      "readingTime": 5,
      "publishedAt": "2024-01-15T10:00:00.000Z",
      "createdAt": "2024-01-15T09:00:00.000Z"
      // ❌ Không trả về 'content' trong list view
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "pageSize": 10,
    "totalItems": 95,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### **2. GET /api/blogs/:identifier - Lấy chi tiết blog**

**Identifier có thể là:**
- Blog ID: `507f1f77bcf86cd799439011`
- Slug: `10-tips-for-choosing-wooden-toys-1234567890`

**Response:**
```json
{
  "success": true,
  "data": {
    "blog": {
      "_id": "...",
      "title": "10 Tips for Choosing Wooden Toys",
      "slug": "...",
      "excerpt": "...",
      "content": "Full blog content here... CÓ THỂ RẤT DÀI!",
      "author": { ... },
      "featuredImage": "...",
      "images": [...],
      "category": "Tips",
      "tags": [...],
      "views": 1234,
      "likes": [...],
      "comments": [
        {
          "_id": "...",
          "user": {
            "name": "Jane",
            "avatar": "..."
          },
          "content": "Great article!",
          "createdAt": "..."
        }
      ],
      "likesCount": 56,
      "commentsCount": 12,
      "readingTime": 5
    }
  }
}
```
**Note**: Views tự động +1 mỗi lần gọi API này

#### **3. GET /api/blogs/categories/list - Lấy danh sách categories**

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      { "_id": "Tips", "count": 25 },
      { "_id": "Tutorial", "count": 18 },
      { "_id": "News", "count": 12 }
    ]
  }
}
```

#### **4. GET /api/blogs/tags/popular - Lấy tags phổ biến**

**Query:**
```javascript
limit=20 // Số lượng tags (default: 20)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tags": [
      { "_id": "wooden toys", "count": 45 },
      { "_id": "safety", "count": 32 },
      { "_id": "kids", "count": 28 }
    ]
  }
}
```

---

### **Private Endpoints (Cần đăng nhập)**

#### **5. POST /api/blogs/:id/like - Like/Unlike blog**

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Blog liked successfully",
  "data": {
    "liked": true,
    "likesCount": 57
  }
}
```

#### **6. POST /api/blogs/:id/comments - Thêm comment**

**Headers:**
```
Authorization: Bearer <access-token>
```

**Body (JSON):**
```json
{
  "content": "Great article! Very helpful tips."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "comment": {
      "_id": "...",
      "user": { ... },
      "content": "Great article!",
      "createdAt": "..."
    },
    "commentsCount": 13
  }
}
```

#### **7. DELETE /api/blogs/:id/comments/:commentId - Xóa comment**

**Headers:**
```
Authorization: Bearer <access-token>
```

**Note**: Chỉ comment owner hoặc admin mới xóa được

---

### **Admin Endpoints (Chỉ Admin)**

#### **8. POST /api/blogs - Tạo blog mới**

**Headers:**
```
Authorization: Bearer <admin-access-token>
Content-Type: multipart/form-data
```

**Body (Form Data):**

**Option 1: Với ảnh (Form Data)**
```javascript
title: "10 Tips for Choosing Wooden Toys"
content: "Very long content... CÓ THỂ RẤT DÀI!"
excerpt: "Short summary..." (optional)
category: "Tips"
tags: "wooden toys,safety,kids" (comma-separated)
status: "published" or "draft"
metaTitle: "SEO title" (optional)
metaDescription: "SEO description" (optional)
featuredImage: [File] (optional, max 10MB)
images: [File, File, File] (optional, max 20 files)
```

**Option 2: Không có ảnh (JSON cũng được)**
```json
{
  "title": "10 Tips for Choosing Wooden Toys",
  "content": "Very long content...",
  "category": "Tips",
  "tags": ["wooden toys", "safety", "kids"],
  "status": "published"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Blog created successfully",
  "data": {
    "blog": { ... }
  }
}
```

#### **9. PUT /api/blogs/:id - Cập nhật blog**

**Headers:**
```
Authorization: Bearer <admin-access-token>
Content-Type: multipart/form-data
```

**Body (Form Data):**
```javascript
title: "Updated Title" (optional)
content: "Updated content..." (optional)
category: "Tutorial" (optional)
tags: "new,tags" (optional)
status: "published" (optional)
featuredImage: [New File] (optional - thay thế ảnh cũ)
images: [File, File] (optional - thêm ảnh mới)
removeFeaturedImage: "true" (optional - xóa featured image)
deletedImages: '["publicId1", "publicId2"]' (optional - xóa ảnh cũ)
```

**Ví dụ xóa và thêm ảnh:**
```javascript
// Xóa 2 ảnh cũ
deletedImages: '["woodtoy/blogs/img1", "woodtoy/blogs/img2"]'

// Thêm 3 ảnh mới
images: [file1.jpg, file2.jpg, file3.jpg]
```

#### **10. DELETE /api/blogs/:id - Xóa blog**

**Headers:**
```
Authorization: Bearer <admin-access-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Blog deleted successfully"
}
```

**Note**: Tự động xóa tất cả ảnh trên Cloudinary

---

## 🔍 Search & Filter Examples

### **1. Tìm kiếm text**
```bash
GET /api/blogs?search=wooden+toys+safety
```
Tìm trong: title, content, tags

### **2. Lọc theo category**
```bash
GET /api/blogs?category=Tips
```

### **3. Lọc theo tags**
```bash
GET /api/blogs?tags=safety,kids
```

### **4. Kết hợp nhiều filter**
```bash
GET /api/blogs?category=Tips&tags=safety&search=wooden&page=2&limit=20
```

---

## ⚠️ Xử lý Blog Content Dài

### **Giải pháp đã implement:**

#### **1. Bỏ giới hạn maxlength**
```javascript
// ✅ Blog content KHÔNG giới hạn độ dài
content: {
  type: String,
  required: true,
  minlength: 100,
  // Không có maxlength
}
```

#### **2. Tăng payload limit trong Express**
```javascript
// server.js
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
```
**Mặc định Express chỉ nhận 100kb**, giờ đã tăng lên **50MB**

#### **3. MongoDB hỗ trợ large documents**
- **Max document size**: 16MB trong MongoDB
- **Nếu content > 16MB**: Cần dùng GridFS
- **Khuyến nghị**: Nếu blog thường xuyên > 16MB, nên tách content ra collection riêng

### **Best Practices cho blog dài:**

1. **Frontend**: Dùng rich text editor (TinyMCE, CKEditor, Quill)
2. **Compression**: Có thể compress content trước khi lưu
3. **Lazy loading**: Load images trong content khi cần
4. **Pagination**: Có thể chia content thành nhiều trang nếu quá dài

---

## 🔐 Authorization Rules

### **Public (Không cần đăng nhập):**
- ✅ Xem danh sách blogs (published)
- ✅ Xem chi tiết blog (published)
- ✅ Xem categories/tags

### **User (Đã đăng nhập):**
- ✅ Tất cả public actions
- ✅ Like/Unlike blogs
- ✅ Comment on blogs
- ✅ Delete own comments

### **Admin:**
- ✅ Tất cả user actions
- ✅ Create/Update/Delete blogs
- ✅ View draft blogs
- ✅ Delete any comments
- ✅ Upload images

---

## 📝 Testing với Postman/Thunder Client

### **Test 1: Tạo blog với ảnh (Admin)**

1. **Method**: POST
2. **URL**: `http://localhost:5000/api/blogs`
3. **Headers**:
   ```
   Authorization: Bearer <admin-token>
   ```
4. **Body → form-data**:
   ```
   title: "Test Blog Post"
   content: "This is a very long blog content... [có thể copy paste rất nhiều text]"
   category: "Tips"
   tags: "test,demo"
   status: "published"
   featuredImage: [Chọn file ảnh]
   images: [Chọn nhiều file ảnh]
   ```

### **Test 2: Tìm kiếm blog**

```bash
GET http://localhost:5000/api/blogs?search=wooden&category=Tips
```

### **Test 3: Like blog (User)**

```bash
POST http://localhost:5000/api/blogs/507f1f77bcf86cd799439011/like
Headers: Authorization: Bearer <user-token>
```

### **Test 4: Comment (User)**

```bash
POST http://localhost:5000/api/blogs/507f1f77bcf86cd799439011/comments
Headers: Authorization: Bearer <user-token>
Body (JSON):
{
  "content": "Great article!"
}
```

---

## 🎯 Use Cases

### **1. Blog Homepage**
```javascript
// Lấy 10 blog mới nhất
GET /api/blogs?limit=10&page=1

// Lấy blog theo category
GET /api/blogs?category=Tips&limit=6
```

### **2. Blog Detail Page**
```javascript
// Dùng slug (SEO friendly)
GET /api/blogs/10-tips-for-choosing-wooden-toys-1234567890
```

### **3. Search Page**
```javascript
// Search box
GET /api/blogs?search=<user-input>
```

### **4. Sidebar widgets**
```javascript
// Popular tags
GET /api/blogs/tags/popular?limit=10

// Categories with count
GET /api/blogs/categories/list
```

---

## ✅ Checklist Implementation

- [x] Blog Model với tất cả fields
- [x] Upload nhiều ảnh (max 20)
- [x] Featured image
- [x] Categories & Tags
- [x] Comments system
- [x] Like/Unlike
- [x] Views counter
- [x] Draft/Published status
- [x] SEO fields
- [x] Auto slug generation
- [x] Reading time calculator
- [x] Text search
- [x] **Hỗ trợ blog content rất dài**
- [x] **Tăng payload limit lên 50MB**
- [x] Authorization (Public/User/Admin)
- [x] Swagger documentation
- [x] Error handling
- [x] Cloudinary integration
- [x] Auto cleanup images on delete

---

## 🚀 Next Steps (Optional)

### **Tính năng có thể thêm sau:**

1. **Rich Text Editor**: Integrate TinyMCE/CKEditor
2. **Image Gallery**: Modal để xem ảnh full size
3. **Share buttons**: Facebook, Twitter, LinkedIn
4. **Related posts**: Gợi ý blog liên quan
5. **View statistics**: Chi tiết views theo ngày/tháng
6. **Comment replies**: Nested comments
7. **Email notification**: Thông báo có comment mới
8. **Bookmark/Save**: User lưu blog yêu thích
9. **RSS Feed**: Xuất RSS cho blog
10. **Sitemap**: Auto generate sitemap.xml

---

**🎉 Hệ thống Blog đã hoàn tất và sẵn sàng sử dụng!**

**💡 Đặc biệt: Hỗ trợ blog content rất dài (lên đến 50MB)!**

