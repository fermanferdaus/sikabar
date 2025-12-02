import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import TableData from "../../components/TableData";
import ConfirmModal from "../../components/ConfirmModal";
import { Pencil, Trash2, Plus } from "lucide-react";
import useFetchStore from "../../hooks/useFetchStore";

export default function Store() {
  const { data, loading, error, deleteStore } = useFetchStore();
  const navigate = useNavigate();

  const [notif, setNotif] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);

  // 🔔 Ambil notifikasi dari localStorage
  useEffect(() => {
    const savedMessage = localStorage.getItem("storeMessage");
    if (savedMessage) {
      const msg = JSON.parse(savedMessage);
      setNotif(msg);
      localStorage.removeItem("storeMessage");
      setTimeout(() => setNotif(null), 4000);
    }
  }, []);

  // 🗑️ Konfirmasi hapus
  const handleDelete = (id, name) => {
    setSelectedId(id);
    setSelectedStore(name);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteStore(selectedId);
      setNotif({
        type: "success",
        text: `Store "${selectedStore}" berhasil dihapus.`,
      });
    } catch {
      setNotif({
        type: "error",
        text: "Gagal menghapus store.",
      });
    } finally {
      setShowModal(false);
      setSelectedId(null);
      setSelectedStore(null);
      setTimeout(() => setNotif(null), 4000);
    }
  };

  return (
    <MainLayout current="store">
      {(searchTerm) => {
        const filteredData = data.filter(
          (s) =>
            s.nama_store.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.alamat_store.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const columns = [
          { key: "no", label: "#" },
          { key: "nama_store", label: "Nama Cabang" },
          { key: "alamat_store", label: "Alamat" },
          { key: "aksi", label: "Aksi" },
        ];

        const tableData = filteredData.map((s, i) => ({
          no: i + 1,
          nama_store: s.nama_store,
          alamat_store: s.alamat_store,
          aksi: (
            <div className="flex items-center justify-left gap-2">
              <button
                onClick={() => navigate(`/store/edit/${s.id_store}`)}
                className="p-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white rounded-md"
                title="Edit"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => handleDelete(s.id_store, s.nama_store)}
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
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  Data Cabang
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Kelola daftar cabang barbershop Anda.
                </p>
              </div>

              {/* 🔹 Tombol Tambah Store: kiri di mobile, kanan di desktop */}
              <div className="order-1 sm:order-2 flex justify-start sm:justify-end w-full sm:w-auto">
                <button
                  onClick={() => navigate("/store/add")}
                  className="flex items-center gap-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Plus size={16} />
                  Tambah Store
                </button>
              </div>
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
              <p className="text-gray-500">Memuat data store...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : filteredData.length === 0 ? (
              <p className="text-gray-500 italic">Store tidak ditemukan.</p>
            ) : (
              <TableData columns={columns} data={tableData} />
            )}

            {/* === Modal Konfirmasi Hapus === */}
            <ConfirmModal
              open={showModal}
              onClose={() => setShowModal(false)}
              onConfirm={confirmDelete}
              message={`Apakah Anda yakin ingin menghapus store "${selectedStore}"?`}
            />
          </div>
        );
      }}
    </MainLayout>
  );
}
