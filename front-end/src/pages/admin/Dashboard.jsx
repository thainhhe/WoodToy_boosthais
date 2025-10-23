// front-end/src/pages/admin/Dashboard.jsx

import { useState, useEffect } from "react";
import {
  getProducts,
  getAllOrdersForAdmin,
  getAllUsers,
} from "../../service/api";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    totalOrders: 0,
    productCount: 0,
    userCount: 0,
  });
  const [chartData, setChartData] = useState({
    revenueByDate: [],
    orderStatus: [],
    topProducts: [],
    userGrowth: [],
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

        const orders = orderRes.data.data || [];
        const products = productRes.data.data.products || [];
        const users = userRes.data.data.users || [];

        // Calculate stats
        const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);

        setStats({
          revenue: totalRevenue,
          totalOrders: orderRes.data.pagination?.total || orders.length,
          productCount: productRes.data.data.count || products.length,
          userCount: users.length,
        });

        // Process data for charts
        processChartData(orders, products, users);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const processChartData = (orders, products, users) => {
    // 1. Revenue by Date (last 7 days)
    const revenueMap = {};
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split("T")[0];
    });

    last7Days.forEach((date) => {
      revenueMap[date] = 0;
    });

    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt).toISOString().split("T")[0];
      if (revenueMap.hasOwnProperty(orderDate)) {
        revenueMap[orderDate] += order.total;
      }
    });

    const revenueByDate = last7Days.map((date) => ({
      date: new Date(date).toLocaleDateString("vi-VN", {
        month: "short",
        day: "numeric",
      }),
      revenue: Math.round(revenueMap[date]),
    }));

    // 2. Order Status Distribution
    const statusMap = {};
    orders.forEach((order) => {
      statusMap[order.status] = (statusMap[order.status] || 0) + 1;
    });

    const orderStatus = Object.entries(statusMap).map(([name, value]) => ({
      name,
      value,
    }));

    // 3. Top 5 Products by Orders
    const productOrderCount = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const productName = item.name;
        productOrderCount[productName] =
          (productOrderCount[productName] || 0) + item.quantity;
      });
    });

    const topProducts = Object.entries(productOrderCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, quantity]) => ({
        name: name.length > 20 ? name.substring(0, 20) + "..." : name,
        quantity,
      }));

    // 4. User Growth (last 7 days)
    const userGrowthMap = {};
    last7Days.forEach((date) => {
      userGrowthMap[date] = 0;
    });

    users.forEach((user) => {
      const userDate = new Date(user.createdAt).toISOString().split("T")[0];
      if (userGrowthMap.hasOwnProperty(userDate)) {
        userGrowthMap[userDate] += 1;
      }
    });

    let cumulative = users.filter((user) => {
      const userDate = new Date(user.createdAt);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return userDate < sevenDaysAgo;
    }).length;

    const userGrowth = last7Days.map((date) => {
      cumulative += userGrowthMap[date];
      return {
        date: new Date(date).toLocaleDateString("vi-VN", {
          month: "short",
          day: "numeric",
        }),
        users: cumulative,
      };
    });

    setChartData({
      revenueByDate,
      orderStatus,
      topProducts,
      userGrowth,
    });
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Đang tải dữ liệu dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
          <h3 className="text-sm font-medium opacity-90">Doanh thu</h3>
          <p className="text-3xl font-bold mt-2">
            {stats.revenue.toLocaleString()}đ
          </p>
          <p className="text-xs mt-2 opacity-75">Tổng doanh thu</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
          <h3 className="text-sm font-medium opacity-90">Tổng đơn hàng</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalOrders}</p>
          <p className="text-xs mt-2 opacity-75">Tất cả đơn hàng</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-white">
          <h3 className="text-sm font-medium opacity-90">Sản phẩm</h3>
          <p className="text-3xl font-bold mt-2">{stats.productCount}</p>
          <p className="text-xs mt-2 opacity-75">Trong kho</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-lg shadow-lg text-white">
          <h3 className="text-sm font-medium opacity-90">Người dùng</h3>
          <p className="text-3xl font-bold mt-2">{stats.userCount}</p>
          <p className="text-xs mt-2 opacity-75">Tổng tài khoản</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Doanh thu 7 ngày gần nhất
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.revenueByDate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value) => `${value.toLocaleString()}đ`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Doanh thu"
                dot={{ fill: "#3b82f6", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Trạng thái đơn hàng
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.orderStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.orderStatus.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Top 5 sản phẩm bán chạy
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" fill="#10b981" name="Số lượng bán" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Tăng trưởng người dùng
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#f97316"
                strokeWidth={2}
                name="Số người dùng"
                dot={{ fill: "#f97316", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
