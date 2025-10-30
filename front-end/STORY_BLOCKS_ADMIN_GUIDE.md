# Story Blocks Admin Guide - Quản lý Câu chuyện Sản phẩm

## 📋 Tổng quan

Hướng dẫn sử dụng tính năng **Story Blocks** trong Admin Panel để tạo và quản lý câu chuyện sản phẩm với văn bản và hình ảnh đan xen.

---

## 🎯 Tính năng

### 1. **Thêm Text Block**
- Click nút "📝 Thêm Text"
- Nhập nội dung văn bản (tối đa 5000 ký tự)
- Text hỗ trợ xuống dòng và định dạng cơ bản

### 2. **Thêm Image Block**
- Click nút "🖼️ Thêm Ảnh"
- Upload ảnh từ máy tính
- Thêm Caption (mô tả ảnh, tối đa 200 ký tự)
- Thêm Alt Text cho SEO (tối đa 100 ký tự)

### 3. **Sắp xếp thứ tự**
- Click ⬆️ để di chuyển block lên trên
- Click ⬇️ để di chuyển block xuống dưới
- Thứ tự hiển thị theo số thứ tự (#1, #2, #3...)

### 4. **Xóa Block**
- Click 🗑️ để xóa block
- Các block còn lại sẽ tự động re-order

---

## 🎨 Cách sử dụng trong Admin

### Khi tạo sản phẩm mới:

1. Điền thông tin cơ bản (tên, mô tả, giá...)
2. Scroll xuống phần "Story Blocks"
3. Click "Thêm Text" hoặc "Thêm Ảnh"
4. Điền nội dung cho mỗi block
5. Sắp xếp thứ tự theo ý muốn
6. Click "Tạo sản phẩm"

### Khi chỉnh sửa sản phẩm:

1. Mở sản phẩm cần chỉnh sửa
2. Story blocks hiện tại sẽ được load tự động
3. Có thể:
   - Chỉnh sửa nội dung text
   - Thay đổi ảnh (upload ảnh mới)
   - Thêm/xóa blocks
   - Sắp xếp lại thứ tự
4. Click "Lưu thay đổi"

---

## 📊 UI Components trong ProductEdit.jsx

### State Management:

```javascript
const [storyBlocks, setStoryBlocks] = useState([]); // Danh sách blocks
const [storyImages, setStoryImages] = useState({}); // Ảnh mới upload
```

### Main Functions:

- `addTextBlock()` - Thêm text block mới
- `addImageBlock()` - Thêm image block mới
- `updateStoryBlock(index, field, value)` - Cập nhật nội dung block
- `handleStoryImageChange(index, file)` - Upload ảnh mới
- `removeStoryBlock(index)` - Xóa block
- `moveStoryBlock(index, direction)` - Di chuyển block lên/xuống

### Form Submit:

```javascript
// Story blocks được gửi dưới dạng:
formData.append("storyBlocks", JSON.stringify(storyBlocks));

// Ảnh story được gửi riêng:
Object.keys(storyImages).forEach((index) => {
  formData.append("storyImages", storyImages[index]);
});
```

---

## 🎨 UI Elements

### 1. **Block Badge**
```
#1 📝 Text    hoặc    #1 🖼️ Ảnh
```

### 2. **Control Buttons**
- ⬆️ Di chuyển lên
- ⬇️ Di chuyển xuống
- 🗑️ Xóa block

### 3. **Preview Images**
- **Ảnh mới**: Border xanh lá + badge "Ảnh mới"
- **Ảnh hiện tại**: Border xám + badge "Hiện tại"

### 4. **Statistics Bar**
```
📊 Thống kê: 5 blocks (3 text, 2 ảnh) • Tối đa: 50 blocks
```

---

## 💡 Tips & Best Practices

### 1. **Cấu trúc câu chuyện tốt:**
```
Text Block 1: Giới thiệu chung
Image Block 1: Ảnh tổng quan sản phẩm
Text Block 2: Chi tiết vật liệu
Image Block 2: Ảnh nguyên liệu
Text Block 3: Quy trình làm
Image Block 3: Ảnh quy trình
Text Block 4: Kết luận
```

### 2. **Nội dung Text:**
- Ngắn gọn, dễ đọc
- Chia nhỏ thành đoạn (200-300 từ/block)
- Sử dụng bullet points nếu cần

### 3. **Hình ảnh:**
- Chất lượng cao (ít nhất 1200px width)
- Đặt tên file có ý nghĩa
- Luôn điền Alt Text cho SEO
- Caption ngắn gọn, mô tả chính xác

### 4. **SEO:**
- Alt Text: dùng keywords, ngắn gọn
- Caption: mô tả rõ ràng cho người đọc
- Thứ tự blocks hợp lý (intro → detail → conclusion)

---

## 🔄 Data Flow

### Create Product:
```
1. User tạo blocks trong UI
2. Click "Tạo sản phẩm"
3. FormData gửi:
   - storyBlocks: JSON string
   - storyImages: File[]
4. Backend xử lý:
   - Upload ảnh lên Cloudinary
   - Tạo Product với storyBlocks
5. Response: Product đã tạo
```

### Update Product:
```
1. Load existing storyBlocks từ product
2. User chỉnh sửa/thêm/xóa blocks
3. Click "Lưu thay đổi"
4. FormData gửi (giống create)
5. Backend xử lý:
   - Xóa ảnh cũ nếu có ảnh mới
   - Upload ảnh mới
   - Update storyBlocks
6. Response: Product đã update
```

---

## 🎯 Validation Rules

### Client-side (Frontend):
- Text content: max 5000 ký tự
- Caption: max 200 ký tự
- Alt text: max 100 ký tự
- Total blocks: max 50
- File type: chỉ image/*

### Server-side (Backend):
- Validate storyBlocks structure
- Validate image files
- Max 30 story images
- Auto cleanup old images

---

## 🐛 Troubleshooting

### Ảnh không hiển thị preview:
- Kiểm tra file type (phải là image/*)
- Kiểm tra file size (< 10MB)

### Không thể di chuyển block:
- Block đầu tiên không thể move up
- Block cuối cùng không thể move down

### Form submit failed:
- Kiểm tra network tab
- Xem error message trong console
- Kiểm tra backend logs

### Ảnh cũ bị mất:
- Khi upload ảnh mới, ảnh cũ sẽ bị thay thế
- Nếu không muốn thay, đừng chọn file mới

---

## 📝 Example Use Case

### Ví dụ: Sản phẩm "Xe gỗ Handmade"

```javascript
storyBlocks = [
  {
    type: "text",
    order: 0,
    content: "Chiếc xe gỗ này được làm hoàn toàn thủ công từ gỗ thông tự nhiên..."
  },
  {
    type: "image",
    order: 1,
    image: { url: "...", publicId: "..." },
    caption: "Chiếc xe gỗ hoàn thiện với màu sắc tự nhiên",
    alt: "wooden-car-toy-handmade"
  },
  {
    type: "text",
    order: 2,
    content: "Quy trình sản xuất gồm 5 bước chính..."
  },
  {
    type: "image",
    order: 3,
    image: { url: "...", publicId: "..." },
    caption: "Nghệ nhân đang chạm khắc chi tiết",
    alt: "woodworking-process"
  }
]
```

---

## 🔗 Related Files

- **Backend Model**: `back-end/models/Product.js`
- **Backend Controller**: `back-end/controllers/productController.js`
- **Frontend Admin**: `front-end/src/pages/admin/ProductEdit.jsx`
- **Frontend Display**: `front-end/src/pages/ProductDetail.jsx`
- **Backend Guide**: `back-end/STORY_BLOCKS_GUIDE.md`

---

## ✅ Checklist trước khi Submit

- [ ] Đã điền nội dung cho tất cả text blocks
- [ ] Đã upload ảnh cho tất cả image blocks
- [ ] Đã điền Caption cho tất cả ảnh
- [ ] Đã điền Alt Text cho SEO
- [ ] Đã sắp xếp thứ tự hợp lý
- [ ] Preview lại toàn bộ story
- [ ] Kiểm tra thống kê (không quá 50 blocks)

---

**Chúc bạn tạo được những câu chuyện sản phẩm tuyệt vời! 🎉**




