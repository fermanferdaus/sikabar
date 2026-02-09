import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import TableData from "../../components/TableData";
import ConfirmModal from "../../components/ConfirmModal";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatTanggal } from "../../utils/dateFormatter";
import useFetchPengeluaranKasir from "../../hooks/useFetchPengeluaranKasir";

export default function PengeluaranKasir() {
  const navigate = useNavigate();
  const { pengeluaran, storeName, loading, error, refetch } =
    useFetchPengeluaranKasir();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [alertMsg, setAlertMsg] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const storedMsg = localStorage.getItem("pengeluaranMessage");
    if (storedMsg) {
      setAlertMsg(JSON.parse(storedMsg));
      localStorage.removeItem("pengeluaranMessage");
      setTimeout(() => setAlertMsg(null), 4000);
    }
  }, []);

  const [filterType, setFilterType] = useState("Bulanan");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [filterKategori, setFilterKategori] = useState("Semua");

  const kategoriList = useMemo(() => {
    const setKtg = new Set(pengeluaran.map((p) => p.kategori).filter(Boolean));
    return ["Semua", ...Array.from(setKtg)];
  }, [pengeluaran]);

  const filteredPengeluaran = useMemo(() => {
    const date = new Date(selectedDate);
    return pengeluaran.filter((p) => {
      const itemDate = new Date(p.tanggal);
      const matchTanggal =
        filterType === "Harian"
          ? itemDate.getDate() === date.getDate() &&
            itemDate.getMonth() === date.getMonth() &&
            itemDate.getFullYear() === date.getFullYear()
          : itemDate.getMonth() === date.getMonth() &&
            itemDate.getFullYear() === date.getFullYear();

      const matchKategori =
        filterKategori === "Semua" ||
        (p.kategori || "").toLowerCase() === filterKategori.toLowerCase();

      return matchTanggal && matchKategori;
    });
  }, [pengeluaran, filterType, selectedDate, filterKategori]);

  const jumlahTransaksi = filteredPengeluaran.length;
  const totalPengeluaran = filteredPengeluaran.reduce(
    (sum, p) => sum + (Number(p.jumlah) || 0),
    0,
  );

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);

    try {
      const res = await fetch(`${API_URL}/pengeluaran/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setAlertMsg({ type: "success", text: "Pengeluaran berhasil dihapus!" });
        refetch?.();
        setTimeout(() => setAlertMsg(null), 4000);
      } else {
        setAlertMsg({
          type: "error",
          text: data.message || "Gagal menghapus pengeluaran.",
        });
      }
    } catch (err) {
      console.error("❌ Error delete pengeluaran:", err);
      setAlertMsg({
        type: "error",
        text: "Terjadi kesalahan pada server.",
      });
    } finally {
      setDeleting(false);
      setShowModal(false);
      setDeleteId(null);
    }
  };

  const columns = [
    { key: "no", label: "#" },
    { key: "tanggal", label: "Tanggal" },
    { key: "kategori", label: "Kategori" },
    { key: "deskripsi", label: "Deskripsi" },
    { key: "jumlah", label: "Jumlah" },
    { key: "bukti", label: "Bukti" },
    { key: "aksi", label: "Aksi" },
  ];

  const data = filteredPengeluaran.map((p, i) => ({
    no: i + 1,
    tanggal: formatTanggal(p.tanggal),
    kategori: p.kategori || "-",
    deskripsi: p.deskripsi || "-",
    jumlah: (
      <span className="font-medium text-slate-700">
        Rp {Number(p.jumlah || 0).toLocaleString("id-ID")}
      </span>
    ),
    bukti: p.bukti_path ? (
      <button
        onClick={() => window.open(`${BACKEND_URL}${p.bukti_path}`, "_blank")}
        className="px-3 py-1.5 text-xs font-medium rounded-md text-white bg-[#0e57b5] hover:bg-[#0b4894] transition"
      >
        Lihat
      </button>
    ) : (
      <button
        disabled
        className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-300 text-gray-500 cursor-not-allowed"
      >
        Tidak ada
      </button>
    ),
    aksi: (
      <div className="flex items-center justify-left gap-2">
        <button
          onClick={() =>
            navigate(`/pengeluaran/kasir/edit/${p.id_pengeluaran}`)
          }
          className="p-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white rounded-md transition duration-200"
          title="Edit"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => openDeleteModal(p.id_pengeluaran)}
          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition duration-200"
          title="Hapus"
        >
          <Trash2 size={16} />
        </button>
      </div>
    ),
  }));

  return (
    <MainLayout current="pengeluaran">
      {(searchTerm) => {
        const searched = data.filter(
          (p) =>
            p.kategori?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()),
        );

        return (
          <>
            {/* === Modal Konfirmasi Hapus === */}
            <ConfirmModal
              open={showModal}
              title="Konfirmasi Hapus"
              message="Apakah Anda yakin ingin menghapus data pengeluaran ini? Tindakan ini tidak dapat dibatalkan."
              onClose={() => setShowModal(false)}
              onConfirm={handleConfirmDelete}
              loading={deleting}
            />

            {/* === Konten Utama === */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8 transition-all duration-300">
              {/* === Header === */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <h1 className="text-xl font-semibold text-slate-800">
                    Pengeluaran – {storeName || "Store Anda"}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Lihat, tambah, ubah, atau hapus data pengeluaran toko Anda.
                  </p>
                </div>

                <div className="flex justify-start md:justify-end w-full md:w-auto">
                  <button
                    onClick={() => navigate(`/pengeluaran/kasir/add`)}
                    className="flex items-center gap-2 bg-[#0e57b5] hover:bg-[#0b4894] 
                 text-white px-4 py-2.5 rounded-lg text-sm font-medium 
                 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <Plus size={16} /> Tambah Pengeluaran
                  </button>
                </div>
              </div>

              {/* === Alert === */}
              {alertMsg && (
                <div
                  className={`rounded-lg px-4 py-3 border text-sm font-medium mb-4 transition-all duration-500 ${
                    alertMsg.type === "success"
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  {alertMsg.text}
                </div>
              )}

              {/* === Filter Bar === */}
              <div className="flex flex-wrap items-center gap-4 bg-white border border-gray-100 rounded-xl p-4">
                {/* Filter Tipe */}
                <div className="flex items-center gap-2">
                  <label className="text-gray-600 font-medium text-sm">
                    Tipe:
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Harian">Harian</option>
                    <option value="Bulanan">Bulanan</option>
                  </select>
                </div>

                {/* Input kalender adaptif */}
                <div className="flex items-center gap-2">
                  <label className="text-gray-600 font-medium text-sm">
                    {filterType === "Harian" ? "Tanggal:" : "Bulan:"}
                  </label>
                  {filterType === "Harian" ? (
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  ) : (
                    <input
                      type="month"
                      value={selectedDate.slice(0, 7)}
                      onChange={(e) => setSelectedDate(e.target.value + "-01")}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  )}
                </div>

                {/* Filter Kategori */}
                <div className="flex items-center gap-2">
                  <label className="text-gray-600 font-medium text-sm">
                    Kategori:
                  </label>
                  <select
                    value={filterKategori}
                    onChange={(e) => setFilterKategori(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {kategoriList.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* === Summary Cards === */}
              <div className="grid sm:grid-cols-2 gap-6 mt-2">
                <div className="p-5 bg-white shadow-sm rounded-xl text-center transition hover:-translate-y-1 hover:shadow-md duration-300">
                  <p className="text-gray-500">Jumlah Transaksi</p>
                  <h2 className="text-3xl font-bold text-blue-600 mt-1">
                    {jumlahTransaksi}
                  </h2>
                </div>
                <div className="p-5 bg-white shadow-sm rounded-xl text-center transition hover:-translate-y-1 hover:shadow-md duration-300">
                  <p className="text-gray-500">Total Pengeluaran</p>
                  <h2 className="text-3xl font-bold text-green-600 mt-1">
                    Rp {totalPengeluaran.toLocaleString("id-ID")}
                  </h2>
                </div>
              </div>

              {/* === Konten === */}
              {loading ? (
                <p className="text-gray-500">Memuat data...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : searched.length === 0 ? (
                <p className="text-gray-500 italic text-center py-4">
                  Tidak ada data untuk periode ini.
                </p>
              ) : (
                <TableData columns={columns} data={searched} />
              )}
            </div>
          </>
        );
      }}
    </MainLayout>
  );
}
