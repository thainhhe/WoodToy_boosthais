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
