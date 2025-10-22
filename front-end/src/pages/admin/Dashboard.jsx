// front-end/src/pages/admin/Dashboard.jsx

import { useState, useEffect } from "react";
import {
  getProducts,
  getAllOrdersForAdmin,
  getAllUsers,
} from "../../service/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    totalOrders: 0,
    productCount: 0,
    userCount: 0, // Dữ liệu user chưa có API, tạm giữ
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productRes, orderRes, userRes] = await Promise.all([
          getProducts(),
          getAllOrdersForAdmin(),
          getAllUsers(),
        ]);

        const totalRevenue = orderRes.data.data.reduce(
          (acc, order) => acc + order.total,
          0
        );

        setStats({
          revenue: totalRevenue,
          totalOrders: orderRes.data.pagination.total,
          productCount: productRes.data.data.count,
          userCount: userRes.data.data.users.length,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div>Đang tải dữ liệu dashboard...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Doanh thu</h3>
          <p className="text-3xl font-bold mt-2">
            {stats.revenue.toLocaleString()}đ
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Tổng đơn hàng</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Sản phẩm</h3>
          <p className="text-3xl font-bold mt-2">{stats.productCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Người dùng</h3>
          <p className="text-3xl font-bold mt-2">{stats.userCount}</p>
        </div>
      </div>
    </div>
  );
}
