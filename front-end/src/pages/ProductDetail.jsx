// front-end/src/pages/ProductDetail.jsx

import { useState, useEffect } from "react";
import QRCodeGenerator from "../components/QRCodeGenerator";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, addToCart } from "../service/api";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

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

        // Debug: Log product data to check videos
        console.log("Product data:", fetchedProduct);
        console.log("Product videos:", fetchedProduct.videos);
        console.log("Product video (legacy):", fetchedProduct.video);

        // Ưu tiên hiển thị ảnh primary, sau đó đến video đầu tiên, rồi đến ảnh đầu tiên
        const primaryImage = fetchedProduct.images?.find((m) => m.isPrimary);
        if (primaryImage) {
          setSelectedMedia({ ...primaryImage, type: "image" });
        } else if (fetchedProduct.videos && fetchedProduct.videos.length > 0) {
          setSelectedMedia({ ...fetchedProduct.videos[0], type: "video" });
        } else if (fetchedProduct.video) {
          // Legacy single video support
          setSelectedMedia({ ...fetchedProduct.video, type: "video" });
        } else if (fetchedProduct.images && fetchedProduct.images.length > 0) {
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
    console.log(
      "ProductDetail - User from localStorage:",
      localStorage.getItem("user")
    );
    console.log(
      "ProductDetail - Token from localStorage:",
      localStorage.getItem("accessToken")
    );
  }, [user]);

  // MỚI: Hàm xử lý khi nhấn nút "Thêm vào giỏ hàng"
  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      navigate("/login");
      return;
    }

    if (product.stock === 0) {
      toast.error("Sản phẩm đã hết hàng.");
      return;
    }

    setIsAdding(true);

    try {
      await addToCart(product._id, 1);
      toast.success("Đã thêm sản phẩm vào giỏ hàng! 🎉");
      fetchCartCount();
    } catch (err) {
      console.error("Add to cart error:", err);
      if (err.response?.status === 401) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        navigate("/login");
      } else if (err.message === "User not authenticated") {
        toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
        navigate("/login");
      } else {
        toast.error(err.response?.data?.message || "Thêm vào giỏ hàng thất bại.");
      }
    } finally {
      setIsAdding(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải sản phẩm...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-6xl mb-4">😔</div>
          <p className="text-red-500 text-lg font-medium">{error}</p>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-700 text-lg font-medium">Không tìm thấy sản phẩm.</p>
        </div>
      </div>
    );

  // Gộp tất cả media vào một mảng để render thumbnail
  const images = product.images || [];
  const videos = product.videos || [];
  const legacyVideo = product.video;
  
  // Map images
  const imageMedia = images.map((img) => ({ ...img, type: "image" }));
  
  // Map videos from videos array
  const videoMedia = videos.map((video) => ({ ...video, type: "video" }));
  
  // Add legacy single video if it exists and is not already in videos array
  const legacyVideoMedia = legacyVideo && !videos.some(v => v.publicId === legacyVideo.publicId)
    ? [{ ...legacyVideo, type: "video" }]
    : [];
  
  const allMedia = [...imageMedia, ...videoMedia, ...legacyVideoMedia];
  
  // Debug log
  console.log("All media count:", allMedia.length);
  console.log("Images count:", imageMedia.length);
  console.log("Videos count:", videoMedia.length);
  console.log("Legacy video:", legacyVideoMedia.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 sm:p-10">
            {/* Media Gallery */}
            <div className="space-y-4">
              <div className="relative bg-gray-50 rounded-2xl overflow-hidden shadow-inner border border-gray-200">
                <div className="aspect-w-1 aspect-h-1 w-full min-h-[400px] flex items-center justify-center">
                  {selectedMedia?.type === "image" ? (
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.alt || product.name}
                      className="w-full h-full object-contain p-4"
                    />
                  ) : (
                    <video
                      src={selectedMedia?.url}
                      controls
                      poster={selectedMedia?.thumbnail}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                {allMedia.map((mediaItem, index) => (
                  <button
                    key={mediaItem.publicId || index}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                      selectedMedia?.url === mediaItem.url
                        ? "border-amber-500 shadow-md"
                        : "border-gray-200 hover:border-amber-300"
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
                          <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.006v3.988a1 1 0 001.555.832l3.197-1.994a1 1 0 000-1.664l-3.197-1.994z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="flex-1">
                {/* Category Badge */}
                {product.category && (
                  <span className="inline-block bg-amber-100 text-amber-800 text-sm font-medium px-3 py-1 rounded-full mb-4">
                    {product.category}
                  </span>
                )}

                <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {product.name}
                </h1>

                {/* Price */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 mb-6 border border-amber-200">
                  <p className="text-sm text-gray-600 mb-1">Giá</p>
                  <p className="text-4xl font-bold text-amber-600">
                    {product.price.toLocaleString("vi-VN")}₫
                  </p>
                </div>

                {/* Stock Info */}
                <div className="flex items-center gap-2 mb-6">
                  {product.stock > 0 ? (
                    <>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="text-green-700 font-medium">
                        Còn {product.stock} sản phẩm
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <p className="text-red-700 font-medium">Hết hàng</p>
                    </>
                  )}
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <span>📝</span> Mô tả sản phẩm
                  </h3>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {product.description || "Chưa có mô tả cho sản phẩm này."}
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || product.stock === 0}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 transform flex items-center justify-center gap-2 ${
                    product.stock === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 hover:scale-105 shadow-lg hover:shadow-xl"
                  } ${isAdding ? "opacity-70" : ""}`}
                >
                  {isAdding ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang thêm...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {product.stock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
                    </>
                  )}
                </button>

                {/* QR Code */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <QRCodeGenerator
                        url={window.location.origin + "/products/" + id}
                        size={100}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        📱 Chia sẻ sản phẩm
                      </p>
                      <p className="text-xs text-gray-600">
                        Quét mã QR để xem trên điện thoại
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
