import { Outlet, NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

export default function AdminLayout() {
  const navLinkClasses = ({ isActive }) =>
    isActive
      ? "block py-2.5 px-4 bg-amber-200 text-amber-800 rounded"
      : "block py-2.5 px-4 rounded hover:bg-amber-100";
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-brand-primary">Admin</h2>
        </div>
        <nav className="p-4">
          <NavLink to="/admin" end className={navLinkClasses}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/products" className={navLinkClasses}>
            Products
          </NavLink>
          <NavLink to="/admin/orders" className={navLinkClasses}>
            Orders
          </NavLink>
          <NavLink to="/admin/users" className={navLinkClasses}>
            Users
          </NavLink>
          <button
            onClick={handleLogout}
            className="block w-full mt-6 py-2.5 px-4 rounded bg-red-100 text-red-700 font-bold hover:bg-red-200 transition"
          >
            Đăng xuất
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <Outlet />
      </main>
    </div>
  );
}
