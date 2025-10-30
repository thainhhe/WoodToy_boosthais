# Story Blocks Guide - Rich Product Stories with Text & Images

## 📋 Tổng quan

Tính năng **Story Blocks** cho phép tạo câu chuyện sản phẩm phong phú với văn bản và hình ảnh đan xen lẫn nhau.

### Tính năng chính:
- ✅ Text blocks (văn bản)
- ✅ Image blocks (hình ảnh)
- ✅ Sắp xếp thứ tự tùy ý
- ✅ Caption và alt text cho ảnh
- ✅ Upload/Delete ảnh riêng biệt
- ✅ Tối đa 50 blocks/sản phẩm
- ✅ Tối đa 30 ảnh trong story
- ✅ Auto cleanup khi xóa sản phẩm

---

## 📊 Data Structure

### Story Block Schema

```javascript
{
  type: "text" | "image",
  order: Number,             // Thứ tự hiển thị (0, 1, 2, ...)
  
  // For TEXT blocks
  content: String,           // Nội dung văn bản (max 5000 ký tự)
  
  // For IMAGE blocks
  image: {
    url: String,            // Cloudinary URL
    publicId: String,       // Cloudinary public ID
    caption: String,        // Mô tả ảnh (max 200 ký tự)
    alt: String             // Alt text cho SEO
  }
}
```

### Example Product with Story Blocks

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Wooden Animal Puzzle",
  "price": 29.99,
  "storyBlocks": [
    {
      "_id": "block1",
      "type": "text",
      "order": 0,
      "content": "Handcrafted with love by local artisans in Vietnam..."
    },
    {
      "_id": "block2",
      "type": "image",
      "order": 1,
      "image": {
        "url": "https://res.cloudinary.com/.../story1.jpg",
        "publicId": "woodtoy/products/stories/abc123",
        "caption": "Our skilled craftsman at work",
        "alt": "Craftsman carving wooden puzzle"
      }
    },
    {
      "_id": "block3",
      "type": "text",
      "order": 2,
      "content": "Each piece is carefully sanded and painted..."
    },
    {
      "_id": "block4",
      "type": "image",
      "order": 3,
      "image": {
        "url": "https://res.cloudinary.com/.../story2.jpg",
        "publicId": "woodtoy/products/stories/def456",
        "caption": "Natural, non-toxic paint colors",
        "alt": "Colorful wooden puzzle pieces"
      }
    }
  ]
}
```

---

## 🔄 API Usage

### 1. Create Product with Story Blocks

**Endpoint**: `POST /api/products`

**Content-Type**: `multipart/form-data`

#### Request Body (Form Data):

```javascript
name: "Wooden Animal Puzzle"
price: 29.99
description: "A fun puzzle for kids"
category: "Puzzles"
stock: 50

// Story blocks as JSON string
storyBlocks: '[
  {
    "type": "text",
    "order": 0,
    "content": "Handcrafted with love by local artisans..."
  },
  {
    "type": "image",
    "order": 1,
    "image": {
      "caption": "Our skilled craftsman at work",
      "alt": "Craftsman carving wooden puzzle"
    }
  },
  {
    "type": "text",
    "order": 2,
    "content": "Each piece is carefully sanded..."
  },
  {
    "type": "image",
    "order": 3,
    "image": {
      "caption": "Natural paint colors",
      "alt": "Colorful puzzle pieces"
    }
  }
]'

// Story images (matched by filename pattern)
storyImages: [file1.jpg] // Named "story_1" for block index 1
storyImages: [file2.jpg] // Named "story_3" for block index 3

// Regular product images
images: [main1.jpg, main2.jpg]

// Optional video
video: demo.mp4
```

#### ⚠️ Important: Image Naming Convention

Để map ảnh với đúng block, đặt tên file theo format:
- `story_0` → ảnh cho block index 0
- `story_1` → ảnh cho block index 1
- `story_3` → ảnh cho block index 3

Hoặc sử dụng `originalname` field khi upload.

#### Response:

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "product": {
      "_id": "...",
      "name": "Wooden Animal Puzzle",
      "storyBlocks": [
        {
          "_id": "...",
          "type": "text",
          "order": 0,
          "content": "Handcrafted with love..."
        },
        {
          "_id": "...",
          "type": "image",
          "order": 1,
          "image": {
            "url": "https://res.cloudinary.com/.../story1.jpg",
            "publicId": "woodtoy/products/stories/abc123",
            "caption": "Our skilled craftsman at work",
            "alt": "Craftsman carving wooden puzzle"
          }
        }
      ]
    }
  }
}
```

---

### 2. Update Product Story Blocks

**Endpoint**: `PUT /api/products/:id`

**Content-Type**: `multipart/form-data`

#### Request Body:

```javascript
// Update existing story blocks
storyBlocks: '[
  {
    "type": "text",
    "order": 0,
    "content": "UPDATED: New story introduction..."
  },
  {
    "type": "image",
    "order": 1,
    "image": {
      "url": "https://res.cloudinary.com/.../existing.jpg",
      "publicId": "woodtoy/products/stories/existing123",
      "caption": "Updated caption",
      "alt": "Updated alt text"
    }
  },
  {
    "type": "image",
    "order": 2,
    "image": {
      "caption": "New image to upload",
      "alt": "New alt text"
    }
  }
]'

// Upload new images for story blocks
storyImages: [newImage.jpg] // Named "story_2" for block index 2

// Delete specific story images (JSON array of publicIds)
deletedStoryImages: '["woodtoy/products/stories/old123", "woodtoy/products/stories/old456"]'
```

#### Response:

```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "product": {
      // Updated product with new story blocks
    }
  }
}
```

---

### 3. Delete Product (Auto-cleanup Story Images)

**Endpoint**: `DELETE /api/products/:id`

Tất cả ảnh trong story blocks sẽ tự động xóa khỏi Cloudinary.

---

## 💡 Frontend Implementation Examples

### Example 1: React Form with Story Blocks

```jsx
import { useState } from 'react';

function ProductStoryEditor() {
  const [storyBlocks, setStoryBlocks] = useState([]);

  // Add text block
  const addTextBlock = () => {
    setStoryBlocks([
      ...storyBlocks,
      {
        type: "text",
        order: storyBlocks.length,
        content: ""
      }
    ]);
  };

  // Add image block
  const addImageBlock = (file) => {
    setStoryBlocks([
      ...storyBlocks,
      {
        type: "image",
        order: storyBlocks.length,
        image: {
          file: file, // Will upload later
          caption: "",
          alt: ""
        }
      }
    ]);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', productName);
    formData.append('price', price);
    
    // Add story blocks (without file objects)
    const blocksForAPI = storyBlocks.map(block => {
      if (block.type === 'image') {
        return {
          type: 'image',
          order: block.order,
          image: {
            caption: block.image.caption,
            alt: block.image.alt
          }
        };
      }
      return block;
    });
    formData.append('storyBlocks', JSON.stringify(blocksForAPI));
    
    // Add story images with proper naming
    storyBlocks.forEach((block, index) => {
      if (block.type === 'image' && block.image.file) {
        const file = new File(
          [block.image.file],
          `story_${index}`,
          { type: block.image.file.type }
        );
        formData.append('storyImages', file);
      }
    });
    
    // Submit to API
    const response = await fetch('/api/products', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    console.log('Created:', data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Product basic fields */}
      
      {/* Story blocks editor */}
      <div className="story-blocks">
        <h3>Product Story</h3>
        
        {storyBlocks.map((block, index) => (
          <div key={index} className="story-block">
            {block.type === 'text' ? (
              <textarea
                value={block.content}
                onChange={(e) => {
                  const updated = [...storyBlocks];
                  updated[index].content = e.target.value;
                  setStoryBlocks(updated);
                }}
                placeholder="Enter story text..."
                maxLength={5000}
              />
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const updated = [...storyBlocks];
                    updated[index].image.file = e.target.files[0];
                    setStoryBlocks(updated);
                  }}
                />
                <input
                  type="text"
                  placeholder="Caption"
                  value={block.image.caption}
                  onChange={(e) => {
                    const updated = [...storyBlocks];
                    updated[index].image.caption = e.target.value;
                    setStoryBlocks(updated);
                  }}
                />
                <input
                  type="text"
                  placeholder="Alt text"
                  value={block.image.alt}
                  onChange={(e) => {
                    const updated = [...storyBlocks];
                    updated[index].image.alt = e.target.value;
                    setStoryBlocks(updated);
                  }}
                />
              </div>
            )}
            
            <button type="button" onClick={() => {
              setStoryBlocks(storyBlocks.filter((_, i) => i !== index));
            }}>
              Remove Block
            </button>
          </div>
        ))}
        
        <button type="button" onClick={addTextBlock}>
          + Add Text Block
        </button>
        <button type="button" onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = (e) => addImageBlock(e.target.files[0]);
          input.click();
        }}>
          + Add Image Block
        </button>
      </div>
      
      <button type="submit">Create Product</button>
    </form>
  );
}
```

---

### Example 2: Display Story Blocks (Frontend)

```jsx
function ProductStoryDisplay({ product }) {
  return (
    <div className="product-story">
      <h2>Product Story</h2>
      
      {product.storyBlocks
        ?.sort((a, b) => a.order - b.order)
        .map((block, index) => (
          <div key={block._id || index} className="story-block">
            {block.type === 'text' ? (
              <div className="text-block">
                <p>{block.content}</p>
              </div>
            ) : (
              <div className="image-block">
                <img
                  src={block.image.url}
                  alt={block.image.alt}
                  loading="lazy"
                />
                {block.image.caption && (
                  <p className="caption">{block.image.caption}</p>
                )}
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
```

---

## 📝 Testing với Postman

### Test 1: Create Product with Story Blocks

1. **Method**: POST
2. **URL**: `http://localhost:5000/api/products`
3. **Headers**: (none needed for form-data)
4. **Body → form-data**:

```
name: "Test Product"
price: 29.99
category: "Puzzles"

storyBlocks: [
  {
    "type": "text",
    "order": 0,
    "content": "This is the first paragraph of our story..."
  },
  {
    "type": "image",
    "order": 1,
    "image": {
      "caption": "Beautiful craftsmanship",
      "alt": "Craftsman at work"
    }
  },
  {
    "type": "text",
    "order": 2,
    "content": "This continues our story after the image..."
  }
]

storyImages: [Chọn file ảnh] (Đặt tên file: story_1)
```

### Test 2: Update Story Blocks

```
PUT http://localhost:5000/api/products/:id

Body:
storyBlocks: [
  {
    "type": "text",
    "order": 0,
    "content": "UPDATED story text..."
  }
]

deletedStoryImages: ["woodtoy/products/stories/old123"]
```

---

## ⚠️ Validation & Limits

### Story Blocks Limits:
- **Max blocks**: 50 blocks per product
- **Max story images**: 30 images per product
- **Text block max**: 5000 characters
- **Image caption max**: 200 characters
- **Image file size**: 10MB per image
- **Image formats**: JPEG, PNG, WebP, GIF

### Validation Errors:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Maximum 50 story blocks allowed per product",
    "Text block cannot exceed 5000 characters",
    "Invalid storyBlocks format. Must be valid JSON array"
  ]
}
```

---

## 🎨 Best Practices

### 1. Content Organization
- Bắt đầu bằng text block giới thiệu
- Đan xen ảnh và text hợp lý (không quá nhiều text liên tiếp)
- Kết thúc bằng call-to-action hoặc kết luận

### 2. Images
- Sử dụng ảnh chất lượng cao
- Luôn điền alt text cho SEO
- Caption nên mô tả ngắn gọn, súc tích
- Tối ưu kích thước ảnh trước khi upload

### 3. Text Content
- Chia nhỏ thành các đoạn dễ đọc (200-500 từ/block)
- Sử dụng ngôn ngữ hấp dẫn, kể chuyện
- Tập trung vào giá trị và cảm xúc

### 4. Order Management
- Đánh số order từ 0, 1, 2, 3...
- Đảm bảo không có order trùng lặp
- Frontend nên sort theo order trước khi hiển thị

---

## 🔄 Migration từ Story cũ

Nếu bạn đang có sản phẩm với trường `story` (plain text) cũ:

```javascript
// Old format
story: "Long text story..."

// New format (optional migration)
storyBlocks: [
  {
    type: "text",
    order: 0,
    content: "Long text story..." // Copy from old story field
  }
]
```

Trường `story` cũ vẫn được giữ nguyên để backward compatible.

---

## 🐛 Troubleshooting

### 1. "Invalid storyBlocks format"
- Kiểm tra JSON format có đúng không
- Đảm bảo là array, không phải object
- Kiểm tra double quotes trong JSON

### 2. Story images không upload
- Kiểm tra tên file có format `story_0`, `story_1`...
- Đảm bảo field name là `storyImages` (không phải `storyImage`)
- Kiểm tra file size < 10MB

### 3. Blocks không đúng thứ tự
- Kiểm tra field `order` có đúng không
- Frontend cần sort theo order: `.sort((a, b) => a.order - b.order)`

### 4. Ảnh không xóa khi delete block
- Cần gửi `deletedStoryImages` với array of publicIds
- Kiểm tra publicId có đúng format không

---

## 📚 Related Documentation

- [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md) - Cloudinary configuration
- [PRODUCT_API_UPDATE.md](./PRODUCT_API_UPDATE.md) - Product API reference

---

## ✅ Checklist Implementation

- [x] Story block schema (text + image)
- [x] Product model with storyBlocks field
- [x] Create product with story blocks
- [x] Update product story blocks
- [x] Upload story images
- [x] Delete story images
- [x] Auto cleanup on product deletion
- [x] Validation (max 50 blocks, max 30 images)
- [x] Multer middleware support
- [x] Error handling
- [x] Documentation

---

**🎉 Story Blocks Feature is Ready!**

Giờ bạn có thể tạo câu chuyện sản phẩm phong phú với text và ảnh đan xen một cách linh hoạt!

---

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Console logs trong browser DevTools
2. Network tab để xem request/response
3. Backend logs để xem upload errors
4. Cloudinary Dashboard → Media Library





