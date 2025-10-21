import { create } from "zustand";
import { getCart } from "../service/api"; // MỚI: Import getCart

const useAuthStore = create((set, get) => ({
  // MỚI: Thêm get để truy cập state khác
  user: null,
  cartItemCount: 0, // MỚI: State đếm số lượng item trong giỏ
  setUser: (user) => {
    set({ user });
    if (user) {
      get().fetchCartCount(); // MỚI: Gọi fetch giỏ hàng khi user được set
    } else {
      set({ cartItemCount: 0 }); // Reset count khi logout
    }
  },
  logout: () => {
    // MỚI: Xóa token khi logout
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
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

// MỚI: Thử fetch cart count khi ứng dụng load lần đầu nếu đã có token
// Điều này giúp giữ trạng thái giỏ hàng khi refresh trang
const initialToken = localStorage.getItem("accessToken");
if (initialToken) {
  // Lấy thông tin user từ API /me (nếu có) hoặc chỉ fetch cart
  // Tạm thời chỉ fetch cart
  useAuthStore.getState().fetchCartCount();
  // TODO: Nên có cơ chế fetch user info từ token khi reload trang
}

export default useAuthStore;
