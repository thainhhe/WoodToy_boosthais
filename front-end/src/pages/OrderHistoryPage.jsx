import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUserOrders } from "../service/api";
import useAuthStore from "../store/authStore";

// Hàm helper để định dạng ngày tháng
const formatDate = (dateString) => {
  if (!dateString) return "";
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("vi-VN", options);
};

// Hàm helper để lấy màu sắc và icon theo trạng thái đơn hàng
const getStatusStyle = (status) => {
  switch (status) {
    case "Pending":
      return {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Chờ xác nhận",
        icon: "⏳",
      };
    case "Confirmed":
      return {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        label: "Đã xác nhận",
        icon: "✓",
      };
    case "Processing":
      return {
        color: "bg-indigo-100 text-indigo-800 border-indigo-200",
        label: "Đang xử lý",
        icon: "⚙️",
      };
    case "Shipping":
      return {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        label: "Đang giao hàng",
        icon: "🚚",
      };
    case "Delivered":
      return {
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Đã giao hàng",
        icon: "✅",
      };
    case "Cancelled":
      return {
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Đã hủy",
        icon: "❌",
      };
    case "Refunded":
      return {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        label: "Đã hoàn tiền",
        icon: "💰",
      };
    default:
      return {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        label: status,
        icon: "📦",
      };
  }
};

// Hàm helper để lấy màu thanh toán
const getPaymentStatusStyle = (paymentStatus) => {
  return paymentStatus === "Paid"
    ? { color: "text-green-600", label: "Đã thanh toán", icon: "✓" }
    : { color: "text-orange-600", label: "Chưa thanh toán", icon: "⏳" };
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState(null);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setError("Vui lòng đăng nhập để xem lịch sử đơn hàng.");
        setLoading(false);
        return;
      }

      setError("");
      setLoading(true);
      try {
        const res = await getUserOrders(); // Mặc định lấy trang 1, 10 item
        setOrders(res.data.data || []);
        setPagination(res.data.pagination);
      } catch (err) {
        console.error("Fetch orders error:", err);
        setError("Không thể tải lịch sử đơn hàng.");
        if (err.response?.status === 401) {
          setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          // Optional: handle logout
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]); // Chạy lại khi user thay đổi (đăng nhập/đăng xuất)

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải lịch sử đơn hàng...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-6xl mb-4">😔</div>
          <p className="text-red-500 text-lg font-medium">{error}</p>
          <Link
            to="/"
            className="mt-4 inline-block bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-2xl shadow-xl max-w-md">
          <div className="text-8xl mb-6">🛍️</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Chưa có đơn hàng nào
          </h2>
          <p className="text-gray-600 mb-6">
            Hãy bắt đầu khám phá và mua sắm những sản phẩm tuyệt vời!
          </p>
          <Link
            to="/"
            className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition transform hover:scale-105"
          >
            Khám phá ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📦 Lịch sử đơn hàng
          </h1>
          <p className="text-gray-600">
            Quản lý và theo dõi tất cả đơn hàng của bạn
          </p>
          {pagination && (
            <p className="text-sm text-gray-500 mt-2">
              Tổng cộng: <span className="font-semibold">{pagination.total}</span> đơn hàng
            </p>
          )}
        </div>

        {/* Orders Grid */}
        <div className="grid gap-6">
          {orders.map((order) => {
            const statusStyle = getStatusStyle(order.status);
            const paymentStyle = getPaymentStatusStyle(order.paymentStatus);

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div className="text-white">
                      <p className="text-sm opacity-90 mb-1">Mã đơn hàng</p>
                      <p className="text-lg font-bold">#{order.orderNumber || order._id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold border ${statusStyle.color} flex items-center gap-1 bg-white`}
                      >
                        <span>{statusStyle.icon}</span>
                        {statusStyle.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Body */}
                <div className="p-4 sm:p-6">
                  {/* Date & Payment Info */}
                  <div className="flex flex-wrap gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-lg">📅</span>
                      <div>
                        <p className="text-xs text-gray-500">Ngày đặt hàng</p>
                        <p className="font-medium">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{paymentStyle.icon}</span>
                      <div>
                        <p className="text-xs text-gray-500">Thanh toán</p>
                        <p className={`font-semibold ${paymentStyle.color}`}>
                          {paymentStyle.label}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Products Preview */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      Sản phẩm ({order.items.length})
                    </p>
                    <div className="space-y-3">
                      {order.items.slice(0, 2).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg"
                        >
                          <img
                            src={item.image || "/placeholder.jpg"}
                            alt={item.name}
                            className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Số lượng: {item.quantity} × {item.price.toLocaleString("vi-VN")}₫
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-amber-600">
                              {(item.quantity * item.price).toLocaleString("vi-VN")}₫
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="text-center py-2 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            + {order.items.length - 2} sản phẩm khác
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shipping Info */}
                  {order.shippingAddress && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-xs text-blue-600 font-semibold mb-1 flex items-center gap-1">
                        <span>📍</span> Địa chỉ giao hàng
                      </p>
                      <p className="text-sm text-gray-700">
                        {typeof order.shippingAddress === 'string' 
                          ? order.shippingAddress 
                          : `${order.shippingAddress.street}, ${order.shippingAddress.ward}, ${order.shippingAddress.district}, ${order.shippingAddress.city}${order.shippingAddress.country ? ', ' + order.shippingAddress.country : ''}`
                        }
                      </p>
                      {(order.phoneNumber || order.shippingAddress?.phone) && (
                        <p className="text-sm text-gray-600 mt-1">
                          📞 {order.phoneNumber || order.shippingAddress?.phone}
                        </p>
                      )}
                      {order.shippingAddress?.fullName && (
                        <p className="text-sm text-gray-600 mt-1">
                          👤 {order.shippingAddress.fullName}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Total & Action */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Tổng thanh toán</p>
                      <p className="text-2xl font-bold text-amber-600">
                        {order.total.toLocaleString("vi-VN")}₫
                      </p>
                    </div>
                    <button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition transform hover:scale-105 shadow-md">
                      Chi tiết
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="bg-white rounded-lg shadow-md p-2 flex gap-2">
              <button
                disabled={!pagination.hasPrevPage}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
              >
                ← Trước
              </button>
              <div className="px-4 py-2 flex items-center gap-2">
                <span className="font-medium text-gray-700">
                  Trang {pagination.page}
                </span>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600">{pagination.totalPages}</span>
              </div>
              <button
                disabled={!pagination.hasNextPage}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
