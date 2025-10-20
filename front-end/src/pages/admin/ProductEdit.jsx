// front-end/src/pages/admin/ProductEdit.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getProductById,
  createProduct,
  updateProduct,
} from "../../service/api";

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [product, setProduct] = useState({
    name: "",
    description: "",
    story: "",
    price: "",
    category: "",
    stock: "",
  });
  const [images, setImages] = useState([]); // File list cho ảnh mới
  const [video, setVideo] = useState(null); // File cho video mới

  useEffect(() => {
    if (isEditing) {
      const fetchProduct = async () => {
        try {
          const res = await getProductById(id);
          // Không set images và video cũ vào state file input
          setProduct(res.data.data.product);
        } catch (error) {
          console.error("Failed to fetch product:", error);
          alert("Không tìm thấy sản phẩm!");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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

    try {
      if (isEditing) {
        await updateProduct(id, formData);
        alert("Cập nhật sản phẩm thành công!");
      } else {
        await createProduct(formData);
        alert("Tạo sản phẩm thành công!");
      }
      navigate("/admin/products");
    } catch (error) {
      console.error("Failed to save product:", error.response?.data || error);
      alert("Lưu sản phẩm thất bại!");
    }
  };

  return (
    <div>
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
        <div>
          <label className="block text-gray-700">Câu chuyện</label>
          <textarea
            name="story"
            value={product.story}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
            rows="3"
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
