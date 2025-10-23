import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useProdukAPI from "../../hooks/useProdukAPI";
import TableData from "../../components/TableData";
import { Pencil, Trash2, Plus, ArrowLeft } from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";

export default function ProdukStokDetail() {
  const { id_store } = useParams();
  const navigate = useNavigate();
  const { getProdukByStore, deleteStokProduk } = useProdukAPI();

  const [produk, setProduk] = useState([]);
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notif, setNotif] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduk, setSelectedProduk] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // 🔁 Ambil data stok produk
  const loadProduk = async () => {
    setLoading(true);
    try {
      const data = await getProdukByStore(id_store);
      setProduk(data);
      if (data.length > 0) setStoreName(data[0].nama_store || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduk();
  }, [id_store]);

  const handleAddProduk = () => {
    navigate(`/produk/add`, { state: { fromStore: id_store } });
  };

  const handleEdit = (id_produk) => {
    navigate(`/produk/edit/${id_produk}`, { state: { fromStore: id_store } });
  };

  const openDeleteModal = (produk) => {
    setSelectedProduk(produk);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduk) return;
    setDeleting(true);
    try {
      await deleteStokProduk(id_store, selectedProduk.id_produk);
      setShowModal(false);
      setSelectedProduk(null);
      setNotif({
        type: "success",
        text: `Stok produk "${selectedProduk.nama_produk}" berhasil dihapus dari toko ini.`,
      });
      await loadProduk();
      setTimeout(() => setNotif(null), 4000);
    } catch (err) {
      setNotif({
        type: "error",
        text: "Gagal menghapus stok produk: " + err.message,
      });
      setTimeout(() => setNotif(null), 4000);
    } finally {
      setDeleting(false);
    }
  };

  // === Komponen utama ===
  return (
    <MainLayout current="produk">
      {(searchTerm) => {
        const filteredProduk = produk.filter((p) =>
          p.nama_produk.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const totalLaba = filteredProduk.reduce(
          (sum, p) => sum + (Number(p.total_laba) || 0),
          0
        );

        const columns = [
          { key: "no", label: "#" },
          { key: "nama_produk", label: "Nama Produk" },
          { key: "harga_awal", label: "Harga Awal" },
          { key: "harga_jual", label: "Harga Jual" },
          { key: "stok_awal", label: "Stok Awal" },
          { key: "stok_sekarang", label: "Stok Sekarang" },
          { key: "total_laba", label: "Laba Total" },
          { key: "aksi", label: "Aksi" },
        ];

        const data = filteredProduk.map((p, i) => ({
          no: i + 1,
          nama_produk: p.nama_produk,
          harga_awal: `Rp ${Number(p.harga_awal).toLocaleString("id-ID")}`,
          harga_jual: `Rp ${Number(p.harga_jual).toLocaleString("id-ID")}`,
          stok_awal: p.stok_awal,
          stok_sekarang: p.stok_sekarang,
          total_laba: (
            <span className="text-green-600 font-semibold">
              Rp {Number(p.total_laba).toLocaleString("id-ID")}
            </span>
          ),
          aksi: (
            <div className="flex items-center justify-left gap-2">
              <button
                onClick={() => handleEdit(p.id_produk)}
                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                title="Edit"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => openDeleteModal(p)}
                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                title="Hapus"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ),
        }));

        return (
          <div className="bg-white shadow-md rounded-2xl border border-gray-100 p-8 space-y-6">
            {/* === Header === */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  Stok Produk – {storeName || `Store #${id_store}`}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Kelola data produk dan stok yang tersedia di toko ini.
                </p>
              </div>

              <div className="flex gap-2">
                {/* Tombol Tambah Produk */}
                <button
                  onClick={handleAddProduk}
                  className="flex items-center gap-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Plus size={16} />
                  Tambah Produk
                </button>

                {/* Tombol Kembali */}
                <button
                  onClick={() => navigate(`/produk`)}
                  className="flex items-center gap-2 bg-[#f3f6fb] text-[#0e57b5] px-4 py-2.5 rounded-xl text-sm font-medium border border-[#e4e7ec] hover:bg-[#eaf0fa] hover:shadow-sm transition-all duration-200"
                >
                  <ArrowLeft size={16} />
                  Kembali
                </button>
              </div>
            </div>

            {/* 🔔 Notifikasi */}
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

            {/* === Tabel Produk === */}
            {loading ? (
              <p className="text-gray-500">Memuat data...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : filteredProduk.length === 0 ? (
              <p className="text-gray-500">Produk tidak ditemukan.</p>
            ) : (
              <>
                <TableData
                  columns={columns}
                  data={data}
                  searchTerm={searchTerm}
                />
                <div className="flex justify-end mt-4 text-sm font-semibold text-gray-700 border-t border-gray-200 pt-3">
                  <span>
                    Total Laba:&nbsp;
                    <span className="text-green-600">
                      Rp {totalLaba.toLocaleString("id-ID")}
                    </span>
                  </span>
                </div>
              </>
            )}

            {/* 🗑️ Modal Konfirmasi Hapus */}
            <ConfirmModal
              open={showModal}
              onClose={() => setShowModal(false)}
              onConfirm={confirmDelete}
              loading={deleting}
              message={
                selectedProduk
                  ? `Apakah Anda yakin ingin menghapus produk "${selectedProduk.nama_produk}" dari store ini?`
                  : "Apakah Anda yakin ingin menghapus data ini?"
              }
            />
          </div>
        );
      }}
    </MainLayout>
  );
}
