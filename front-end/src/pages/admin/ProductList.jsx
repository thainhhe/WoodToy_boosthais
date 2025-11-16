// front-end/src/pages/admin/ProductList.jsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getProducts, deleteProduct } from "../../service/api";
import { useConfirm } from "../../components/ConfirmDialog";
import LoadingOverlay from "../../components/LoadingOverlay";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { confirm, ConfirmDialog } = useConfirm();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getProducts();
      setProducts(res.data.data.products);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id, name) => {
    const confirmed = await confirm({
      title: "Xác nhận xóa sản phẩm",
      message: `Bạn có chắc chắn muốn xóa sản phẩm "${name}"? Hành động này không thể hoàn tác.`,
    });

    if (confirmed) {
      setIsDeleting(true);
      try {
        await deleteProduct(id);
        toast.success("Xóa sản phẩm thành công!");
        fetchProducts(); // Tải lại danh sách
      } catch (error) {
        console.error("Failed to delete product:", error);
        toast.error("Xóa sản phẩm thất bại!");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (loading) return <div>Đang tải danh sách sản phẩm...</div>;

  return (
    <div>
      <LoadingOverlay isLoading={isDeleting} message="Đang xóa sản phẩm..." />
      <ConfirmDialog />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý sản phẩm</h1>
        <Link
          to="/admin/products/new"
          className="bg-amber-600 text-white py-2 px-4 rounded font-bold hover:bg-amber-700 transition"
        >
          Thêm sản phẩm
        </Link>
      </div>
      <div className="bg-white shadow-md rounded overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Ảnh</th>
              <th className="py-3 px-6 text-left">Tên sản phẩm</th>
              <th className="py-3 px-6 text-left">Danh mục</th>
              <th className="py-3 px-6 text-right">Giá</th>
              <th className="py-3 px-6 text-center">Tồn kho</th>
              <th className="py-3 px-6 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {products.map((product) => (
              <tr
                key={product._id}
                className="border-b border-gray-200 hover:bg-gray-100"
              >
                <td className="py-3 px-6 text-left">
                  <img
                    src={product.primaryImage || "/placeholder.jpg"}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                </td>
                <td className="py-3 px-6 text-left font-medium">
                  {product.name}
                </td>
                <td className="py-3 px-6 text-left">{product.category}</td>
                <td className="py-3 px-6 text-right">
                  {product.pricegiamgia ? (
                    <div className="flex flex-col items-end">
                      <span className="text-amber-600 font-semibold">
                        {product.pricegiamgia.toLocaleString()}đ
                      </span>
                      <span className="text-xs text-gray-400 line-through">
                        {product.price.toLocaleString()}đ
                      </span>
                    </div>
                  ) : (
                    <span>{product.price.toLocaleString()}đ</span>
                  )}
                </td>
                <td className="py-3 px-6 text-center">{product.stock}</td>
                <td className="py-3 px-6 text-center">
                  <div className="flex item-center justify-center gap-4">
                    <Link
                      to={`/admin/products/edit/${product._id}`}
                      className="text-amber-600 hover:text-amber-900"
                    >
                      Sửa
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id, product.name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
