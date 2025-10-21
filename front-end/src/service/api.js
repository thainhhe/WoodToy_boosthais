import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const login = async (email, password) => {
  return axios.post(`${API_URL}/auth/login`, { email, password });
};

export const register = async (name, email, password) => {
  return axios.post(`${API_URL}/auth/register`, { name, email, password });
};

// Đăng nhập/đăng ký bằng Google
export const googleAuth = async (token) => {
  return axios.post(`${API_URL}/auth/google`, { token });
};

// Lấy tất cả sản phẩm
export const getProducts = async () => {
  return axios.get(`${API_URL}/products`);
};

// MỚI: Thêm hàm lấy sản phẩm theo ID
export const getProductById = async (id) => {
  return axios.get(`${API_URL}/products/${id}`);
};

// --- Admin: Products ---
export const createProduct = async (productData) => {
  // Giả định token được lưu trong localStorage để ví dụ
  const token = localStorage.getItem("accessToken");
  return axios.post(`${API_URL}/products`, productData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateProduct = async (id, productData) => {
  const token = localStorage.getItem("accessToken");
  return axios.put(`${API_URL}/products/${id}`, productData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteProduct = async (id) => {
  const token = localStorage.getItem("accessToken");
  return axios.delete(`${API_URL}/products/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// --- Admin: Orders (for Dashboard) ---
export const getAllOrdersForAdmin = async () => {
  const token = localStorage.getItem("accessToken");
  return axios.get(`${API_URL}/orders/admin/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addToCart = async (productId, quantity = 1) => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("User not authenticated"); // Hoặc xử lý chuyển hướng đăng nhập
  }

  return axios.post(
    `${API_URL}/cart/items`,
    { productId, quantity },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// MỚI: Thêm hàm lấy giỏ hàng
export const getCart = async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    console.log("getCart: No token found");
    return null;
  }
  try {
    console.log("getCart: Fetching cart with token:", token.substring(0, 20) + "...");
    const response = await axios.get(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("getCart: Success", response.data);
    return response.data.data.cart; // Trả về thông tin giỏ hàng
  } catch (error) {
    // Xử lý lỗi, ví dụ token hết hạn (401)
    if (error.response?.status === 401) {
      console.error("Cart fetch failed: Unauthorized. Token might be expired.");
      // ⚠️ KHÔNG xóa token ở đây vì có thể là cart chưa được tạo
      // localStorage.removeItem("accessToken");
      // localStorage.removeItem("refreshToken");
    } else {
      console.error("Failed to fetch cart:", error);
    }
    return null; // Trả về null nếu có lỗi
  }
};

// MỚI: Cập nhật số lượng item trong giỏ hàng
export const updateCartItemQuantity = async (productId, quantity) => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("User not authenticated");
  return axios.put(
    `${API_URL}/cart/items/${productId}`,
    { quantity },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

// MỚI: Xóa item khỏi giỏ hàng
export const removeFromCart = async (productId) => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("User not authenticated");
  return axios.delete(`${API_URL}/cart/items/${productId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// --- Orders ---
// MỚI: Tạo đơn hàng (checkout)
export const createOrder = async (orderDetails) => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("User not authenticated");
  return axios.post(`${API_URL}/orders`, orderDetails, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// MỚI: Lấy lịch sử đơn hàng của user
export const getUserOrders = async (page = 1, limit = 10) => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("User not authenticated");
  return axios.get(`${API_URL}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { page, limit }, // Thêm params cho phân trang
  });
};
