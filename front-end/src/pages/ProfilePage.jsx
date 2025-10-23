import { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import { getUserProfile, updateUserProfile } from "../service/api";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      fullName: "",
      phone: "",
      street: "",
      ward: "",
      district: "",
      city: "",
      country: "Việt Nam",
    },
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const res = await getUserProfile();
        const userData = res.data.data.user;
        setProfile(userData);
        setForm({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          address: {
            fullName: userData.address?.fullName || userData.name || "",
            phone: userData.address?.phone || userData.phone || "",
            street: userData.address?.street || "",
            ward: userData.address?.ward || "",
            district: userData.address?.district || "",
            city: userData.address?.city || "",
            country: userData.address?.country || "Việt Nam",
          },
        });
      } catch (err) {
        toast.error("Không thể tải thông tin người dùng.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    setForm({
      ...form,
      address: { ...form.address, [e.target.name]: e.target.value },
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file ảnh!");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 5MB!");
        return;
      }
      setAvatarFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Create FormData if there's an avatar file
      let updateData;
      if (avatarFile) {
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("email", form.email);
        formData.append("phoneNumber", form.phone); // Backend expects phoneNumber
        formData.append("address", JSON.stringify(form.address));
        formData.append("avatar", avatarFile);
        updateData = formData;
      } else {
        // Send as JSON when no file
        updateData = {
          name: form.name,
          email: form.email,
          phoneNumber: form.phone, // Backend expects phoneNumber
          address: form.address,
        };
      }

      await updateUserProfile(updateData);
      
      // Reload profile from server to get updated avatar
      const profileRes = await getUserProfile();
      const updatedProfile = profileRes.data.data.user;
      setProfile(updatedProfile);
      
      // Update form with new data
      setForm({
        name: updatedProfile.name || "",
        email: updatedProfile.email || "",
        phone: updatedProfile.phone || "",
        address: {
          fullName: updatedProfile.address?.fullName || updatedProfile.name || "",
          phone: updatedProfile.address?.phone || updatedProfile.phone || "",
          street: updatedProfile.address?.street || "",
          ward: updatedProfile.address?.ward || "",
          district: updatedProfile.address?.district || "",
          city: updatedProfile.address?.city || "",
          country: updatedProfile.address?.country || "Việt Nam",
        },
      });
      
      toast.success("Cập nhật thông tin thành công! 🎉");
      setEditMode(false);
      
      // Reset avatar states
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      console.error("Update profile error:", err);
      toast.error(err.response?.data?.message || "Cập nhật thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải thông tin...</p>
        </div>
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-6xl mb-4">😔</div>
          <p className="text-red-500 text-lg font-medium">
            Không tìm thấy thông tin người dùng.
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            👤 Thông tin cá nhân
          </h1>
          <p className="text-gray-600">
            Quản lý thông tin tài khoản và địa chỉ của bạn
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header with Avatar */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white flex items-center justify-center text-3xl sm:text-4xl font-bold text-amber-600 shadow-lg">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  profile.name?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <div className="text-white">
                <h2 className="text-2xl sm:text-3xl font-bold">{profile.name}</h2>
                <p className="text-amber-100">{profile.email}</p>
                <p className="text-sm text-amber-100 mt-1">
                  Vai trò: <span className="font-semibold">{profile.role === "admin" ? "Quản trị viên" : "Khách hàng"}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {!editMode ? (
              <div className="space-y-6">
                {/* Basic Info Section */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>📋</span> Thông tin cơ bản
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Họ và tên</p>
                      <p className="font-semibold text-gray-900">{profile.name}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <p className="font-semibold text-gray-900">{profile.email}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Số điện thoại</p>
                      <p className="font-semibold text-gray-900">
                        {profile.phone || "Chưa cập nhật"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Ngày tham gia</p>
                      <p className="font-semibold text-gray-900">
                        {profile.createdAt
                          ? new Date(profile.createdAt).toLocaleDateString("vi-VN")
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                {profile.address && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span>📍</span> Địa chỉ giao hàng
                    </h3>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="font-semibold text-gray-900 mb-2">
                        {profile.address.fullName || profile.name}
                      </p>
                      {profile.address.phone && (
                        <p className="text-gray-700 mb-1">📞 {profile.address.phone}</p>
                      )}
                      <p className="text-gray-700">
                        {[
                          profile.address.street,
                          profile.address.ward,
                          profile.address.district,
                          profile.address.city,
                          profile.address.country,
                        ]
                          .filter(Boolean)
                          .join(", ") || "Chưa cập nhật địa chỉ"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Edit Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setEditMode(true)}
                    className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    ✏️ Chỉnh sửa thông tin
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex justify-center">
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-amber-200 shadow-lg">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : profile.avatar ? (
                          <img
                            src={profile.avatar}
                            alt={profile.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-4xl font-bold text-white">
                            {profile.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                        )}
                      </div>
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 bg-amber-600 hover:bg-amber-700 text-white rounded-full p-2 cursor-pointer shadow-lg transition"
                        title="Thay đổi ảnh đại diện"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Click vào icon camera để thay đổi ảnh
                    </p>
                    {avatarFile && (
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <p className="text-xs text-green-600">
                          ✓ Đã chọn: {avatarFile.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setAvatarFile(null);
                            setAvatarPreview(null);
                          }}
                          className="text-xs text-red-500 hover:text-red-700 underline"
                        >
                          Hủy
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Kích thước tối đa: 5MB
                    </p>
                  </div>
                </div>

                {/* Basic Info Form */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Thông tin cơ bản
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="0123456789"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Form */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Địa chỉ giao hàng
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên người nhận
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={form.address.fullName}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại người nhận
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.address.phone}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Địa chỉ cụ thể
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={form.address.street}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Số nhà, tên đường"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phường/Xã
                      </label>
                      <input
                        type="text"
                        name="ward"
                        value={form.address.ward}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quận/Huyện
                      </label>
                      <input
                        type="text"
                        name="district"
                        value={form.address.district}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tỉnh/Thành phố
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={form.address.city}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quốc gia
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={form.address.country}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setAvatarFile(null);
                      setAvatarPreview(null);
                    }}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 transition disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang lưu...
                      </>
                    ) : (
                      <>💾 Lưu thay đổi</>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
