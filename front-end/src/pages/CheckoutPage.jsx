import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, createOrder } from "../service/api";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

// Use open.oapi.vn directly - no proxy needed if CORS is enabled
const PROVINCE_API_URL = "https://open.oapi.vn/";

// Helper: fetch JSON directly from API
const safeFetchJson = async (url) => {
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return await res.json();
};

export default function CheckoutPage() {
  const [cart, setCart] = useState(null);
  const [loadingCart, setLoadingCart] = useState(true);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    street: "",
    notes: "",
  });
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const fetchCartCount = useAuthStore((state) => state.fetchCartCount);
  const user = useAuthStore((state) => state.user); // Lấy thông tin user nếu cần
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("COD");
  const [showQRModal, setShowQRModal] = useState(false);

  // --- Fetch Cart ---
  useEffect(() => {
    const loadCart = async () => {
      setLoadingCart(true);
      setError("");
      try {
        const fetchedCart = await getCart();
        if (fetchedCart && fetchedCart.items.length > 0) {
          setCart(fetchedCart);
        } else {
          setError("Giỏ hàng trống hoặc không thể tải.");
          // Chuyển về trang giỏ hàng nếu trống
          setTimeout(() => navigate("/cart"), 2000);
        }
      } catch (err) {
        setError("Lỗi tải giỏ hàng.");
      } finally {
        setLoadingCart(false);
      }
    };
    loadCart();
  }, [navigate]);

  // --- Fetch Provinces ---
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        // API: open.oapi.vn/location/provinces?page=0&size=100
        const data = await safeFetchJson(
          `${PROVINCE_API_URL}location/provinces?page=0&size=100`
        );
        // Handle paginated response - could be { data: [...], total: ... } or just array
        const provincesList = Array.isArray(data)
          ? data
          : data.data || data.content || [];
        setProvinces(provincesList);
      } catch (err) {
        console.error("Failed to fetch provinces:", err);
        setError("Không thể tải danh sách Tỉnh/Thành phố.");
      }
    };
    fetchProvinces();
  }, []);

  // --- Fetch Districts ---
  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]);
      setSelectedDistrict("");
      return;
    }
    const fetchDistricts = async () => {
      try {
        // API: open.oapi.vn/location/districts/{provinceId}?page=0&size=100
        const data = await safeFetchJson(
          `${PROVINCE_API_URL}location/districts/${selectedProvince}?page=0&size=100`
        );
        // Handle paginated response
        const districtsList = Array.isArray(data)
          ? data
          : data.data || data.content || [];
        console.log("Districts response sample:", districtsList[0]); // Debug: check structure
        setDistricts(districtsList);
      } catch (err) {
        console.error("Failed to fetch districts:", err);
      }
    };
    fetchDistricts();
  }, [selectedProvince]);

  // --- Fetch Wards ---
  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      setSelectedWard("");
      return;
    }
    const fetchWards = async () => {
      try {
        // API: open.oapi.vn/location/wards/{districtId}?page=0&size=100
        const district = districts.find(
          (d) => (d.code || d.id) == selectedDistrict
        );
        const districtId =
          district?.id || district?.districtId || selectedDistrict;

        const data = await safeFetchJson(
          `${PROVINCE_API_URL}location/wards/${districtId}?page=0&size=100`
        );
        // Handle paginated response
        const wardsList = Array.isArray(data)
          ? data
          : data.data || data.content || [];
        setWards(wardsList);
      } catch (err) {
        console.error("Failed to fetch wards:", err);
        // Set empty array on error instead of leaving it undefined
        setWards([]);
      }
    };
    fetchWards();
  }, [selectedDistrict, districts]);

  // --- Handle Form Input Change ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Handle Place Order ---
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");
    setIsPlacingOrder(true);

    // Lấy tên tỉnh, huyện, xã từ state để gửi đi
    // Support both code and id fields (new API might use id)
    const provinceName =
      provinces.find((p) => (p.code || p.id) == selectedProvince)?.name ||
      provinces.find((p) => (p.code || p.id) == selectedProvince)?.provinceName;
    const districtName =
      districts.find((d) => (d.code || d.id) == selectedDistrict)?.name ||
      districts.find((d) => (d.code || d.id) == selectedDistrict)?.districtName;
    const wardName =
      wards.find((w) => (w.code || w.id) == selectedWard)?.name ||
      wards.find((w) => (w.code || w.id) == selectedWard)?.wardName;

    if (
      !selectedProvince ||
      !selectedDistrict ||
      !selectedWard ||
      !provinceName ||
      !districtName ||
      !wardName
    ) {
      setError("Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện, Phường/Xã.");
      setIsPlacingOrder(false);
      return;
    }
    if (!formData.street) {
      setError("Vui lòng nhập địa chỉ cụ thể (số nhà, tên đường).");
      setIsPlacingOrder(false);
      return;
    }

    const orderDetails = {
      shippingAddress: {
        fullName: formData.fullName || user?.name, // Lấy tên user nếu có
        phone: formData.phone || user?.phoneNumber, // Lấy sđt user nếu có
        street: formData.street,
        ward: wardName,
        district: districtName,
        city: provinceName,
      },
      paymentMethod: selectedPaymentMethod === "QR" ? "Bank Transfer" : "COD", // Gửi lên API giá trị phù hợp
      notes: formData.notes,
    };

    try {
      await createOrder(orderDetails);
      toast.success("🎉 Đặt hàng thành công! Cảm ơn bạn đã mua hàng.", {
        duration: 4000,
      });
      fetchCartCount();
      // Chuyển đến trang lịch sử đơn hàng
      setTimeout(() => {
        navigate("/orders");
      }, 1000);
    } catch (err) {
      console.error("Place order error:", err);
      const errorMessage = err.response?.data?.message || "Đặt hàng thất bại. Vui lòng thử lại.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Close QR modal on Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setShowQRModal(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showQRModal]);

  if (loadingCart)
    return (
      <div className="text-center py-20">Đang tải thông tin thanh toán...</div>
    );
  if (error && !cart)
    return <div className="text-center py-20 text-red-500">{error}</div>; // Hiển thị lỗi nếu không load được cart
  if (!cart) return null; // Trường hợp cart rỗng đã xử lý trong useEffect

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột Thông tin giao hàng và thanh toán */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Thông tin giao hàng
          </h1>
          <form
            onSubmit={handlePlaceOrder}
            className="bg-white p-6 shadow rounded-lg space-y-4"
          >
            {error && (
              <div className="text-red-500 mb-4 text-center p-3 bg-red-100 rounded">
                {error}
              </div>
            )}

            {/* Thông tin người nhận */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Họ và tên
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  pattern="^(0|\+84)[3|5|7|8|9][0-9]{8}$"
                  title="Số điện thoại Việt Nam hợp lệ"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            </div>

            {/* Chọn địa chỉ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="province"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tỉnh/Thành phố
                </label>
                <select
                  id="province"
                  value={selectedProvince}
                  onChange={(e) => {
                    setSelectedProvince(e.target.value);
                    setSelectedDistrict("");
                    setSelectedWard("");
                  }}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
                >
                  <option value="">Chọn Tỉnh/Thành</option>
                  {provinces.map((p) => (
                    <option key={p.code || p.id} value={p.code || p.id}>
                      {p.name || p.provinceName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="district"
                  className="block text-sm font-medium text-gray-700"
                >
                  Quận/Huyện
                </label>
                <select
                  id="district"
                  value={selectedDistrict}
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value);
                    setSelectedWard("");
                  }}
                  required
                  disabled={!selectedProvince}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white disabled:bg-gray-100"
                >
                  <option value="">Chọn Quận/Huyện</option>
                  {districts.map((d) => (
                    <option key={d.code || d.id} value={d.code || d.id}>
                      {d.name || d.districtName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="ward"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phường/Xã
                </label>
                <select
                  id="ward"
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  required
                  disabled={!selectedDistrict}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white disabled:bg-gray-100"
                >
                  <option value="">Chọn Phường/Xã</option>
                  {wards.map((w) => (
                    <option key={w.code || w.id} value={w.code || w.id}>
                      {w.name || w.wardName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Địa chỉ cụ thể */}
            <div>
              <label
                htmlFor="street"
                className="block text-sm font-medium text-gray-700"
              >
                Địa chỉ cụ thể (Số nhà, tên đường)
              </label>
              <input
                type="text"
                id="street"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                required
                placeholder="Ví dụ: Số 123, Đường ABC"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            {/* Ghi chú */}
            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700"
              >
                Ghi chú (Tùy chọn)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              ></textarea>
            </div>

            {/* ---- START: CẬP NHẬT PHẦN THANH TOÁN ---- */}
            <div className="mt-6 border-t pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Phương thức thanh toán
              </h2>
              {/* Lựa chọn PTTT */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <input
                    id="payment-cod"
                    name="paymentMethod"
                    type="radio"
                    value="COD"
                    checked={selectedPaymentMethod === "COD"}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="focus:ring-amber-500 h-4 w-4 text-amber-600 border-gray-300"
                  />
                  <label
                    htmlFor="payment-cod"
                    className="ml-3 block text-sm font-medium text-gray-700"
                  >
                    Thanh toán khi nhận hàng (COD)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="payment-qr"
                    name="paymentMethod"
                    type="radio"
                    value="QR"
                    checked={selectedPaymentMethod === "QR"}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSelectedPaymentMethod(v);
                      if (v === "QR") setShowQRModal(true);
                    }}
                    className="focus:ring-amber-500 h-4 w-4 text-amber-600 border-gray-300"
                  />
                  <label
                    htmlFor="payment-qr"
                    className="ml-3 block text-sm font-medium text-gray-700"
                  >
                    Thanh toán bằng mã QR
                  </label>
                </div>
              </div>

              {/* Hiển thị QR nếu chọn PTTT là QR */}
              {selectedPaymentMethod === "QR" && (
                <div className="mb-6 p-4 border rounded-md bg-gray-50 flex flex-col items-center">
                  <p className="text-sm text-gray-600 mb-3 text-center">
                    Vui lòng quét mã QR dưới đây bằng ứng dụng ngân hàng của bạn
                    để thanh toán. Nhấn vào ảnh để phóng to.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowQRModal(true)}
                    className="focus:outline-none"
                    aria-label="Mở mã QR lớn"
                  >
                    <img
                      src="/qr.png"
                      alt="Mã QR thanh toán"
                      className="w-36 h-36 border rounded-md object-contain"
                    />
                  </button>
                </div>
              )}

              {/* QR Modal */}
              {showQRModal && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center"
                  aria-modal="true"
                  role="dialog"
                >
                  <div
                    className="absolute inset-0 bg-black/50"
                    onClick={() => setShowQRModal(false)}
                  />
                  <div className="relative bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4">
                    <div className="flex justify-end p-3">
                      <button
                        onClick={() => setShowQRModal(false)}
                        className="text-gray-500 hover:text-gray-700 text-lg"
                        aria-label="Đóng"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="p-6 flex flex-col items-center">
                      <p className="text-sm text-gray-700 mb-4 text-center">
                        Quét mã QR để thanh toán
                      </p>
                      <img
                        src="/qr.png"
                        alt="Mã QR"
                        className="w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[560px] lg:h-[560px] object-contain"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Nút đặt hàng */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isPlacingOrder}
                  className={`w-full max-w-xs flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white transition ${
                    isPlacingOrder
                      ? "bg-gray-400 cursor-wait"
                      : "bg-amber-600 hover:bg-amber-700"
                  }`}
                >
                  {isPlacingOrder ? "Đang xử lý..." : "Hoàn tất đặt hàng"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Cột Tóm tắt đơn hàng */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 shadow rounded-lg sticky top-28">
            {" "}
            {/* sticky để giữ nó khi scroll */}
            <h2 className="text-lg font-medium text-gray-900 border-b pb-4 mb-4">
              Tóm tắt đơn hàng
            </h2>
            <ul className="divide-y divide-gray-200 mb-4 max-h-60 overflow-y-auto">
              {cart.items.map((item) => (
                <li key={item.product._id} className="py-4 flex space-x-3">
                  <img
                    src={
                      item.productSnapshot?.image ||
                      item.product?.primaryImage ||
                      "/placeholder.jpg"
                    }
                    alt={item.productSnapshot?.name || item.product?.name}
                    className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.productSnapshot?.name || item.product?.name}
                    </p>
                    <div className="flex items-baseline gap-2 text-sm">
                      <span className="text-gray-500">SL: {item.quantity}</span>
                      {item.product?.pricegiamgia && item.product?.pricegiamgia < item.product?.price && (
                        <span className="text-xs text-red-500">Giảm giá!</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                    </p>
                    {item.product?.pricegiamgia && item.product?.pricegiamgia < item.product?.price && (
                      <p className="text-xs text-gray-400 line-through">
                        {(item.product.price * item.quantity).toLocaleString("vi-VN")}₫
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tạm tính</span>
                <span>{cart.totalPrice.toLocaleString("vi-VN")}₫</span>
              </div>
              {/* Thêm Phí vận chuyển, Giảm giá nếu có */}
              <div className="flex justify-between text-base font-medium text-gray-900">
                <span>Tổng cộng</span>
                <span>{cart.totalPrice.toLocaleString("vi-VN")}₫</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
