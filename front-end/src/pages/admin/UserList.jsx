// front-end/src/pages/admin/UserList.jsx
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getAllUsers, deleteUser } from "../../service/api";
import { useConfirm } from "../../components/ConfirmDialog";
import LoadingOverlay from "../../components/LoadingOverlay";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { confirm, ConfirmDialog } = useConfirm();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsers();
      setUsers(res.data.data.users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id, name) => {
    const confirmed = await confirm({
      title: "Xác nhận xóa người dùng",
      message: `Bạn có chắc chắn muốn xóa người dùng "${name}"? Hành động này không thể hoàn tác.`,
    });

    if (confirmed) {
      setIsDeleting(true);
      try {
        await deleteUser(id);
        toast.success("Xóa người dùng thành công!");
        fetchUsers();
      } catch (error) {
        console.error("Failed to delete user:", error);
        toast.error("Xóa người dùng thất bại!");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (loading) return <div>Đang tải danh sách người dùng...</div>;

  return (
    <div>
      <LoadingOverlay isLoading={isDeleting} message="Đang xóa người dùng..." />
      <ConfirmDialog />
      <h1 className="text-3xl font-bold mb-6">Quản lý người dùng</h1>
      <div className="bg-white shadow-md rounded overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Tên</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">Quyền</th>
              <th className="py-3 px-6 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {users.map((user) => (
              <tr
                key={user._id}
                className="border-b border-gray-200 hover:bg-gray-100"
              >
                <td className="py-3 px-6 text-left font-medium">{user.name}</td>
                <td className="py-3 px-6 text-left">{user.email}</td>
                <td className="py-3 px-6 text-left">{user.role}</td>
                <td className="py-3 px-6 text-center">
                  <button
                    onClick={() => handleDelete(user._id, user.name)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
