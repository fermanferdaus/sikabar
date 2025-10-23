import { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import { Pencil, Trash2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../components/ConfirmModal";
import useFetchUsers from "../../hooks/useFetchUsers";

export default function Users() {
  const { data, loading, error, deleteUser } = useFetchUsers();
  const navigate = useNavigate();

  const [notif, setNotif] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedName, setSelectedName] = useState(null);
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const savedMsg = localStorage.getItem("userMessage");
    if (savedMsg) {
      const msg = JSON.parse(savedMsg);
      setNotif(msg);
      localStorage.removeItem("userMessage");
      setTimeout(() => setNotif(null), 4000);
    }
  }, []);

  useEffect(() => {
    setFilteredData(
      data.filter(
        (u) =>
          u.nama_user.toLowerCase().includes(search.toLowerCase()) ||
          u.username.toLowerCase().includes(search.toLowerCase()) ||
          (u.nama_store &&
            u.nama_store.toLowerCase().includes(search.toLowerCase()))
      )
    );
  }, [search, data]);

  const handleDelete = (id, name) => {
    setSelectedId(id);
    setSelectedName(name);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteUser(selectedId);
      setNotif({
        type: "success",
        text: `User "${selectedName}" berhasil dihapus.`,
      });
    } catch {
      setNotif({ type: "error", text: "Gagal menghapus user." });
    } finally {
      setShowModal(false);
      setTimeout(() => setNotif(null), 4000);
    }
  };

  return (
    <MainLayout current="users">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">Data Pengguna</h1>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Cari nama, username, atau store..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() => navigate("/users/add")}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            + Tambah User
          </button>
        </div>
      </div>

      {notif && (
        <div
          className={`mb-5 px-4 py-3 rounded-lg text-sm font-medium ${
            notif.type === "success"
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          {notif.text}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Memuat data pengguna...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : filteredData.length === 0 ? (
        <p className="text-gray-500 italic">Pengguna tidak ditemukan.</p>
      ) : (
        <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 border text-center w-[5%]">No</th>
                <th className="p-3 border text-left">Nama</th>
                <th className="p-3 border text-left">Username</th>
                <th className="p-3 border text-left">Store</th>
                <th className="p-3 border text-center w-[10%]">Role</th>
                <th className="p-3 border text-center w-[20%]">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {filteredData.map((u, i) => (
                <tr key={u.id_user} className="hover:bg-gray-50 transition">
                  <td className="p-3 border text-center">{i + 1}</td>
                  <td className="p-3 border">{u.nama_user}</td>
                  <td className="p-3 border">{u.username}</td>
                  <td className="p-3 border">
                    {u.nama_store ? (
                      u.nama_store
                    ) : (
                      <i className="text-gray-400">-</i>
                    )}
                  </td>
                  <td className="p-3 border text-center capitalize">
                    {u.role}
                  </td>
                  <td className="p-3 border text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => navigate(`/users/edit/${u.id_user}`)}
                        className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id_user, u.nama_user)}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmDelete}
        message={`Apakah Anda yakin ingin menghapus user "${selectedName}"?`}
      />
    </MainLayout>
  );
}
