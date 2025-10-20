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
