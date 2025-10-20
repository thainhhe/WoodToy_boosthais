import { Outlet, Link, NavLink } from "react-router-dom";

export default function AdminLayout() {
  const navLinkClasses = ({ isActive }) =>
    isActive
      ? "block py-2.5 px-4 bg-amber-200 text-amber-800 rounded"
      : "block py-2.5 px-4 rounded hover:bg-amber-100";

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
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <Outlet />
      </main>
    </div>
  );
}
