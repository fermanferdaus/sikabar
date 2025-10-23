import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useProdukAPI from "../../hooks/useProdukAPI";
import { Pencil, Trash2, Search } from "lucide-react"; // 🔍 Tambahkan ikon Search
import ConfirmModal from "../../components/ConfirmModal";

export default function ProdukKasir() {
  const navigate = useNavigate();
  const { getProdukByStore, deleteStokProduk } = useProdukAPI();

  const id_store = localStorage.getItem("id_store");
  const nama_user = localStorage.getItem("nama_user");

  const [produk, setProduk] = useState([]);
  const [filteredProduk, setFilteredProduk] = useState([]);
  const [search, setSearch] = useState("");
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notif, setNotif] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduk, setSelectedProduk] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // 🔔 Tampilkan notifikasi sukses setelah tambah/edit produk
  useEffect(() => {
    const savedMessage = localStorage.getItem("produkMessage");
    if (savedMessage) {
      const messageData = JSON.parse(savedMessage);
      setNotif(messageData);
      localStorage.removeItem("produkMessage");
      setTimeout(() => setNotif(null), 4000);
    }
  }, []);

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
    if (!id_store) {
      alert("Anda tidak memiliki store terdaftar!");
      navigate("/dashboard");
    } else {
      loadProduk();
    }
  }, [id_store]);

  // 🔍 Filter produk otomatis setiap kali search berubah
  useEffect(() => {
    const lower = search.toLowerCase();
    const filtered = produk.filter((p) =>
      p.nama_produk.toLowerCase().includes(lower)
    );
    setFilteredProduk(filtered);
  }, [search, produk]);

  // ➕ Tambah produk baru
  const handleAddProduk = () => {
    navigate(`/produk/addkasir`, { state: { fromStore: id_store } });
  };

  // ✏️ Edit produk
  const handleEdit = (id_produk) => {
    navigate(`/produk/editkasir/${id_produk}`, {
      state: { fromStore: id_store },
    });
  };

  // 🗑️ Tampilkan modal konfirmasi hapus
  const openDeleteModal = (produk) => {
    setSelectedProduk(produk);
    setShowModal(true);
  };

  // 🗑️ Konfirmasi hapus stok produk
  const confirmDelete = async () => {
    if (!selectedProduk) return;
    setDeleting(true);
    try {
      await deleteStokProduk(id_store, selectedProduk.id_produk);
      setShowModal(false);
      setSelectedProduk(null);
      setNotif({
        type: "success",
        text: `Produk "${selectedProduk.nama_produk}" berhasil dihapus dari toko.`,
      });
      await loadProduk();
      setTimeout(() => setNotif(null), 4000);
    } catch (err) {
      setNotif({
        type: "error",
        text: "Gagal menghapus produk: " + err.message,
      });
      setTimeout(() => setNotif(null), 4000);
    } finally {
      setDeleting(false);
    }
  };

  // 🔁 Reload otomatis setelah tambah/edit produk
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

  return (
    <MainLayout current="produk">
      {/* 🔹 Header Halaman */}
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

          <button
            onClick={handleAddProduk}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition"
          >
            + Tambah Produk
          </button>
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
            ? `Apakah Anda yakin ingin menghapus produk "${selectedProduk.nama_produk}" dari toko Anda?`
            : "Apakah Anda yakin ingin menghapus data ini?"
        }
      />
    </MainLayout>
  );
}
