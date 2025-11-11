// front-end/src/pages/admin/ProductEdit.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getProductById,
  createProduct,
  updateProduct,
} from "../../service/api";
import LoadingOverlay from "../../components/LoadingOverlay";

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    youtubeUrl: "",
  });
  const [images, setImages] = useState([]); // File list cho ảnh mới
  const [videos, setVideos] = useState([]); // File list cho video mới
  const [existingImages, setExistingImages] = useState([]); // Danh sách ảnh hiện có
  const [existingVideos, setExistingVideos] = useState([]); // Danh sách video hiện có
  const [deletedImages, setDeletedImages] = useState([]); // Danh sách ảnh cần xóa
  const [deletedVideos, setDeletedVideos] = useState([]); // Danh sách video cần xóa
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const fetchProduct = async () => {
        try {
          const res = await getProductById(id);
          const productData = res.data.data.product;
          setProduct(productData);
          
          // Load existing images
          if (productData.images && productData.images.length > 0) {
            setExistingImages(productData.images);
          }
          
          // Load existing videos
          if (productData.videos && productData.videos.length > 0) {
            setExistingVideos(productData.videos);
          } else if (productData.video) {
            // Support legacy single video
            setExistingVideos([productData.video]);
          }
        } catch (error) {
          console.error("Failed to fetch product:", error);
          toast.error("Không tìm thấy sản phẩm!");
        }
      };
      fetchProduct();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => setImages(e.target.files);
  const handleVideoChange = (e) => setVideos(Array.from(e.target.files || []));
  
  const handleDeleteImage = (publicId) => {
    // Remove from existing images
    setExistingImages(prev => prev.filter(img => img.publicId !== publicId));
    // Add to deleted list
    setDeletedImages(prev => [...prev, publicId]);
  };
  
  const handleDeleteVideo = (publicId) => {
    // Remove from existing videos
    setExistingVideos(prev => prev.filter(v => v.publicId !== publicId));
    // Add to deleted list
    setDeletedVideos(prev => [...prev, publicId]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();

    for (const key in product) {
      if (product[key] !== null && product[key] !== undefined) {
        formData.append(key, product[key]);
      }
    }

    // Append new images
    for (let i = 0; i < images.length; i++) {
      formData.append("images", images[i]);
    }

    // Append new videos
    for (let i = 0; i < videos.length; i++) {
      formData.append("videos", videos[i]);
    }

    // Append deleted images
    if (deletedImages.length > 0) {
      formData.append("deletedImages", JSON.stringify(deletedImages));
    }

    // Append deleted videos
    if (deletedVideos.length > 0) {
      formData.append("deletedVideos", JSON.stringify(deletedVideos));
    }

    try {
      if (isEditing) {
        await updateProduct(id, formData);
        toast.success("Cập nhật sản phẩm thành công!");
      } else {
        await createProduct(formData);
        toast.success("Tạo sản phẩm thành công!");
      }
      navigate("/admin/products");
    } catch (error) {
      console.error("Failed to save product:", error.response?.data || error);
      toast.error("Lưu sản phẩm thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <LoadingOverlay
        isLoading={isSubmitting}
        message={isEditing ? "Đang cập nhật sản phẩm..." : "Đang tạo sản phẩm..."}
      />
      <h1 className="text-3xl font-bold mb-6">
        {isEditing ? `Chỉnh sửa: ${product.name}` : "Thêm sản phẩm mới"}
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md space-y-6"
      >
        <div>
          <label className="block text-gray-700">Tên sản phẩm</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Mô tả</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
            rows="4"
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label>Giá</label>
            <input
              type="number"
              name="price"
              value={product.price}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded"
              required
            />
          </div>
          <div>
            <label>Tồn kho</label>
            <input
              type="number"
              name="stock"
              value={product.stock}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded"
              required
            />
          </div>
          <div>
            <label>Danh mục</label>
            <input
              type="text"
              name="category"
              value={product.category}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Link YouTube (tùy chọn)</label>
          <input
            type="text"
            name="youtubeUrl"
            value={product.youtubeUrl}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <p className="text-sm text-gray-500 mt-1">Nhập link YouTube để hiển thị video giới thiệu sản phẩm</p>
        </div>
        <div>
          <label className="block text-gray-700 mb-2">
            Ảnh sản phẩm (có thể chọn nhiều)
          </label>
          <input
            type="file"
            onChange={handleImageChange}
            className="w-full mt-1"
            multiple
            accept="image/*"
          />
          
          {/* Hiển thị danh sách ảnh hiện có */}
          {existingImages.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">Ảnh hiện có:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {existingImages.map((image) => (
                  <div
                    key={image.publicId}
                    className="relative border border-gray-300 rounded-lg overflow-hidden bg-gray-50 group"
                  >
                    <img
                      src={image.url}
                      alt={image.alt || "Product image"}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(image.publicId)}
                        className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                        title="Xóa ảnh"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    {image.isPrimary && (
                      <div className="absolute bottom-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded">
                        Chính
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Hiển thị ảnh mới được chọn */}
          {images.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Ảnh mới đã chọn ({images.length}):
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Array.from(images).map((image, index) => (
                  <div
                    key={index}
                    className="border border-blue-300 rounded-lg overflow-hidden bg-blue-50"
                  >
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`New image ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <p className="text-xs text-gray-600 p-2 truncate">
                      {image.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div>
          <label className="block text-gray-700 mb-2">
            Video sản phẩm (có thể chọn nhiều)
          </label>
          <input
            type="file"
            onChange={handleVideoChange}
            className="w-full mt-1"
            accept="video/*"
            multiple
          />
          
          {/* Hiển thị danh sách video hiện có */}
          {existingVideos.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">Video hiện có:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {existingVideos.map((video) => (
                  <div
                    key={video.publicId}
                    className="relative border border-gray-300 rounded-lg p-3 bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt="Video thumbnail"
                          className="w-16 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.006v3.988a1 1 0 001.555.832l3.197-1.994a1 1 0 000-1.664l-3.197-1.994z" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 truncate">
                          {video.url.split('/').pop()}
                        </p>
                        {video.duration && (
                          <p className="text-xs text-gray-500">
                            {Math.floor(video.duration)}s
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteVideo(video.publicId)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Xóa video"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Hiển thị video mới được chọn */}
          {videos.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Video mới đã chọn ({videos.length}):
              </p>
              <div className="space-y-2">
                {Array.from(videos).map((video, index) => (
                  <div
                    key={index}
                    className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded p-2"
                  >
                    {video.name} ({(video.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="bg-gray-300 text-gray-800 py-2 px-4 rounded"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="bg-amber-600 text-white py-2 px-4 rounded font-bold hover:bg-amber-700"
          >
            {isEditing ? "Lưu thay đổi" : "Tạo sản phẩm"}
          </button>
        </div>
      </form>
    </div>
  );
}
