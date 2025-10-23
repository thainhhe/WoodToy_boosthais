// front-end/src/pages/admin/OrderList.jsx
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  getAllOrdersForAdmin,
  updateOrderPaymentStatus,
} from "../../service/api";
import LoadingOverlay from "../../components/LoadingOverlay";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

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
    setIsUpdating(true);
    try {
      await updateOrderPaymentStatus(order._id, newStatus);
      toast.success("Cập nhật trạng thái thanh toán thành công!");
      fetchOrders();
    } catch (error) {
      toast.error("Cập nhật trạng thái thanh toán thất bại!");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div>Đang tải danh sách đơn hàng...</div>;

  return (
    <div>
      <LoadingOverlay isLoading={isUpdating} message="Đang cập nhật trạng thái..." />
      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setSelectedOrder(null)}
          ></div>
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Chi tiết đơn hàng
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Mã đơn hàng</p>
                <p className="font-medium">{selectedOrder._id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Khách hàng</p>
                <p className="font-medium">{selectedOrder.user?.name || "Ẩn"}</p>
                <p className="text-sm text-gray-500">{selectedOrder.user?.email || ""}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Địa chỉ giao hàng</p>
                <p className="font-medium">{selectedOrder.shippingAddress}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Số điện thoại</p>
                <p className="font-medium">{selectedOrder.phoneNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trạng thái thanh toán</p>
                <p className={`font-medium ${selectedOrder.paymentStatus === "Paid" ? "text-green-600" : "text-orange-600"}`}>
                  {selectedOrder.paymentStatus === "Paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trạng thái đơn hàng</p>
                <p className="font-medium">{selectedOrder.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Sản phẩm</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between bg-gray-50 p-3 rounded">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          Số lượng: {item.quantity} × {item.price.toLocaleString()}đ
                        </p>
                      </div>
                      <p className="font-medium">
                        {(item.quantity * item.price).toLocaleString()}đ
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <p>Tổng cộng</p>
                  <p className="text-amber-600">{selectedOrder.total.toLocaleString()}đ</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ngày tạo</p>
                <p className="font-medium">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    onClick={() => setSelectedOrder(order)}
                    className="text-amber-600 hover:text-amber-900 font-medium"
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
