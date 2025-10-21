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

// Hàm helper để lấy màu sắc theo trạng thái đơn hàng
const getStatusColor = (status) => {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "Confirmed":
      return "bg-blue-100 text-blue-800";
    case "Processing":
      return "bg-indigo-100 text-indigo-800";
    case "Shipping":
      return "bg-purple-100 text-purple-800";
    case "Delivered":
      return "bg-green-100 text-green-800";
    case "Cancelled":
      return "bg-red-100 text-red-800";
    case "Refunded":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
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
      <div className="text-center py-20">Đang tải lịch sử đơn hàng...</div>
    );
  if (error)
    return <div className="text-center py-20 text-red-500">{error}</div>;
  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold mb-4">
          Bạn chưa có đơn hàng nào
        </h2>
        <Link
          to="/"
          className="text-amber-600 hover:text-amber-800 font-medium"
        >
          Bắt đầu mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Lịch sử đơn hàng
        </h1>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {orders.map((order) => (
              <li key={order._id} className="p-4 sm:p-6 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div>
                    <p className="text-sm font-medium text-amber-600 truncate">
                      Mã đơn hàng: {order.orderNumber}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Ngày đặt: {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0 flex items-center">
                    <p
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </p>
                  </div>
                </div>
                <div className="mt-4 border-t border-gray-200 pt-4">
                  {/* Tóm tắt sản phẩm (hiển thị 1-2 ảnh) */}
                  <div className="flex space-x-2 overflow-hidden mb-2">
                    {order.items.slice(0, 3).map((item) => (
                      <img
                        key={item.product}
                        src={item.image || "/placeholder.jpg"}
                        alt={item.name}
                        className="w-12 h-12 rounded object-cover flex-shrink-0"
                      />
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <p className="text-gray-500">Tổng tiền:</p>
                    <p className="font-medium text-gray-900">
                      {order.total.toLocaleString("vi-VN")}₫
                    </p>
                  </div>
                  {/* Optional: Add a "View Details" button linking to a specific order page */}
                  {/* <Link to={`/orders/${order._id}`} className="text-sm font-medium text-amber-600 hover:text-amber-800 mt-2 inline-block">Xem chi tiết</Link> */}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Optional: Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            {/* Implement Pagination UI here using pagination state */}
            {/* Example: <button disabled={!pagination.hasPrevPage}>Previous</button> */}
            {/* <span> Page {pagination.page} of {pagination.totalPages} </span> */}
            {/* <button disabled={!pagination.hasNextPage}>Next</button> */}
          </div>
        )}
      </div>
    </div>
  );
}
