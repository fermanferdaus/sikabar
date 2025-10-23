import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useProdukAPI from "../../hooks/useProdukAPI";
import { Pencil, Trash2, Search } from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";

export default function ProdukStokDetail() {
  const { id_store } = useParams();
  const navigate = useNavigate();
  const { getProdukByStore, deleteStokProduk } = useProdukAPI();

  const [produk, setProduk] = useState([]);
  const [filteredProduk, setFilteredProduk] = useState([]);
  const [storeName, setStoreName] = useState("");
  const [search, setSearch] = useState("");
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
      setFilteredProduk(data);
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

  // 🔍 Filter produk berdasarkan nama
  useEffect(() => {
    const lower = search.toLowerCase();
    const filtered = produk.filter((p) =>
      p.nama_produk.toLowerCase().includes(lower)
    );
    setFilteredProduk(filtered);
  }, [search, produk]);

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
        text: `Stok produk "${selectedProduk.nama_produk}" berhasil dihapus dari toko ini`,
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

  useEffect(() => {
    const handleReload = (event) => {
      if (event.key === "reloadProduk" && event.newValue === "true") {
        loadProduk();
        localStorage.removeItem("reloadProduk");
      }
    };
    window.addEventListener("storage", handleReload);
    return () => window.removeEventListener("storage", handleReload);
  }, []);

  useEffect(() => {
    const storedMsg = localStorage.getItem("produkMessage");
    if (storedMsg) {
      const msg = JSON.parse(storedMsg);
      setNotif(msg);
      localStorage.removeItem("produkMessage");
      setTimeout(() => setNotif(null), 4000);
    }
  }, []);

  return (
    <MainLayout current="produk">
      {/* 🔹 Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">
          Stok Produk – {storeName || `Store #${id_store}`}
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
              placeholder="Cari nama produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddProduk}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition"
            >
              + Tambah Produk
            </button>

            <button
              onClick={() => navigate(`/produk`)}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              ← Kembali
            </button>
          </div>
        </div>
      </div>

      {/* 🔔 Notifikasi */}
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

      {/* 🔹 Tabel Produk */}
      {loading ? (
        <p className="text-gray-500">Memuat data...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : filteredProduk.length === 0 ? (
        <p className="text-gray-500">Produk tidak ditemukan.</p>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-xl shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 border">#</th>
                <th className="p-3 border text-left">Nama Produk</th>
                <th className="p-3 border text-center">Harga Awal</th>
                <th className="p-3 border text-center">Harga Jual</th>
                <th className="p-3 border text-center">Stok Awal</th>
                <th className="p-3 border text-center">Stok Sekarang</th>
                <th className="p-3 border text-center text-green-700">
                  Laba Total
                </th>
                <th className="p-3 border text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="text-gray-700">
              {filteredProduk.map((p, i) => (
                <tr key={p.id_produk} className="hover:bg-gray-50 transition">
                  <td className="p-3 border text-center">{i + 1}</td>
                  <td className="p-3 border">{p.nama_produk}</td>
                  <td className="p-3 border text-center">
                    Rp {p.harga_awal.toLocaleString("id-ID")}
                  </td>
                  <td className="p-3 border text-center">
                    Rp {p.harga_jual.toLocaleString("id-ID")}
                  </td>
                  <td className="p-3 border text-center">{p.stok_awal}</td>
                  <td className="p-3 border text-center">{p.stok_sekarang}</td>
                  <td className="p-3 border text-center font-semibold text-green-600">
                    Rp {Number(p.total_laba || 0).toLocaleString("id-ID")}
                  </td>
                  <td className="p-3 border text-center">
                    <div className="flex items-center justify-center gap-2">
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
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot className="bg-gray-50 font-semibold text-gray-800">
              <tr>
                <td colSpan="6" className="p-3 text-right border">
                  Total Laba:
                </td>
                <td className="p-3 border text-center text-green-700">
                  Rp{" "}
                  {filteredProduk
                    .reduce((sum, p) => sum + (Number(p.total_laba) || 0), 0)
                    .toLocaleString("id-ID")}
                </td>
                <td className="border"></td>
              </tr>
            </tfoot>
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
          selectedProduk
            ? `Apakah Anda yakin ingin menghapus produk "${selectedProduk.nama_produk}" dari store ini?`
            : "Apakah Anda yakin ingin menghapus data ini?"
        }
      />
    </MainLayout>
  );
}
