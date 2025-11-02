import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchKomisiSetting from "../../hooks/useFetchKomisiSetting";
import { formatTanggalJam } from "../../utils/dateFormatter";
import { Pencil, Trash2 } from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";
import TableData from "../../components/TableData";

export default function KomisiSetting() {
  const { data, loading, error, deleteKomisi } = useFetchKomisiSetting();
  const navigate = useNavigate();

  const [notif, setNotif] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);

  useEffect(() => {
    const savedMessage = localStorage.getItem("komisiMessage");
    if (savedMessage) {
      const msg = JSON.parse(savedMessage);
      setNotif(msg);
      localStorage.removeItem("komisiMessage");
      setTimeout(() => setNotif(null), 4000);
    }
  }, []);

  const handleDelete = (id, storeName) => {
    setSelectedId(id);
    setSelectedStore(storeName);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteKomisi(selectedId);
      setNotif({
        type: "success",
        text: `Pengaturan komisi untuk store "${selectedStore}" berhasil dihapus.`,
      });
    } catch {
      setNotif({
        type: "error",
        text: "Gagal menghapus pengaturan komisi.",
      });
    } finally {
      setShowModal(false);
      setSelectedId(null);
      setSelectedStore(null);
      setTimeout(() => setNotif(null), 4000);
    }
  };

  return (
    <MainLayout current="komisi setting">
      {(searchTerm) => {
        const filtered = data.filter((item) =>
          item.nama_store.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const columns = [
          { key: "no", label: "#" },
          { key: "nama_capster", label: "Nama Capster" },
          { key: "nama_store", label: "Cabang" },
          { key: "persentase_capster", label: "Persentase Komisi (%)" },
          { key: "updated_at", label: "Update Terakhir" },
          { key: "aksi", label: "Aksi" },
        ];

        const tableData = filtered.map((item, i) => ({
          no: i + 1,
          nama_capster: item.nama_capster,
          nama_store: item.nama_store,
          persentase_capster: (
            <div className="text-left text-blue-700 font-medium">
              {Math.floor(item.persentase_capster)}%
            </div>
          ),
          updated_at: (
            <div className="text-left">{formatTanggalJam(item.updated_at)}</div>
          ),
          aksi: (
            <div className="flex items-center justify-left gap-2">
              <button
                onClick={() =>
                  navigate(`/komisi-setting/edit/${item.id_setting}`)
                }
                className="p-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white rounded-md"
                title="Edit"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => handleDelete(item.id_setting, item.nama_capster)}
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
            {/* === Header === */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
              {/* Kiri: Judul & Deskripsi */}
              <div className="text-left">
                <h1 className="text-xl font-semibold text-slate-800">
                  Pengaturan Komisi Capster
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Atur persentase komisi untuk setiap cabang/barbershop.
                </p>
              </div>

              {/* Kanan: Tombol Tambah */}
              <div className="w-full sm:w-auto sm:justify-end flex mt-2 sm:mt-0">
                <button
                  onClick={() => navigate("/komisi-setting/add")}
                  className="flex items-center gap-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                >
                  + Tambah Komisi
                </button>
              </div>
            </div>

            {/* === Notifikasi === */}
            {notif && (
              <div
                className={`px-4 py-3 rounded-lg text-sm font-medium border ${
                  notif.type === "success"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}
              >
                {notif.text}
              </div>
            )}

            {/* === Konten === */}
            {loading ? (
              <p className="text-gray-500">Memuat data komisi...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : filtered.length === 0 ? (
              <p className="text-gray-500">Data tidak ditemukan.</p>
            ) : (
              <TableData columns={columns} data={tableData} />
            )}

            <ConfirmModal
              open={showModal}
              onClose={() => setShowModal(false)}
              onConfirm={confirmDelete}
              message={`Apakah Anda yakin ingin menghapus pengaturan komisi untuk store "${selectedStore}"?`}
            />
          </div>
        );
      }}
    </MainLayout>
  );
}
