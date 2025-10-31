// ========== USER PROFILE ========== //
export const getUserProfile = async () => {
  const token = localStorage.getItem("accessToken");
  return axios.get(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateUserProfile = async (profileData) => {
  const token = localStorage.getItem("accessToken");
  return axios.put(`${API_URL}/auth/me`, profileData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
// ========== ORDER (ADMIN) ========== //
export const updateOrderPaymentStatus = async (orderId, paymentStatus) => {
  const token = localStorage.getItem("accessToken");
  return axios.put(
    `${API_URL}/orders/${orderId}/payment`,
    {
      paymentStatus,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

// ========== BLOG ========== //
export const getBlogs = async (params = {}) => {
  return axios.get(`${API_URL}/blogs`, { params });
};

export const getBlogById = async (id) => {
  return axios.get(`${API_URL}/blogs/${id}`);
};

export const createBlog = async (blogData) => {
  const token = localStorage.getItem("accessToken");
  return axios.post(`${API_URL}/blogs`, blogData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateBlog = async (id, blogData) => {
  const token = localStorage.getItem("accessToken");
  return axios.put(`${API_URL}/blogs/${id}`, blogData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteBlog = async (id) => {
  const token = localStorage.getItem("accessToken");
  return axios.delete(`${API_URL}/blogs/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const likeBlog = async (id) => {
  const token = localStorage.getItem("accessToken");
  return axios.post(
    `${API_URL}/blogs/${id}/like`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const addCommentToBlog = async (id, content) => {
  const token = localStorage.getItem("accessToken");
  return axios.post(
    `${API_URL}/blogs/${id}/comments`,
    { content },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const deleteCommentFromBlog = async (blogId, commentId) => {
  const token = localStorage.getItem("accessToken");
  return axios.delete(`${API_URL}/blogs/${blogId}/comments/${commentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getBlogCategories = async () => {
  return axios.get(`${API_URL}/blogs/categories/list`);
};

export const getPopularBlogTags = async (limit = 20) => {
  return axios.get(`${API_URL}/blogs/tags/popular`, { params: { limit } });
};

// ========== STORY ========== //
export const getStories = async (params = {}) => {
  const token = localStorage.getItem("accessToken");
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  return axios.get(`${API_URL}/stories`, { params, headers });
};

export const getStoryById = async (id) => {
  const token = localStorage.getItem("accessToken");
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  return axios.get(`${API_URL}/stories/${id}`, { headers });
};

export const createStory = async (storyData) => {
  const token = localStorage.getItem("accessToken");
  return axios.post(`${API_URL}/stories`, storyData, {
    headers: { 
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}` 
    },
  });
};

export const updateStory = async (id, storyData) => {
  const token = localStorage.getItem("accessToken");
  return axios.put(`${API_URL}/stories/${id}`, storyData, {
    headers: { 
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}` 
    },
  });
};

export const deleteStory = async (id) => {
  const token = localStorage.getItem("accessToken");
  return axios.delete(`${API_URL}/stories/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// category endpoint removed

export const getPopularStoryTags = async (limit = 20) => {
  return axios.get(`${API_URL}/stories/tags/popular`, { params: { limit } });
};
import axios from "axios";

// Use environment variable or fallback to localhost for development
// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_URL =  "http://localhost:5000/api";
// ========== AUTH ========== //
export const login = async (email, password) =>
  axios.post(`${API_URL}/auth/login`, { email, password });

export const register = async (name, email, password) =>
  axios.post(`${API_URL}/auth/register`, { name, email, password });

export const googleAuth = async (token) =>
  axios.post(`${API_URL}/auth/google`, { token });

// ========== USER (ADMIN) ========== //
export const getAllUsers = async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return { data: { data: { users: [] } } };
  return axios.get(`${API_URL}/auth/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteUser = async (id) => {
  const token = localStorage.getItem("accessToken");
  return axios.delete(`${API_URL}/auth/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ========== PRODUCT ========== //
export const getProducts = async () => axios.get(`${API_URL}/products`);

export const getProductById = async (id) =>
  axios.get(`${API_URL}/products/${id}`);

export const createProduct = async (productData) => {
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

// ========== CART ========== //
export const addToCart = async (productId, quantity = 1) => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("User not authenticated");
  return axios.post(
    `${API_URL}/cart/items`,
    { productId, quantity },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const getCart = async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    // Không gọi API nếu chưa đăng nhập
    return null;
  }
  try {
    const response = await axios.get(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data.cart;
  } catch (error) {
    // Không log lỗi 401 ra console nữa
    return null;
  }
};

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

export const removeFromCart = async (productId) => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("User not authenticated");
  return axios.delete(`${API_URL}/cart/items/${productId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ========== ORDER ========== //
export const createOrder = async (orderDetails) => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("User not authenticated");
  return axios.post(`${API_URL}/orders`, orderDetails, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getUserOrders = async (page = 1, limit = 10) => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("User not authenticated");
  return axios.get(`${API_URL}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { page, limit },
  });
};

// ========== ORDER (ADMIN) ========== //
export const getAllOrdersForAdmin = async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return { data: { data: [] } };
  return axios.get(`${API_URL}/orders/admin/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteOrder = async (id) => {
  const token = localStorage.getItem("accessToken");
  return axios.delete(`${API_URL}/orders/admin/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
