import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchStore from "../../hooks/useFetchStore";
import ConfirmModal from "../../components/ConfirmModal";
import { Pencil, Trash2, Search } from "lucide-react";

export default function Store() {
  const { data, loading, error, deleteStore } = useFetchStore();
  const navigate = useNavigate();

  const [notif, setNotif] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const savedMessage = localStorage.getItem("storeMessage");
    if (savedMessage) {
      const msg = JSON.parse(savedMessage);
      setNotif(msg);
      localStorage.removeItem("storeMessage");
      setTimeout(() => setNotif(null), 4000);
    }
  }, []);

  useEffect(() => {
    setFilteredData(
      data.filter(
        (s) =>
          s.nama_store.toLowerCase().includes(search.toLowerCase()) ||
          s.alamat_store.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, data]);

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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">Data Store</h1>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Cari nama/alamat store..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() => navigate("/store/add")}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            + Tambah Store
          </button>
        </div>
      </div>

      {notif && (
        <div
          className={`mb-5 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
            notif.type === "success"
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          {notif.text}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Memuat data store...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : filteredData.length === 0 ? (
        <p className="text-gray-500">Store tidak ditemukan.</p>
      ) : (
        <div className="bg-white border rounded-xl p-5 shadow-sm overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 border text-center w-16">#</th>
                <th className="p-3 border text-left">Nama Store</th>
                <th className="p-3 border text-left">Alamat</th>
                <th className="p-3 border text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((s, index) => (
                <tr key={s.id_store} className="hover:bg-gray-50 transition">
                  <td className="p-3 border text-center">{index + 1}</td>
                  <td className="p-3 border">{s.nama_store}</td>
                  <td className="p-3 border">{s.alamat_store}</td>
                  <td className="p-3 border text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/store/edit/${s.id_store}`)}
                        className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
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
        message={`Apakah Anda yakin ingin menghapus store "${selectedStore}"?`}
      />
    </MainLayout>
  );
}
