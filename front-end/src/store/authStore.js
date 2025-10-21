import { create } from "zustand";
import { getCart } from "../service/api"; // MỚI: Import getCart

const useAuthStore = create((set, get) => ({
  // MỚI: Thêm get để truy cập state khác
  user: null,
  cartItemCount: 0, // MỚI: State đếm số lượng item trong giỏ
  setUser: (user) => {
    set({ user });
    if (user) {
      // Lưu user info vào localStorage để persist khi reload
      localStorage.setItem("user", JSON.stringify(user));
      get().fetchCartCount(); // MỚI: Gọi fetch giỏ hàng khi user được set
    } else {
      localStorage.removeItem("user");
      set({ cartItemCount: 0 }); // Reset count khi logout
    }
  },
  logout: () => {
    // MỚI: Xóa token và user info khi logout
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    set({ user: null, cartItemCount: 0 });
  },
  // MỚI: Action để lấy số lượng giỏ hàng từ API
  fetchCartCount: async () => {
    const cart = await getCart();
    if (cart) {
      // Tính tổng số lượng sản phẩm (totalItems đã có sẵn trong API response)
      set({ cartItemCount: cart.totalItems || 0 });
    } else {
      set({ cartItemCount: 0 }); // Đặt lại là 0 nếu không lấy được giỏ hàng
    }
  },
  // MỚI: Action để tăng số lượng (dùng sau khi add to cart thành công)
  incrementCartCount: (amount = 1) => {
    set((state) => ({ cartItemCount: state.cartItemCount + amount }));
  },
}));

// ✅ Restore user info và cart count khi ứng dụng load lần đầu
const initialToken = localStorage.getItem("accessToken");
const savedUser = localStorage.getItem("user");

console.log("Auth Store Initialization:");
console.log("Token exists:", !!initialToken);
console.log("Saved user:", savedUser);

if (initialToken && savedUser) {
  try {
    const user = JSON.parse(savedUser);
    console.log("Restoring user:", user);
    // Restore user vào state (không gọi setUser để tránh gọi fetchCartCount 2 lần)
    useAuthStore.setState({ user });
    // Fetch cart count
    useAuthStore.getState().fetchCartCount();
  } catch (error) {
    console.error("Error restoring user:", error);
    // Nếu parse lỗi, xóa user khỏi localStorage
    localStorage.removeItem("user");
  }
} else {
  console.log("No token or saved user found - user not restored");
}

export default useAuthStore;
