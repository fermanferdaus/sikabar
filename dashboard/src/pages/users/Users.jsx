import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import TableData from "../../components/TableData";
import ConfirmModal from "../../components/ConfirmModal";
import { Pencil, Trash2, Plus } from "lucide-react";
import useFetchUsers from "../../hooks/useFetchUsers";

export default function Users() {
  const { data, loading, error, deleteUser } = useFetchUsers();
  const navigate = useNavigate();

  const [notif, setNotif] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedName, setSelectedName] = useState(null);

  // 🔔 Ambil pesan dari localStorage
  useEffect(() => {
    const savedMsg = localStorage.getItem("userMessage");
    if (savedMsg) {
      const msg = JSON.parse(savedMsg);
      setNotif(msg);
      localStorage.removeItem("userMessage");
      setTimeout(() => setNotif(null), 4000);
    }
  }, []);

  // 🗑️ Hapus user
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
      {(searchTerm) => {
        const filteredData = data.filter(
          (u) =>
            u.nama_user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.nama_store &&
              u.nama_store.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        const columns = [
          { key: "no", label: "#" },
          { key: "nama_user", label: "Nama" },
          { key: "username", label: "Username" },
          { key: "nama_store", label: "Cabang" },
          { key: "role", label: "Role" },
          { key: "aksi", label: "Aksi" },
        ];

        const tableData = filteredData.map((u, i) => ({
          no: i + 1,
          nama_user: u.nama_user,
          username: u.username,
          nama_store: u.nama_store || <i className="text-gray-400">-</i>,
          role: (
            <span className="capitalize px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
              {u.role}
            </span>
          ),
          aksi: (
            <div className="flex items-left justify-left gap-2">
              <button
                onClick={() => navigate(`/users/edit/${u.id_user}`)}
                className="p-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white rounded-md"
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
          ),
        }));

        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6 transition-all duration-300">
            {/* === Header Card === */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  Data Pengguna
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Kelola akun pengguna dan akses sistem barbershop.
                </p>
              </div>

              <button
                onClick={() => navigate("/users/add")}
                className="flex items-center gap-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all"
              >
                <Plus size={16} />
                Tambah User
              </button>
            </div>

            {/* === Notifikasi === */}
            {notif && (
              <div
                className={`px-4 py-3 rounded-lg text-sm font-medium border ${
                  notif.type === "success"
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {notif.text}
              </div>
            )}

            {/* === Tabel Data === */}
            {loading ? (
              <p className="text-gray-500 italic">Memuat data pengguna...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : filteredData.length === 0 ? (
              <p className="text-gray-500 italic">Pengguna tidak ditemukan.</p>
            ) : (
              <TableData columns={columns} data={tableData} />
            )}

            {/* === Modal Hapus === */}
            <ConfirmModal
              open={showModal}
              onClose={() => setShowModal(false)}
              onConfirm={confirmDelete}
              message={`Apakah Anda yakin ingin menghapus user "${selectedName}"?`}
            />
          </div>
        );
      }}
    </MainLayout>
  );
}
