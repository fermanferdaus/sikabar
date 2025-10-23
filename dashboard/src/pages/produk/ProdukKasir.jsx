import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useProdukAPI from "../../hooks/useProdukAPI";
import TableData from "../../components/TableData";
import { Pencil, Trash2, Plus } from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";

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

  // 🗑️ Hapus produk
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

  // 🔁 Reload otomatis setelah tambah/edit
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
          harga_awal: `Rp ${p.harga_awal.toLocaleString("id-ID")}`,
          harga_jual: `Rp ${p.harga_jual.toLocaleString("id-ID")}`,
          stok_awal: p.stok_awal,
          stok_sekarang: p.stok_sekarang,
          total_laba: (
            <span className="text-green-600 font-semibold">
              Rp {Number(p.total_laba || 0).toLocaleString("id-ID")}
            </span>
          ),
          aksi: (
            <div className="flex items-center justify-left gap-2">
              <button
                onClick={() => handleEdit(p.id_produk)}
                className="p-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white rounded-md"
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
                  Produk Kasir – {storeName || `Store #${id_store}`}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Kelola produk dan stok untuk toko Anda.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddProduk}
                  className="flex items-center gap-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all"
                >
                  <Plus size={16} />
                  Tambah Produk
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

            {/* 🗑️ Modal Hapus */}
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
          </div>
        );
      }}
    </MainLayout>
  );
}
