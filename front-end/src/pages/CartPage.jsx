import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getCart,
  updateCartItemQuantity,
  removeFromCart,
} from "../service/api";
import useAuthStore from "../store/authStore";

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchCartCount = useAuthStore((state) => state.fetchCartCount); // Lấy action cập nhật count
  const navigate = useNavigate();

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
    if (newQuantity < 1) return; // Số lượng không thể nhỏ hơn 1
    try {
      const res = await updateCartItemQuantity(productId, newQuantity);
      setCart(res.data.data.cart); // Cập nhật state giỏ hàng
      fetchCartCount(); // Cập nhật số lượng trên navbar
    } catch (err) {
      alert(err.response?.data?.message || "Cập nhật số lượng thất bại.");
    }
  };

  const handleRemoveItem = async (productId, productName) => {
    if (
      window.confirm(`Bạn có chắc muốn xóa "${productName}" khỏi giỏ hàng?`)
    ) {
      try {
        const res = await removeFromCart(productId);
        setCart(res.data.data.cart); // Cập nhật state giỏ hàng
        fetchCartCount(); // Cập nhật số lượng trên navbar
      } catch (err) {
        alert(err.response?.data?.message || "Xóa sản phẩm thất bại.");
      }
    }
  };

  if (loading)
    return <div className="text-center py-20">Đang tải giỏ hàng...</div>;
  if (error)
    return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold mb-4">
          Giỏ hàng của bạn đang trống
        </h2>
        <Link
          to="/"
          className="text-amber-600 hover:text-amber-800 font-medium"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Giỏ hàng</h1>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul role="list" className="divide-y divide-gray-200">
            {cart.items.map((item) => (
              <li
                key={item.product._id}
                className="px-4 py-6 sm:px-6 flex items-center space-x-4"
              >
                <img
                  src={
                    item.productSnapshot?.image ||
                    item.product?.primaryImage ||
                    "/placeholder.jpg"
                  }
                  alt={item.productSnapshot?.name || item.product?.name}
                  className="w-20 h-20 rounded-md object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-medium text-gray-900 truncate">
                    <Link
                      to={`/products/${item.product._id}`}
                      className="hover:text-amber-600"
                    >
                      {item.productSnapshot?.name || item.product?.name}
                    </Link>
                  </h2>
                  <p className="text-sm text-gray-500">
                    {item.price?.toLocaleString("vi-VN")}₫
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <label
                    htmlFor={`quantity-${item.product._id}`}
                    className="sr-only"
                  >
                    Quantity
                  </label>
                  <input
                    id={`quantity-${item.product._id}`}
                    type="number"
                    min="1"
                    max={item.product?.stock || 99} // Giới hạn max theo tồn kho
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(
                        item.product._id,
                        parseInt(e.target.value)
                      )
                    }
                    className="w-16 border border-gray-300 rounded-md text-center"
                  />
                  <button
                    onClick={() =>
                      handleRemoveItem(
                        item.product._id,
                        item.productSnapshot?.name || item.product?.name
                      )
                    }
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Xóa sản phẩm"
                  >
                    {/* SVG Icon Xóa */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-base font-medium text-gray-900 w-24 text-right">
                  {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Summary */}
        <div className="mt-8 bg-white shadow sm:rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Tổng cộng</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-base text-gray-700">
              <span>Tạm tính</span>
              <span>{cart.totalPrice.toLocaleString("vi-VN")}₫</span>
            </div>
            {/* Bạn có thể thêm Phí vận chuyển, Giảm giá ở đây nếu cần */}
            <div className="flex justify-between text-lg font-semibold text-gray-900 border-t pt-4 mt-4">
              <span>Tổng tiền</span>
              <span>{cart.totalPrice.toLocaleString("vi-VN")}₫</span>
            </div>
          </div>
          <div className="mt-6">
            <Link
              to="/checkout"
              className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-amber-600 hover:bg-amber-700"
            >
              Tiến hành thanh toán
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
