import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProductDetail from "./pages/ProductDetail";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import ProductList from "./pages/admin/ProductList";
import ProductEdit from "./pages/admin/ProductEdit";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import UserList from "./pages/admin/UserList";
import OrderList from "./pages/admin/OrderList";
import About from "./components/About";
import BlogList from "./pages/BlogList";
import BlogDetail from "./pages/BlogDetail";
import Products from "./components/Products";
import BlogAdminList from "./pages/admin/BlogAdminList";
import BlogCreate from "./pages/admin/BlogCreate";
import BlogEdit from "./pages/admin/BlogEdit";
import StoryAdminList from "./pages/admin/StoryAdminList";
import StoryCreate from "./pages/admin/StoryCreate";
import StoryEdit from "./pages/admin/StoryEdit";
import StoryDetail from "./pages/StoryDetail";

function MainLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Các trang ngoài admin có Navbar + Footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<OrderHistoryPage />} />
          <Route path="about" element={<About />} />
          <Route path="blogs" element={<BlogList />} />
          <Route path="products" element={<Products />} />
          <Route path="blogs/:id" element={<BlogDetail />} />
          <Route path="stories/:id" element={<StoryDetail />} />
        </Route>
        {/* Trang admin không có Navbar, Footer */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/new" element={<ProductEdit />} />
          <Route path="products/edit/:id" element={<ProductEdit />} />
          <Route path="products/:id" element={<ProductEdit />} />
          <Route path="users" element={<UserList />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="blogs" element={<BlogAdminList />} />
          <Route path="blogs/create" element={<BlogCreate />} />
          <Route path="blogs/:id/edit" element={<BlogEdit />} />
          <Route path="stories" element={<StoryAdminList />} />
          <Route path="stories/create" element={<StoryCreate />} />
          <Route path="stories/:id/edit" element={<StoryEdit />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
