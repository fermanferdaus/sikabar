import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useProdukAPI from "../../hooks/useProdukAPI";
import { Pencil, Trash2, X } from "lucide-react";

export default function ProdukKasir() {
  const navigate = useNavigate();
  const { getProdukByStore, deleteStokProduk } = useProdukAPI();

  const id_store = localStorage.getItem("id_store");
  const nama_user = localStorage.getItem("nama_user");

  const [produk, setProduk] = useState([]);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">
          Stok Produk – {storeName || `Store #${id_store}`}
        </h1>
        <div className="flex items-center gap-3">
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
      ) : produk.length === 0 ? (
        <p className="text-gray-500">Belum ada produk di toko Anda.</p>
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
              {produk.map((p, i) => (
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
                  {produk
                    .reduce((sum, p) => sum + (Number(p.total_laba) || 0), 0)
                    .toLocaleString("id-ID")}
                </td>
                <td className="border"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* 🔸 Modal Konfirmasi Hapus */}
      {showModal && selectedProduk && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] sm:w-[400px] relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Konfirmasi Hapus
            </h2>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus{" "}
              <span className="font-semibold text-red-600">
                "{selectedProduk.nama_produk}"
              </span>{" "}
              dari toko Anda?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                disabled={deleting}
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className={`px-4 py-2 rounded-lg text-white transition ${
                  deleting
                    ? "bg-red-400 cursor-wait"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {deleting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
