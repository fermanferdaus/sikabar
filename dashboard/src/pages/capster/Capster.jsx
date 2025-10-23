import MainLayout from "../../layouts/MainLayout";
import useFetchCapster from "../../hooks/useFetchCapster";
import useCapsterActions from "../../hooks/useCapsterActions";
import TableData from "../../components/TableData";
import { Link } from "react-router-dom";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import ConfirmModal from "../../components/ConfirmModal";

export default function Capster() {
  const { capsters, loading, error } = useFetchCapster();
  const { deleteCapster } = useCapsterActions();
  const role = localStorage.getItem("role");

  const [alert, setAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCapster, setSelectedCapster] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // 🚨 Ambil pesan dari localStorage
  useEffect(() => {
    const message = localStorage.getItem("capsterMessage");
    if (message) {
      setAlert(JSON.parse(message));
      localStorage.removeItem("capsterMessage");
      const timer = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timer);
    }
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
        const filtered = capsters.filter(
          (c) =>
            c.nama_capster.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.nama_store.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // 🔹 Kolom tabel
        const columns = [
          { key: "no", label: "#" },
          { key: "nama_capster", label: "Nama Capster" },
          { key: "nama_store", label: "Cabang" },
          { key: "status", label: "Status" },
        ];

        if (role === "admin") columns.push({ key: "aksi", label: "Aksi" });

        // 🔹 Data tabel
        const data = filtered.map((c, i) => ({
          no: i + 1,
          nama_capster: c.nama_capster,
          nama_store: c.nama_store,
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
          ...(role === "admin" && {
            aksi: (
              <div className="flex items-center justify-left gap-2">
                <Link
                  to={`/capster/edit/${c.id_capster}`}
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
          }),
        }));

        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  Data Capster
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Kelola daftar capster dan status aktif/nonaktif di setiap
                  cabang.
                </p>
              </div>

              {role === "admin" && (
                <Link
                  to="/capster/add"
                  className="flex items-center gap-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all"
                >
                  <Plus size={16} />
                  Tambah Capster
                </Link>
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
              <p className="text-gray-500">Capster tidak ditemukan.</p>
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
