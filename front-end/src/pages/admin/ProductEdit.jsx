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
  });
  const [images, setImages] = useState([]); // File list cho ảnh mới
  const [video, setVideo] = useState(null); // File cho video mới
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Story Blocks Management
  const [storyBlocks, setStoryBlocks] = useState([]);
  const [storyImages, setStoryImages] = useState({}); // {blockIndex: File}

  useEffect(() => {
    if (isEditing) {
      const fetchProduct = async () => {
        try {
          const res = await getProductById(id);
          const productData = res.data.data.product;
          setProduct(productData);
          
          // Load existing story blocks
          if (productData.storyBlocks && productData.storyBlocks.length > 0) {
            setStoryBlocks(productData.storyBlocks);
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
  const handleVideoChange = (e) => setVideo(e.target.files[0]);

  // Story Blocks Functions
  const addTextBlock = () => {
    setStoryBlocks([
      ...storyBlocks,
      {
        type: "text",
        order: storyBlocks.length,
        content: "",
      },
    ]);
  };

  const addImageBlock = () => {
    setStoryBlocks([
      ...storyBlocks,
      {
        type: "image",
        order: storyBlocks.length,
        image: {},
        caption: "",
        alt: "",
      },
    ]);
  };

  const updateStoryBlock = (index, field, value) => {
    const updated = [...storyBlocks];
    if (field === "content" || field === "caption" || field === "alt") {
      updated[index][field] = value;
    }
    setStoryBlocks(updated);
  };

  const handleStoryImageChange = (index, file) => {
    setStoryImages({
      ...storyImages,
      [index]: file,
    });
  };

  const removeStoryBlock = (index) => {
    const updated = storyBlocks.filter((_, i) => i !== index);
    // Re-order blocks
    updated.forEach((block, i) => {
      block.order = i;
    });
    setStoryBlocks(updated);
    
    // Remove image if exists
    const newImages = { ...storyImages };
    delete newImages[index];
    setStoryImages(newImages);
  };

  const moveStoryBlock = (index, direction) => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= storyBlocks.length) return;

    const updated = [...storyBlocks];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    
    // Update order
    updated[index].order = index;
    updated[newIndex].order = newIndex;
    
    setStoryBlocks(updated);
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

    for (let i = 0; i < images.length; i++) {
      formData.append("images", images[i]);
    }

    if (video) {
      formData.append("video", video);
    }

    // Add story blocks
    if (storyBlocks.length > 0) {
      // Create a clean version of storyBlocks (without local preview data)
      const cleanStoryBlocks = storyBlocks.map((block, index) => {
        if (block.type === "text") {
          return {
            type: "text",
            order: index,
            content: block.content || "",
          };
        } else {
          // For image blocks, keep existing image data if no new image
          return {
            type: "image",
            order: index,
            image: block.image || {},
            caption: block.caption || "",
            alt: block.alt || "",
          };
        }
      });
      
      formData.append("storyBlocks", JSON.stringify(cleanStoryBlocks));
      
      // Add story images with index mapping
      Object.keys(storyImages).forEach((index) => {
        // Use field name pattern: storyImage_0, storyImage_1, etc.
        formData.append(`storyImage_${index}`, storyImages[index]);
      });
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

        {/* Story Blocks Management */}
        <div className="border-t pt-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span>📖</span> Story Blocks (Text & Ảnh đan xen)
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Tạo câu chuyện phong phú với văn bản và hình ảnh xen kẽ nhau
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={addTextBlock}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                <span>📝</span> Thêm Text
              </button>
              <button
                type="button"
                onClick={addImageBlock}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
              >
                <span>🖼️</span> Thêm Ảnh
              </button>
            </div>
          </div>

          {/* Story Blocks List */}
          {storyBlocks.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed rounded-lg p-8 text-center text-gray-500">
              <p className="text-lg">Chưa có story block nào</p>
              <p className="text-sm mt-2">Nhấn "Thêm Text" hoặc "Thêm Ảnh" để bắt đầu</p>
            </div>
          ) : (
            <div className="space-y-4">
              {storyBlocks.map((block, index) => (
                <div
                  key={index}
                  className="bg-white border-2 border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-bold">
                        #{index + 1}
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {block.type === "text" ? "📝 Text" : "🖼️ Ảnh"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => moveStoryBlock(index, "up")}
                        disabled={index === 0}
                        className="text-gray-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed p-1"
                        title="Di chuyển lên"
                      >
                        ⬆️
                      </button>
                      <button
                        type="button"
                        onClick={() => moveStoryBlock(index, "down")}
                        disabled={index === storyBlocks.length - 1}
                        className="text-gray-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed p-1"
                        title="Di chuyển xuống"
                      >
                        ⬇️
                      </button>
                      <button
                        type="button"
                        onClick={() => removeStoryBlock(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Xóa block"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Text Block */}
                  {block.type === "text" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nội dung văn bản
                      </label>
                      <textarea
                        value={block.content || ""}
                        onChange={(e) =>
                          updateStoryBlock(index, "content", e.target.value)
                        }
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="4"
                        placeholder="Nhập nội dung văn bản..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {block.content?.length || 0} / 5000 ký tự
                      </p>
                    </div>
                  )}

                  {/* Image Block */}
                  {block.type === "image" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hình ảnh
                        </label>
                        <input
                          type="file"
                          onChange={(e) =>
                            handleStoryImageChange(index, e.target.files[0])
                          }
                          accept="image/*"
                          className="w-full p-2 border rounded-lg"
                        />
                        {/* Show preview */}
                        {storyImages[index] && (
                          <div className="mt-2 relative inline-block">
                            <img
                              src={URL.createObjectURL(storyImages[index])}
                              alt="Preview"
                              className="h-32 rounded-lg border-2 border-green-500"
                            />
                            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                              Ảnh mới
                            </span>
                          </div>
                        )}
                        {/* Show existing image if editing */}
                        {!storyImages[index] && block.image?.url && (
                          <div className="mt-2 relative inline-block">
                            <img
                              src={block.image.url}
                              alt={block.image.alt || "Story image"}
                              className="h-32 rounded-lg border-2 border-gray-300"
                            />
                            <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                              Hiện tại
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mô tả ảnh (Caption)
                        </label>
                        <input
                          type="text"
                          value={block.caption || ""}
                          onChange={(e) =>
                            updateStoryBlock(index, "caption", e.target.value)
                          }
                          className="w-full p-2 border rounded-lg"
                          placeholder="VD: Quy trình làm đồ chơi gỗ thủ công..."
                          maxLength="200"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {block.caption?.length || 0} / 200 ký tự
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Alt Text (SEO)
                        </label>
                        <input
                          type="text"
                          value={block.alt || ""}
                          onChange={(e) =>
                            updateStoryBlock(index, "alt", e.target.value)
                          }
                          className="w-full p-2 border rounded-lg"
                          placeholder="VD: wooden-toy-making-process"
                          maxLength="100"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {block.alt?.length || 0} / 100 ký tự
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {storyBlocks.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>📊 Thống kê:</strong> {storyBlocks.length} blocks (
                {storyBlocks.filter((b) => b.type === "text").length} text,{" "}
                {storyBlocks.filter((b) => b.type === "image").length} ảnh) • 
                Tối đa: 50 blocks
              </p>
            </div>
          )}
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
          <label className="block text-gray-700">
            Ảnh sản phẩm (có thể chọn nhiều)
          </label>
          <input
            type="file"
            onChange={handleImageChange}
            className="w-full mt-1"
            multiple
            accept="image/*"
          />
        </div>
        <div>
          <label className="block text-gray-700">Video sản phẩm (chọn 1)</label>
          <input
            type="file"
            onChange={handleVideoChange}
            className="w-full mt-1"
            accept="video/*"
          />
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
