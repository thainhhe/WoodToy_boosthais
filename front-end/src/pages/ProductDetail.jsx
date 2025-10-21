// front-end/src/pages/ProductDetail.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, addToCart } from "../service/api";
import useAuthStore from "../store/authStore";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate(); // MỚI
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const user = useAuthStore((state) => state.user);
  const [isAdding, setIsAdding] = useState(false);
  const [addCartMessage, setAddCartMessage] = useState({ type: "", text: "" });
  const fetchCartCount = useAuthStore((state) => state.fetchCartCount);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await getProductById(id);
        const fetchedProduct = res.data.data.product;
        setProduct(fetchedProduct);

        // Ưu tiên hiển thị ảnh primary, sau đó đến video, rồi đến ảnh đầu tiên
        const primaryImage = fetchedProduct.images?.find((m) => m.isPrimary);
        if (primaryImage) {
          setSelectedMedia({ ...primaryImage, type: "image" });
        } else if (fetchedProduct.video) {
          setSelectedMedia({ ...fetchedProduct.video, type: "video" });
        } else if (fetchedProduct.images?.length > 0) {
          setSelectedMedia({ ...fetchedProduct.images[0], type: "image" });
        }
      } catch (err) {
        setError("Không thể tải thông tin sản phẩm.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Debug: Log user state when component mounts or user changes
  useEffect(() => {
    console.log("ProductDetail - User state:", user);
    console.log("ProductDetail - User from localStorage:", localStorage.getItem("user"));
    console.log("ProductDetail - Token from localStorage:", localStorage.getItem("accessToken"));
  }, [user]);

  // MỚI: Hàm xử lý khi nhấn nút "Thêm vào giỏ hàng"
  const handleAddToCart = async () => {
    // Debug: Kiểm tra user và token
    const token = localStorage.getItem("accessToken");
    console.log("User object:", user);
    console.log("Token exists:", !!token);
    
    if (!user) {
      // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
      alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      navigate("/login");
      return;
    }

    if (product.stock === 0) {
      setAddCartMessage({ type: "error", text: "Sản phẩm đã hết hàng." });
      return;
    }

    setIsAdding(true);
    setAddCartMessage({ type: "", text: "" }); // Reset thông báo

    try {
      await addToCart(product._id, 1); // Thêm 1 sản phẩm
      setAddCartMessage({
        type: "success",
        text: "Đã thêm sản phẩm vào giỏ hàng!",
      });
      fetchCartCount();
      // Tùy chọn: Cập nhật số lượng trong giỏ hàng trên Navbar (sẽ làm ở bước sau)
    } catch (err) {
      console.error("Add to cart error:", err);
      // Xử lý lỗi cụ thể hơn dựa trên response từ API
      if (err.response?.status === 401) {
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        // Có thể gọi hàm logout ở đây và chuyển hướng
        navigate("/login");
      } else if (err.message === "User not authenticated") {
        alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
        navigate("/login");
      } else {
        setAddCartMessage({
          type: "error",
          text: err.response?.data?.message || "Thêm vào giỏ hàng thất bại.",
        });
      }
    } finally {
      setIsAdding(false);
      // Tự động ẩn thông báo sau vài giây
      setTimeout(() => setAddCartMessage({ type: "", text: "" }), 3000);
    }
  };

  if (loading) return <div className="text-center py-20">Đang tải...</div>;
  if (error)
    return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!product)
    return <div className="text-center py-20">Không tìm thấy sản phẩm.</div>;

  // Gộp tất cả media vào một mảng để render thumbnail
  const allMedia = [
    ...(product.images?.map((img) => ({ ...img, type: "image" })) || []),
    ...(product.video ? [{ ...product.video, type: "video" }] : []),
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="pt-6 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-2 lg:gap-x-8">
          {/* Media gallery */}
          <div className="flex flex-col items-center">
            <div className="w-full max-h-[550px] aspect-w-1 aspect-h-1 rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center">
              {selectedMedia?.type === "image" ? (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.alt || product.name}
                  className="w-full h-full object-center object-contain"
                />
              ) : (
                <video
                  src={selectedMedia?.url}
                  controls
                  poster={selectedMedia?.thumbnail}
                  className="w-full h-full object-center object-contain"
                />
              )}
            </div>

            <div className="mt-4 flex space-x-4 overflow-x-auto py-2">
              {allMedia.map((mediaItem, index) => (
                <button
                  key={mediaItem.publicId || index}
                  className={`flex-shrink-0 w-24 h-24 rounded-md overflow-hidden border-2 ${
                    selectedMedia?.url === mediaItem.url
                      ? "border-amber-500"
                      : "border-transparent"
                  }`}
                  onClick={() => setSelectedMedia(mediaItem)}
                >
                  {mediaItem.type === "image" ? (
                    <img
                      src={mediaItem.url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 relative">
                      <img
                        src={mediaItem.thumbnail || "/placeholder.jpg"}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <svg
                          className="h-8 w-8 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.006v3.988a1 1 0 001.555.832l3.197-1.994a1 1 0 000-1.664l-3.197-1.994z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Product info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              {product.name}
            </h1>
            <p className="text-3xl text-gray-900 mt-3">
              {product.price.toLocaleString("vi-VN")}₫
            </p>

            <div className="mt-6">
              <h3 className="text-xl font-medium text-gray-900">Mô tả</h3>
              <p className="text-base text-gray-700 mt-2">
                {product.description}
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-medium text-gray-900">Câu chuyện</h3>
              <p className="text-base text-gray-700 mt-2">{product.story}</p>
            </div>

            <div className="mt-6">
              <p className="text-base text-gray-600">
                Còn lại: {product.stock} sản phẩm
              </p>
            </div>

            <div className="mt-10">
              <button
                onClick={handleAddToCart}
                disabled={isAdding || product.stock === 0} // Disable nút khi đang thêm hoặc hết hàng
                className={`max-w-xs flex-1 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white transition ${
                  product.stock === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-amber-600 hover:bg-amber-700"
                } ${isAdding ? "opacity-70 cursor-wait" : ""}`}
              >
                {isAdding ? "Đang thêm..." : "Thêm vào giỏ hàng"}
              </button>
              {/* Hiển thị thông báo */}
              {addCartMessage.text && (
                <p
                  className={`mt-4 text-sm font-medium ${
                    addCartMessage.type === "success"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {addCartMessage.text}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
