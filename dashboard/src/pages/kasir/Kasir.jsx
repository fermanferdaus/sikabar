import MainLayout from "../../layouts/MainLayout";
import { useKasir } from "../../hooks/useKasir";
import TableData from "../../components/TableData";
import { Link } from "react-router-dom";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import ConfirmModal from "../../components/ConfirmModal";
import { formatKasirID } from "../../utils/formatID";

export default function Kasir() {
  const role = localStorage.getItem("role");

  const { kasir, loading, error, deleteKasir, alert, setAlert } = useKasir();

  const [showModal, setShowModal] = useState(false);
  const [selectedKasir, setSelectedKasir] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // 🗑️ Modal hapus
  const openDeleteModal = (kasir) => {
    setSelectedKasir(kasir);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedKasir) return;
    setDeleting(true);
    try {
      await deleteKasir(selectedKasir.id_kasir);

      setShowModal(false);
      setSelectedKasir(null);

      setAlert({
        type: "success",
        text: `Kasir "${selectedKasir.nama_kasir}" berhasil dihapus.`,
      });

      setTimeout(() => setAlert(null), 4000);
    } catch (err) {
      setAlert({
        type: "error",
        text: "Gagal menghapus kasir: " + err.message,
      });
      setTimeout(() => setAlert(null), 4000);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <MainLayout current="kasir">
      {(searchTerm) => {
        const filtered = kasir.filter(
          (k) =>
            k.nama_kasir.toLowerCase().includes(searchTerm.toLowerCase()) ||
            k.nama_store.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // 🧱 Kolom tabel
        const columns = [
          { key: "no", label: "#" },
          { key: "id_kasir", label: "ID Kasir" },
          { key: "nama_kasir", label: "Nama Kasir" },
          { key: "nama_store", label: "Cabang" },
          { key: "status", label: "Status" },
        ];

        if (role === "admin") columns.push({ key: "aksi", label: "Aksi" });

        // 🧱 Data tabel
        const data = filtered.map((k, i) => ({
          no: i + 1,
          id_kasir: (
            <span className="font-semibold text-slate-700">
              {formatKasirID(k.id_kasir)}
            </span>
          ),
          nama_kasir: k.nama_kasir,
          nama_store: k.nama_store,
          status: (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                k.status === "aktif"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {k.status}
            </span>
          ),
          ...(role === "admin" && {
            aksi: (
              <div className="flex items-center justify-left gap-2">
                <Link
                  to={`/kasir/edit/${k.id_kasir}`}
                  className="p-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white rounded-md"
                  title="Edit"
                >
                  <Pencil size={16} />
                </Link>

                <button
                  onClick={() => openDeleteModal(k)}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                  title="Hapus"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ),
          }),
        }));

        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  Data Kasir
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Kelola kasir untuk setiap cabang barbershop.
                </p>
              </div>

              {role === "admin" && (
                <div className="order-1 sm:order-2 w-full sm:w-auto flex justify-start sm:justify-end">
                  <Link
                    to="/kasir/add"
                    className="flex items-center gap-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all"
                  >
                    <Plus size={16} />
                    Tambah Kasir
                  </Link>
                </div>
              )}
            </div>

            {/* Alert */}
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

            {/* Table */}
            {loading ? (
              <p className="text-gray-500">Memuat data...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : filtered.length === 0 ? (
              <p className="text-gray-500">Kasir tidak ditemukan.</p>
            ) : (
              <TableData
                columns={columns}
                data={data}
                searchTerm={searchTerm}
              />
            )}

            {/* Modal Konfirmasi Hapus */}
            <ConfirmModal
              open={showModal}
              onClose={() => setShowModal(false)}
              onConfirm={confirmDelete}
              loading={deleting}
              message={
                selectedKasir
                  ? `Apakah Anda yakin ingin menghapus kasir "${selectedKasir.nama_kasir}"?`
                  : "Apakah Anda yakin ingin menghapus data ini?"
              }
            />
          </div>
        );
      }}
    </MainLayout>
  );
}
