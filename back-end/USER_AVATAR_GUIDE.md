# User Avatar Upload Guide

## 📋 Tổng quan

Hệ thống cho phép user upload avatar khi cập nhật profile:
- ✅ **1 ảnh avatar** cho mỗi user (tối đa 5MB)
- ✅ Tự động tối ưu hóa: resize 400x400px, crop vuông, focus vào khuôn mặt
- ✅ Tự động xóa avatar cũ khi upload avatar mới
- ✅ Hỗ trợ xóa avatar

---

## 🎯 Tính năng

### Upload Avatar
- Format: JPEG, PNG, WebP, GIF
- Kích thước tối đa: 5MB
- Tự động resize: 400x400px (crop vuông)
- Tự động focus vào khuôn mặt (gravity: face)
- Tự động convert WebP cho browser hỗ trợ
- Lưu trong folder: `woodtoy/avatars/`

### Quản lý Avatar
- Xóa avatar cũ tự động khi upload mới
- Không xóa avatar Google (googleusercontent.com)
- Hỗ trợ xóa avatar thủ công với `removeAvatar: true`

---

## 📖 Cách sử dụng API

### 1. Cập nhật profile với avatar

**Endpoint**: `PUT /api/auth/me`

**Content-Type**: `multipart/form-data`

**Headers**:
```
Authorization: Bearer <access-token>
```

**Body (form-data)**:
```
name: "John Doe" (optional)
email: "john@example.com" (optional)
phoneNumber: "0912345678" (optional)
gender: "male" (optional)
avatar: [file.jpg] (optional) - Ảnh avatar mới
removeAvatar: "true" (optional) - Xóa avatar hiện tại
address: {...} (optional)
```

---

## 🔧 Ví dụ sử dụng

### 1. Upload avatar mới với cURL

```bash
curl -X PUT http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "name=John Doe" \
  -F "avatar=@/path/to/avatar.jpg"
```

### 2. Upload avatar với Postman

1. Mở Postman
2. Tạo request: `PUT http://localhost:5000/api/auth/me`
3. Chọn tab **Authorization** → Type: **Bearer Token** → Paste access token
4. Chọn tab **Body** → **form-data**
5. Thêm các field:
   - `name` (Text): "John Doe"
   - `avatar` (File): Chọn ảnh avatar
6. Click **Send**

### 3. Xóa avatar hiện tại

```bash
curl -X PUT http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "removeAvatar=true"
```

### 4. Cập nhật thông tin khác mà không thay đổi avatar

```bash
curl -X PUT http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "phoneNumber": "0987654321"
  }'
```

**Note**: Nếu không upload avatar, có thể dùng `application/json` thay vì `multipart/form-data`.

---

## 📊 Response Examples

### Success Response

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "0912345678",
      "gender": "male",
      "address": {
        "street": "123 Nguyen Hue",
        "city": "Ho Chi Minh City"
      },
      "role": "user",
      "avatar": "https://res.cloudinary.com/xxx/image/upload/v123/woodtoy/avatars/abc.jpg",
      "provider": "local"
    }
  }
}
```

### Error Response - File too large

```json
{
  "success": false,
  "message": "File too large. Maximum size: 10MB for images, 100MB for videos."
}
```

### Error Response - Invalid file type

```json
{
  "success": false,
  "message": "Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed."
}
```

---

## 🎨 Frontend Integration

### React Example with Axios

```jsx
import axios from 'axios';
import { useState } from 'react';

function ProfileUpdate() {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', name);
    if (file) {
      formData.append('avatar', file);
    }

    try {
      const response = await axios.put(
        'http://localhost:5000/api/auth/me',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      console.log('Profile updated:', response.data);
      // Update UI with new avatar URL
      const newAvatarUrl = response.data.data.user.avatar;
    } catch (error) {
      console.error('Error updating profile:', error.response?.data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
      />
      <button type="submit">Update Profile</button>
    </form>
  );
}
```

### React Example - Remove Avatar

```jsx
const handleRemoveAvatar = async () => {
  const formData = new FormData();
  formData.append('removeAvatar', 'true');

  try {
    const response = await axios.put(
      'http://localhost:5000/api/auth/me',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    
    console.log('Avatar removed:', response.data);
  } catch (error) {
    console.error('Error removing avatar:', error.response?.data);
  }
};
```

### React Example - Image Preview

```jsx
function AvatarUpload() {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file size (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('File too large. Maximum size is 5MB');
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(selectedFile.type)) {
        alert('Invalid file type. Only JPEG, PNG, WebP, and GIF allowed');
        return;
      }

      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
      />
      {preview && (
        <img
          src={preview}
          alt="Avatar preview"
          style={{ width: 100, height: 100, borderRadius: '50%' }}
        />
      )}
    </div>
  );
}
```

---

## 🔐 Bảo mật & Giới hạn

### Giới hạn
- **File size**: Max 5MB
- **File types**: JPEG, PNG, WebP, GIF
- **Dimensions**: Auto-resize to 400x400px
- **Rate limiting**: Nên implement rate limit cho endpoint này

### Bảo vệ
- Chỉ user đã authenticate mới upload được avatar
- Tự động validate file type và size
- Avatar Google không bị xóa
- Auto cleanup khi có lỗi

---

## 🗂️ Cấu trúc trên Cloudinary

```
woodtoy/
  ├── products/      (Product images & videos)
  └── avatars/       (User avatars)
      ├── user1_abc123.jpg
      ├── user2_def456.jpg
      └── ...
```

---

## 🐛 Xử lý lỗi

### 1. "Invalid file type"
- Chỉ chấp nhận: JPEG, PNG, WebP, GIF
- Kiểm tra file extension và mimetype

### 2. "File too large"
- Maximum: 5MB cho avatar
- Nén ảnh trước khi upload

### 3. "Failed to upload avatar"
- Kiểm tra Cloudinary credentials
- Kiểm tra kết nối internet
- Xem logs trong console

### 4. "Unauthorized"
- Kiểm tra access token
- Token có thể đã hết hạn (refresh token)

---

## 💡 Best Practices

1. **Validate phía client trước**
   - Kiểm tra file type và size trước khi gửi
   - Hiển thị preview cho user
   - Nén ảnh nếu quá lớn

2. **Hiển thị progress**
   - Sử dụng upload progress bar
   - Disable button khi đang upload
   - Show loading state

3. **Error handling**
   - Hiển thị lỗi thân thiện với user
   - Retry logic nếu upload fail
   - Fallback avatar nếu không có ảnh

4. **Optimization**
   - Compress ảnh trước upload (client-side)
   - Lazy load avatars
   - Cache avatar URLs

5. **UX**
   - Crop tool cho user chọn vùng ảnh
   - Preview trước khi save
   - Confirm trước khi xóa avatar

---

## 🔄 Migration Notes

- Field `avatar` đã có sẵn trong User model
- Google OAuth users có avatar từ Google (googleusercontent.com)
- Local users có thể upload avatar qua endpoint này
- Avatar cũ sẽ tự động xóa khi upload mới

---

## 📚 Technical Details

### Avatar Transformation
```javascript
{
  width: 400,
  height: 400,
  crop: "fill",           // Fill entire area
  gravity: "face",        // Focus on face if detected
  quality: "auto:good",   // Auto quality
  fetch_format: "auto"    // Auto format (WebP for supported browsers)
}
```

### Storage Location
- Folder: `woodtoy/avatars/`
- Public ID format: `woodtoy/avatars/{unique_id}`
- CDN URL: `https://res.cloudinary.com/{cloud_name}/image/upload/...`

---

## ✅ Testing Checklist

- [ ] Upload avatar mới
- [ ] Replace avatar cũ
- [ ] Xóa avatar với `removeAvatar: true`
- [ ] Test với file quá lớn (>5MB)
- [ ] Test với file type không hợp lệ
- [ ] Test với Google OAuth user
- [ ] Test error handling
- [ ] Verify avatar hiển thị trong response
- [ ] Verify avatar cũ đã xóa khỏi Cloudinary

---

**🎉 Hoàn tất! User có thể upload và quản lý avatar của mình.**


