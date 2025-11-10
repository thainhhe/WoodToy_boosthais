import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getCart,
  updateCartItemQuantity,
  removeFromCart,
} from "../service/api";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import { useConfirm } from "../components/ConfirmDialog";

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingItem, setUpdatingItem] = useState(null);
  const fetchCartCount = useAuthStore((state) => state.fetchCartCount);
  const navigate = useNavigate();
  const { confirm, ConfirmDialog } = useConfirm();

  const loadCart = async () => {
    setError("");
    setLoading(true);
    try {
      const fetchedCart = await getCart();
      if (fetchedCart) {
        setCart(fetchedCart);
      } else {
        setError("Không thể tải giỏ hàng. Vui lòng đăng nhập lại.");
        // Optional: logout user here if token is invalid
      }
    } catch (err) {
      console.error("Load cart error:", err);
      setError("Đã xảy ra lỗi khi tải giỏ hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdatingItem(productId);
    try {
      const res = await updateCartItemQuantity(productId, newQuantity);
      setCart(res.data.data.cart);
      fetchCartCount();
      toast.success("Cập nhật số lượng thành công!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Cập nhật số lượng thất bại.");
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (productId, productName) => {
    const confirmed = await confirm({
      title: "Xóa sản phẩm",
      message: `Bạn có chắc muốn xóa "${productName}" khỏi giỏ hàng?`,
    });

    if (confirmed) {
      setUpdatingItem(productId);
      try {
        const res = await removeFromCart(productId);
        setCart(res.data.data.cart);
        fetchCartCount();
        toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
      } catch (err) {
        toast.error(err.response?.data?.message || "Xóa sản phẩm thất bại.");
      } finally {
        setUpdatingItem(null);
      }
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải giỏ hàng...</p>
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

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-2xl shadow-xl max-w-md">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Giỏ hàng trống
          </h2>
          <p className="text-gray-600 mb-6">
            Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm!
          </p>
          <Link
            to="/"
            className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition transform hover:scale-105"
          >
            Khám phá sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8 sm:py-12">
      <ConfirmDialog />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🛒 Giỏ hàng của bạn
          </h1>
          <p className="text-gray-600">
            Bạn có{" "}
            <span className="font-semibold text-amber-600">
              {cart.items.length}
            </span>{" "}
            sản phẩm trong giỏ hàng
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.product._id}
                className={`bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden ${
                  updatingItem === item.product._id ? "opacity-60" : ""
                }`}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <Link
                      to={`/products/${item.product._id}`}
                      className="flex-shrink-0"
                    >
                      <img
                        src={
                          item.productSnapshot?.image ||
                          item.product?.primaryImage ||
                          "/placeholder.jpg"
                        }
                        alt={item.productSnapshot?.name || item.product?.name}
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover border border-gray-200 hover:scale-105 transition-transform duration-200"
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/products/${item.product._id}`}
                        className="block"
                      >
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 hover:text-amber-600 transition-colors line-clamp-2">
                          {item.productSnapshot?.name || item.product?.name}
                        </h3>
                      </Link>
                      <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-amber-600 font-semibold text-lg">
                          {item.price?.toLocaleString("vi-VN")}₫
                        </p>
                        {/* Hard-coded original price (UI-only) */}
                        <p className="text-sm text-gray-400 line-through">
                          399.000₫
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="mt-4 flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600 font-medium">
                            Số lượng:
                          </label>
                          <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.product._id,
                                  item.quantity - 1
                                )
                              }
                              disabled={
                                item.quantity <= 1 ||
                                updatingItem === item.product._id
                              }
                              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={item.product?.stock || 99}
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.product._id,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              disabled={updatingItem === item.product._id}
                              className="w-16 text-center border-0 focus:ring-0 font-semibold"
                            />
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.product._id,
                                  item.quantity + 1
                                )
                              }
                              disabled={
                                item.quantity >= (item.product?.stock || 99) ||
                                updatingItem === item.product._id
                              }
                              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() =>
                            handleRemoveItem(
                              item.product._id,
                              item.productSnapshot?.name || item.product?.name
                            )
                          }
                          disabled={updatingItem === item.product._id}
                          className="flex items-center gap-1 text-red-500 hover:text-red-700 font-medium transition disabled:opacity-50"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Xóa
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Tổng:</span>
                          <span className="text-xl font-bold text-amber-600">
                            {(item.price * item.quantity).toLocaleString(
                              "vi-VN"
                            )}
                            ₫
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span>💰</span> Tổng đơn hàng
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Tạm tính:</span>
                  <span className="font-semibold">
                    {cart.totalPrice.toLocaleString("vi-VN")}₫
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Phí vận chuyển:</span>
                  <span className="font-semibold text-green-600">Miễn phí</span>
                </div>
                <div className="border-t-2 border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      Tổng cộng:
                    </span>
                    <span className="text-2xl font-bold text-amber-600">
                      {cart.totalPrice.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full flex justify-center items-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
                Thanh toán ngay
              </Link>

              <Link
                to="/"
                className="mt-4 w-full flex justify-center items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-amber-500 hover:text-amber-600 transition-all duration-200"
              >
                ← Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
