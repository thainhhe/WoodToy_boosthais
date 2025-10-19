// Đăng nhập/đăng ký bằng Google
export const googleAuth = async (token) => {
  return axios.post(`${API_URL}/auth/google`, { token });
};
import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const login = async (email, password) => {
  return axios.post(`${API_URL}/auth/login`, { email, password });
};

export const register = async (name, email, password) => {
  return axios.post(`${API_URL}/auth/register`, { name, email, password });
};
