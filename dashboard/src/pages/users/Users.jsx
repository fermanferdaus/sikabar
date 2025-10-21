import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";

export default function Users() {
  const [users, setUsers] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Gagal memuat data pengguna:", err);
      }
    };
    fetchUsers();
  }, [API_URL, token]);

  return (
    <MainLayout current="users">
      {/* === Header === */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Data Pengguna</h1>
        <button className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition">
          + Tambah User
        </button>
      </div>

      {/* === Table === */}
      {users.length === 0 ? (
        <p className="text-gray-500 italic">Belum ada pengguna.</p>
      ) : (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 border text-center w-[5%]">#</th>
                <th className="p-3 border text-left">Nama</th>
                <th className="p-3 border text-left">Username</th>
                <th className="p-3 border text-center w-[15%]">Role</th>
                <th className="p-3 border text-center w-[20%]">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {users.map((u, i) => (
                <tr key={u.id_user} className="hover:bg-gray-50 transition">
                  <td className="p-3 border text-center">{i + 1}</td>
                  <td className="p-3 border">{u.nama_user}</td>
                  <td className="p-3 border">{u.username}</td>
                  <td className="p-3 border text-center capitalize">
                    {u.role}
                  </td>
                  <td className="p-3 border text-center space-x-2">
                    <button className="text-blue-600 hover:underline font-medium">
                      Edit
                    </button>
                    <button className="text-red-600 hover:underline font-medium">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </MainLayout>
  );
}
