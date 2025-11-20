import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import TableData from "../../components/TableData";
import { Pencil, Trash2, Plus } from "lucide-react";
import useCapsterKasir from "../../hooks/useCapsterKasir";
import ConfirmModal from "../../components/ConfirmModal";
import { formatCapsterID } from "../../utils/formatID";

export default function CapsterKasir() {
  const id_store = localStorage.getItem("id_store");
  const { capsters, loading, error, fetchCapsters, deleteCapster } =
    useCapsterKasir(id_store);

  const [alert, setAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCapster, setSelectedCapster] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // 🚨 Ambil pesan dari localStorage
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

  // 🗑️ Modal hapus
  const openDeleteModal = (capster) => {
    setSelectedCapster(capster);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedCapster) return;
    setDeleting(true);
    try {
      await deleteCapster(selectedCapster.id_capster);
      setShowModal(false);
      setSelectedCapster(null);
      setAlert({
        type: "success",
        text: `Capster "${selectedCapster.nama_capster}" berhasil dihapus.`,
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
      {(searchTerm) => {
        const filtered = capsters.filter((c) =>
          c.nama_capster.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const columns = [
          { key: "no", label: "#" },
          { key: "id_capster", label: "ID Caspter" },
          { key: "nama_capster", label: "Nama Capster" },
          { key: "status", label: "Status" },
          { key: "aksi", label: "Aksi" },
        ];

        const data = filtered.map((c, i) => ({
          no: i + 1,
          id_capster: (
            <span className="font-semibold text-slate-700">
              {formatCapsterID(c.id_capster)}
            </span>
          ),
          nama_capster: c.nama_capster,
          status: (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                c.status === "aktif"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {c.status}
            </span>
          ),
          aksi: (
            <div className="flex items-center justify-left gap-2">
              <Link
                to={`/capster/kasir/edit/${c.id_capster}`}
                className="p-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white rounded-md"
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
          ),
        }));

        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6 transition-all duration-300">
            {/* === Header Card === */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  Data Capster Toko
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Kelola daftar capster di toko Anda.
                </p>
              </div>

              {/* 🔹 Tombol Tambah Capster: kiri di mobile, kanan di desktop */}
              <div className="order-1 sm:order-2 w-full sm:w-auto flex justify-start sm:justify-end">
                <Link
                  to="/capster/kasir/add"
                  className="flex items-center gap-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all"
                >
                  <Plus size={16} />
                  Tambah Capster
                </Link>
              </div>
            </div>

            {/* === Alert === */}
            {alert && (
              <div
                className={`px-4 py-3 rounded-lg text-sm font-medium border ${
                  alert.type === "success"
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {alert.text}
              </div>
            )}

            {/* === Table === */}
            {loading ? (
              <p className="text-gray-500 italic">Memuat data capster...</p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : filtered.length === 0 ? (
              <p className="text-gray-500 italic">Capster tidak ditemukan.</p>
            ) : (
              <TableData
                columns={columns}
                data={data}
                searchTerm={searchTerm}
              />
            )}

            {/* === Modal Konfirmasi Hapus === */}
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
          </div>
        );
      }}
    </MainLayout>
  );
}
