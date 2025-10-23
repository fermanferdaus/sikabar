import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { Pencil, Trash2, PlusCircle, Search } from "lucide-react"; // 🔍 Tambahkan ikon Search
import useCapsterKasir from "../../hooks/useCapsterKasir";
import ConfirmModal from "../../components/ConfirmModal";

export default function CapsterKasir() {
  const id_store = localStorage.getItem("id_store");
  const { capsters, loading, error, fetchCapsters, deleteCapster } =
    useCapsterKasir(id_store);

  const [filteredCapster, setFilteredCapster] = useState([]);
  const [search, setSearch] = useState("");

  const [alert, setAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCapster, setSelectedCapster] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // 🚨 Ambil pesan dari localStorage (dikirim dari Add/Edit)
  useEffect(() => {
    const message = localStorage.getItem("capsterMessageKasir");
    if (message) {
      setAlert(JSON.parse(message));
      localStorage.removeItem("capsterMessageKasir");
      const timer = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    fetchCapsters();
  }, []);

  // 🔍 Filter otomatis saat mengetik di search bar
  useEffect(() => {
    const lower = search.toLowerCase();
    const filtered = capsters.filter((c) =>
      c.nama_capster.toLowerCase().includes(lower)
    );
    setFilteredCapster(filtered);
  }, [search, capsters]);

  // 🗑️ Buka modal hapus
  const openDeleteModal = (capster) => {
    setSelectedCapster(capster);
    setShowModal(true);
  };

  // 🗑️ Konfirmasi hapus
  const confirmDelete = async () => {
    if (!selectedCapster) return;
    setDeleting(true);
    try {
      await deleteCapster(selectedCapster.id_capster);
      setShowModal(false);
      setSelectedCapster(null);
      setAlert({
        type: "success",
        text: `Capster "${selectedCapster.nama_capster}" berhasil dihapus`,
      });
      setTimeout(() => setAlert(null), 4000);
      fetchCapsters();
    } catch (err) {
      setAlert({
        type: "error",
        text: "Gagal menghapus capster: " + err.message,
      });
      setTimeout(() => setAlert(null), 4000);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <MainLayout current="capster">
      {/* 🔹 Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">
          Data Capster Toko
        </h1>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* 🔍 Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Cari nama capster..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <Link
            to="/capster/addkasir"
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition"
          >
            <PlusCircle size={18} /> Tambah Capster
          </Link>
        </div>
      </div>

      {/* 🔔 Alert Notification */}
      {alert && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
            alert.type === "success"
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          {alert.text}
        </div>
      )}

      {/* 🔹 Tabel Capster */}
      {loading ? (
        <p className="text-gray-500 italic">Memuat data capster...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : filteredCapster.length === 0 ? (
        <p className="text-gray-500 italic">Capster tidak ditemukan.</p>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-xl shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 border">#</th>
                <th className="p-3 border text-left">Nama Capster</th>
                <th className="p-3 border text-center">Status</th>
                <th className="p-3 border text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {filteredCapster.map((c, i) => (
                <tr key={c.id_capster} className="hover:bg-gray-50 transition">
                  <td className="p-3 border text-center">{i + 1}</td>
                  <td className="p-3 border">{c.nama_capster}</td>
                  <td className="p-3 border text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        c.status === "aktif"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3 border text-center">
                    <div className="flex justify-center gap-2">
                      <Link
                        to={`/capster/editkasir/${c.id_capster}`}
                        className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={() => openDeleteModal(c)}
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

      {/* 🗑️ Modal Konfirmasi Hapus */}
      <ConfirmModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmDelete}
        loading={deleting}
        message={
          selectedCapster
            ? `Apakah Anda yakin ingin menghapus capster "${selectedCapster.nama_capster}"?`
            : "Apakah Anda yakin ingin menghapus data ini?"
        }
      />
    </MainLayout>
  );
}
