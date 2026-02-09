import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useProdukAPI from "../../hooks/useProdukAPI";
import TableData from "../../components/TableData";
import { Pencil, Trash2, Plus, Calendar } from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";
import { formatKodeProduk } from "../../utils/formatProduk";
import BackButton from "../../components/BackButton";

export default function ProdukStokDetail() {
  const { id_store } = useParams();
  const navigate = useNavigate();
  const { getProdukByStore, deleteStokProduk } = useProdukAPI();

  const [produk, setProduk] = useState([]);
  const [storeName, setStoreName] = useState(null);
  const [storeLoading, setStoreLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notif, setNotif] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduk, setSelectedProduk] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  // Filter
  const [filterType] = useState("Bulanan");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Load data
  const loadProduk = async () => {
    setLoading(true);
    try {
      const data = await getProdukByStore(id_store, filterType, tanggal);
      setProduk(data);
      if (data.length > 0) setStoreName(data[0].nama_store || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchStoreById = async () => {
      try {
        setStoreLoading(true);

        const res = await fetch(`${API_URL}/store/${id_store}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Gagal mengambil data store");

        const data = await res.json();

        if (isMounted) {
          setStoreName(data.nama_store);
        }
      } catch (err) {
        console.error("❌ fetchStoreById:", err.message);
        if (isMounted) setStoreName("Store tidak ditemukan");
      } finally {
        if (isMounted) setStoreLoading(false);
      }
    };

    fetchStoreById();

    return () => {
      isMounted = false;
    };
  }, [id_store]);

  useEffect(() => {
    loadProduk();
  }, [id_store, filterType, tanggal]);

  // Navigation
  const handleAddProduk = () => {
    navigate(`/produk/add`, { state: { fromStore: id_store } });
  };

  const handleEdit = (id_produk) => {
    navigate(`/produk/edit/${id_produk}`, { state: { fromStore: id_store } });
  };

  // Modal hapus
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
        text: `Produk "${selectedProduk.nama_produk}" telah dihapus.`,
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

  return (
    <MainLayout current="produk">
      {(searchTerm) => {
        const filteredProduk = produk.filter((p) =>
          p.nama_produk.toLowerCase().includes(searchTerm.toLowerCase()),
        );

        // Total laba summary
        const totalLaba = filteredProduk.reduce(
          (sum, p) => sum + (Number(p.total_laba) || 0),
          0,
        );

        const columns = [
          { key: "no", label: "#" },
          { key: "kode_produk", label: "Kode Produk" },
          { key: "nama_produk", label: "Nama Produk" },
          { key: "harga_awal", label: "Harga Awal" },
          { key: "harga_jual", label: "Harga Jual" },
          { key: "stok_awal", label: "Stok Awal" },
          { key: "stok_sekarang", label: "Stok Sekarang" },
          { key: "total_laba", label: "Laba" },
          { key: "aksi", label: "Aksi" },
        ];

        const data = filteredProduk.map((p, i) => ({
          no: i + 1,

          kode_produk: (
            <span className="font-semibold text-slate-700">
              {formatKodeProduk(p.id_produk)}
            </span>
          ),

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
                className="p-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white rounded-md"
              >
                <Pencil size={16} />
              </button>

              <button
                onClick={() => openDeleteModal(p)}
                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ),
        }));

        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8 transition-all duration-300">
            {/* Back button */}
            <BackButton to="/produk" />

            {/* === Header === */}
            <div className="border-b border-gray-100 pb-4 space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h1 className="text-xl font-semibold text-slate-800">
                    Stok Produk –{" "}
                    {storeLoading ? (
                      <span className="text-gray-400">Memuat toko...</span>
                    ) : (
                      storeName
                    )}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Kelola data produk dan stok pada toko ini.
                  </p>
                </div>

                <div className="flex justify-start">
                  <button
                    onClick={handleAddProduk}
                    className="flex items-center gap-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition"
                  >
                    <Plus size={16} /> Tambah Produk
                  </button>
                </div>
              </div>
            </div>

            {/* === Filter === */}
            <div className="flex flex-wrap items-center gap-4 bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <label className="text-gray-600 font-medium text-sm">
                  Bulan:
                </label>
                <input
                  type="month"
                  value={tanggal.slice(0, 7)}
                  onChange={(e) => setTanggal(e.target.value + "-01")}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                />
              </div>
            </div>

            {/* === SUMMARY TOTAL LABA === */}
            {filteredProduk.length > 0 && (
              <div className="grid sm:grid-cols-1 gap-6 mt-2">
                <div className="p-5 bg-white shadow-sm rounded-xl border border-gray-100 text-center">
                  <p className="text-gray-500">Total Laba Produk</p>
                  <h2 className="text-3xl font-bold text-emerald-600 mt-1">
                    Rp {totalLaba.toLocaleString("id-ID")}
                  </h2>
                </div>
              </div>
            )}

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

            {/* === TABEL === */}
            {loading ? (
              <p className="text-gray-500">Memuat data...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : filteredProduk.length === 0 ? (
              <p className="text-gray-500">Tidak ada produk.</p>
            ) : (
              <TableData
                columns={columns}
                data={data}
                searchTerm={searchTerm}
              />
            )}

            <ConfirmModal
              open={showModal}
              onClose={() => setShowModal(false)}
              onConfirm={confirmDelete}
              loading={deleting}
              message={
                selectedProduk
                  ? `Hapus produk "${selectedProduk.nama_produk}" dari toko ini?`
                  : "Apakah Anda yakin?"
              }
            />
          </div>
        );
      }}
    </MainLayout>
  );
}
