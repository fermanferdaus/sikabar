import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import TableData from "../../components/TableData";
import ConfirmModal from "../../components/ConfirmModal";
import { Pencil, Trash2, Plus } from "lucide-react";
import useFetchPricelist from "../../hooks/useFetchPricelist";

export default function Pricelist() {
  const { data, loading, error, deletePricelist } = useFetchPricelist();
  const navigate = useNavigate();

  const [notif, setNotif] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  // 🔔 Ambil pesan dari localStorage
  useEffect(() => {
    const savedMessage = localStorage.getItem("pricelistMessage");
    if (savedMessage) {
      const msg = JSON.parse(savedMessage);
      setNotif(msg);
      localStorage.removeItem("pricelistMessage");
      setTimeout(() => setNotif(null), 4000);
    }
  }, []);

  // 🗑️ Aksi hapus layanan
  const handleDelete = (id, name) => {
    setSelectedId(id);
    setSelectedService(name);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deletePricelist(selectedId);
      setNotif({
        type: "success",
        text: `Layanan "${selectedService}" berhasil dihapus.`,
      });
    } catch {
      setNotif({
        type: "error",
        text: "Gagal menghapus layanan.",
      });
    } finally {
      setShowModal(false);
      setSelectedId(null);
      setSelectedService(null);
      setTimeout(() => setNotif(null), 4000);
    }
  };

  return (
    <MainLayout current="pricelist">
      {(searchTerm) => {
        const filteredData = data.filter((item) =>
          item.service.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const columns = [
          { key: "no", label: "#" },
          { key: "service", label: "Nama Layanan" },
          { key: "keterangan", label: "Keterangan" },
          { key: "harga", label: "Harga" },
          { key: "aksi", label: "Aksi" },
        ];

        const tableData = filteredData.map((item, i) => ({
          no: i + 1,
          service: item.service,
          keterangan: item.keterangan || "-", // ✅ tampilkan deskripsi atau "-"
          harga: (
            <div className="text-left text-green-600 font-semibold">
              Rp {Number(item.harga).toLocaleString("id-ID")}
            </div>
          ),
          aksi: (
            <div className="flex items-left justify-left gap-2">
              <button
                onClick={() => navigate(`/pricelist/edit/${item.id_pricelist}`)}
                className="p-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white rounded-md"
                title="Edit"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => handleDelete(item.id_pricelist, item.service)}
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
                  Daftar Harga
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Kelola daftar layanan dan harga barbershop Anda.
                </p>
              </div>

              {/* 🔹 Tombol Tambah Layanan: kiri di mobile, kanan di desktop */}
              <div className="order-1 sm:order-2 flex justify-start sm:justify-end w-full sm:w-auto">
                <button
                  onClick={() => navigate("/pricelist/add")}
                  className="flex items-center gap-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Plus size={16} />
                  Tambah Layanan
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

            {/* === Konten === */}
            {loading ? (
              <p className="text-gray-500 italic">Memuat data layanan...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : filteredData.length === 0 ? (
              <p className="text-gray-500 italic">Layanan tidak ditemukan.</p>
            ) : (
              <TableData columns={columns} data={tableData} />
            )}

            {/* === Modal Hapus === */}
            <ConfirmModal
              open={showModal}
              onClose={() => setShowModal(false)}
              onConfirm={confirmDelete}
              message={`Apakah Anda yakin ingin menghapus layanan "${selectedService}"?`}
            />
          </div>
        );
      }}
    </MainLayout>
  );
}
