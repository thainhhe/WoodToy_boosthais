// front-end/src/pages/admin/OrderList.jsx
import { useState, useEffect } from "react";
import {
  getAllOrdersForAdmin,
  updateOrderPaymentStatus,
} from "../../service/api";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getAllOrdersForAdmin();
      setOrders(res.data.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePayment = async (order) => {
    const newStatus = order.paymentStatus === "Paid" ? "Pending" : "Paid";
    try {
      await updateOrderPaymentStatus(order._id, newStatus);
      fetchOrders();
    } catch (error) {
      alert("Cập nhật trạng thái thanh toán thất bại!");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div>Đang tải danh sách đơn hàng...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Quản lý đơn hàng</h1>
      <div className="bg-white shadow-md rounded overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Mã đơn</th>
              <th className="py-3 px-6 text-left">Khách hàng</th>
              <th className="py-3 px-6 text-left">Tổng tiền</th>
              <th className="py-3 px-6 text-left">Thanh toán</th>
              <th className="py-3 px-6 text-left">Ngày tạo</th>
              <th className="py-3 px-6 text-center">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {orders.map((order) => (
              <tr
                key={order._id}
                className="border-b border-gray-200 hover:bg-gray-100"
              >
                <td className="py-3 px-6 text-left font-medium">{order._id}</td>
                <td className="py-3 px-6 text-left">
                  {order.user?.name || "Ẩn"}
                </td>
                <td className="py-3 px-6 text-left">
                  {order.total.toLocaleString()}đ
                </td>
                <td className="py-3 px-6 text-left">
                  <button
                    onClick={() => handleTogglePayment(order)}
                    className={`px-3 py-1 rounded font-bold text-white ${
                      order.paymentStatus === "Paid"
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  >
                    {order.paymentStatus === "Paid"
                      ? "Đã thanh toán"
                      : "Chưa thanh toán"}
                  </button>
                </td>
                <td className="py-3 px-6 text-left">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
                <td className="py-3 px-6 text-center">
                  <button
                    onClick={() => alert(JSON.stringify(order, null, 2))}
                    className="text-amber-600 hover:text-amber-900"
                  >
                    Xem
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
