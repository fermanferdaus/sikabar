import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import TableData from "../../components/TableData";
import ConfirmModal from "../../components/ConfirmModal";
import { formatTanggal } from "../../utils/dateFormatter";
import { Plus, Pencil, Trash2 } from "lucide-react";
import useFetchPengeluaran from "../../hooks/useFetchPengeluaran";

export default function Pengeluaran() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [adminPengeluaran, setAdminPengeluaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState(null);

  const { deletePengeluaran } = useFetchPengeluaran();

  const API_URL = import.meta.env.VITE_API_URL;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // === Filter State ===
  const [filterType, setFilterType] = useState("Bulanan");
  const [filterKategori, setFilterKategori] = useState("Semua");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0]
  );

  const formatLocalDate = (d) => d.toLocaleDateString("en-CA");

  // === Alert handling ===
  useEffect(() => {
    const storedMsg = localStorage.getItem("pengeluaranMessage");
    if (storedMsg) {
      const parsed = JSON.parse(storedMsg);
      setAlert(parsed);
      localStorage.removeItem("pengeluaranMessage");
      setTimeout(() => setAlert(null), 4000);
    }
  }, []);

  // === Ambil rekap cabang ===
  useEffect(() => {
    const fetchCabang = async () => {
      try {
        const res = await fetch(`${API_URL}/pengeluaran/total`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.status !== "success")
          throw new Error(json.message || "Gagal memuat data pengeluaran");
        setStores(json.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCabang();
  }, []);

  // === Ambil pengeluaran admin ===
  useEffect(() => {
    if (role === "admin") {
      const fetchAdminPengeluaran = async () => {
        try {
          const res = await fetch(`${API_URL}/pengeluaran`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const json = await res.json();
          if (json.status !== "success")
            throw new Error(json.message || "Gagal memuat pengeluaran admin");
          const adminOnly = (json.data || []).filter((p) => !p.id_store);
          setAdminPengeluaran(adminOnly);
        } catch (err) {
          console.error("❌ Error get admin pengeluaran:", err);
        }
      };
      fetchAdminPengeluaran();
    }
  }, [role]);

  // === Hapus data ===
  const handleDeleteClick = (id_pengeluaran) => {
    setSelectedId(id_pengeluaran);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    setDeleting(true);
    const res = await deletePengeluaran(selectedId);
    if (res.status === "success") {
      setAdminPengeluaran((prev) =>
        prev.filter((p) => p.id_pengeluaran !== selectedId)
      );
      setConfirmOpen(false);
      setAlert({ type: "success", text: "Data pengeluaran berhasil dihapus!" });
      localStorage.setItem(
        "pengeluaranMessage",
        JSON.stringify({
          type: "success",
          text: "Data pengeluaran berhasil dihapus!",
        })
      );
      setTimeout(() => setAlert(null), 4000);
    } else {
      setAlert({ type: "error", text: "Gagal menghapus data pengeluaran!" });
      setTimeout(() => setAlert(null), 4000);
    }
    setDeleting(false);
  };

  // === Kolom tabel ===
  const columnsCabang = [
    { key: "no", label: "#" },
    { key: "nama_store", label: "Nama Cabang" },
    { key: "total_transaksi", label: "Jumlah Transaksi" },
    { key: "total_pengeluaran", label: "Total Pengeluaran (Rp)" },
    { key: "aksi", label: "Aksi" },
  ];

  const columnsAdmin = [
    { key: "no", label: "#" },
    { key: "tanggal", label: "Tanggal" },
    { key: "kategori", label: "Kategori" },
    { key: "deskripsi", label: "Deskripsi" },
    { key: "jumlah", label: "Jumlah (Rp)" },
    { key: "bukti", label: "Bukti" },
    { key: "aksi", label: "Aksi" },
  ];

  // === Filter pengeluaran admin ===
  const filteredAdminData = adminPengeluaran.filter((p) => {
    const matchKategori =
      filterKategori === "Semua" ||
      (p.kategori || "").toLowerCase() === filterKategori.toLowerCase();
    const tgl = new Date(p.tanggal);
    const selected = new Date(tanggal);
    const matchTanggal =
      filterType === "Harian"
        ? formatLocalDate(tgl) === formatLocalDate(selected)
        : tgl.getMonth() === selected.getMonth() &&
          tgl.getFullYear() === selected.getFullYear();
    return matchKategori && matchTanggal;
  });

  const kategoriList = [
    "Semua",
    ...new Set(adminPengeluaran.map((p) => p.kategori).filter(Boolean)),
  ];

  return (
    <MainLayout current="pengeluaran">
      {(searchTerm) => {
        const filteredStores = stores.filter((s) =>
          s.nama_store.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const filteredAdminSearch = filteredAdminData.filter(
          (p) =>
            p.kategori?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            formatTanggal(p.tanggal)
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())
        );

        const dataAdminFiltered = filteredAdminSearch.map((p, i) => ({
          no: i + 1,
          tanggal: formatTanggal(p.tanggal),
          kategori: p.kategori || "-",
          deskripsi: p.deskripsi || "-",
          jumlah: "Rp " + Number(p.jumlah || 0).toLocaleString("id-ID"),
          bukti: p.bukti_path ? (
            <a
              href={`${BACKEND_URL}${p.bukti_path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Lihat Bukti
            </a>
          ) : (
            <span className="text-gray-400 italic">Tidak ada</span>
          ),
          aksi: (
            <div className="flex items-center justify-left gap-2">
              <button
                onClick={() =>
                  navigate(`/pengeluaran/edit/${p.id_pengeluaran}`)
                }
                className="p-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white rounded-md transition duration-200"
                title="Edit"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => handleDeleteClick(p.id_pengeluaran)}
                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition duration-200"
                title="Hapus"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ),
        }));

        return (
          <>
            <ConfirmModal
              open={confirmOpen}
              message="Apakah Anda yakin ingin menghapus data pengeluaran ini?"
              onClose={() => setConfirmOpen(false)}
              onConfirm={handleConfirmDelete}
              loading={deleting}
            />

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-10 transition-all duration-300">
              {/* === REKAP CABANG === */}
              <div className="border-b border-gray-100 pb-4">
                <h1 className="text-xl font-semibold text-slate-800">
                  Rekap Pengeluaran per Cabang
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Lihat total transaksi dan pengeluaran dari setiap cabang.
                </p>
              </div>

              {loading ? (
                <p className="text-gray-500">Memuat data...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : filteredStores.length === 0 ? (
                <p className="text-gray-500">Data tidak ditemukan.</p>
              ) : (
                <TableData
                  columns={columnsCabang}
                  data={filteredStores.map((s, i) => ({
                    no: i + 1,
                    nama_store: s.nama_store,
                    total_transaksi: s.total_transaksi || 0,
                    total_pengeluaran: (
                      <div className="text-left text-green-600 font-semibold">
                        Rp{" "}
                        {Number(s.total_pengeluaran || 0).toLocaleString(
                          "id-ID"
                        )}
                      </div>
                    ),
                    aksi: (
                      <div className="flex items-center justify-left gap-2">
                        <button
                          onClick={() => navigate(`/pengeluaran/${s.id_store}`)}
                          className="flex items-center gap-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          Lihat
                        </button>
                      </div>
                    ),
                  }))}
                />
              )}

              {/* === PENGELUARAN ADMIN === */}
              {role === "admin" && (
                <div className="mt-12">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-800">
                        Pengeluaran Pusat (Admin)
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Daftar pengeluaran yang dilakukan langsung oleh admin
                        pusat.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate("/pengeluaran/add")}
                      className="flex items-center gap-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:shadow-md"
                    >
                      <Plus size={16} /> Tambah Pengeluaran
                    </button>
                  </div>

                  {/* ALERT */}
                  {alert && (
                    <div
                      className={`flex items-center px-4 py-3 rounded-lg shadow-sm border mb-5 transition-all duration-300 ${
                        alert.type === "success"
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-red-50 border-red-200 text-red-700"
                      }`}
                    >
                      <span className="text-sm font-medium">{alert.text}</span>
                    </div>
                  )}

                  {/* === FILTER BAR === */}
                  <div className="flex flex-wrap items-center gap-4 bg-white border border-gray-100 rounded-xl p-4 mb-4">
                    {/* Filter Periode */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">
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
                      <label className="text-sm font-medium text-gray-700">
                        {filterType === "Harian" ? "Tanggal:" : "Bulan:"}
                      </label>
                      {filterType === "Harian" ? (
                        <input
                          type="date"
                          value={tanggal}
                          onChange={(e) => setTanggal(e.target.value)}
                          className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      ) : (
                        <input
                          type="month"
                          value={tanggal.slice(0, 7)}
                          onChange={(e) => setTanggal(e.target.value + "-01")}
                          className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      )}
                    </div>

                    {/* Filter kategori */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">
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

                  {filteredAdminSearch.length === 0 ? (
                    <p className="text-gray-500 italic">
                      Tidak ada pengeluaran sesuai filter atau pencarian.
                    </p>
                  ) : (
                    <TableData
                      columns={columnsAdmin}
                      data={dataAdminFiltered}
                    />
                  )}
                </div>
              )}
            </div>
          </>
        );
      }}
    </MainLayout>
  );
}
