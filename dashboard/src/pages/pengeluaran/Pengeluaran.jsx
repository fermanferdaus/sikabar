import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import TableData from "../../components/TableData";

export default function Pengeluaran() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  // === Filter Cabang ===
  const [filterTypeCabang, setFilterTypeCabang] = useState("Bulanan");
  const [tanggalCabang, setTanggalCabang] = useState(
    new Date().toISOString().split("T")[0],
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
        setLoading(true);
        const res = await fetch(
          `${API_URL}/pengeluaran/total?tipe=${filterTypeCabang}&tanggal=${tanggalCabang}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
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
  }, [filterTypeCabang, tanggalCabang]); // 🔹 panggil ulang kalau filter berubah

  // === Kolom tabel ===
  const columnsCabang = [
    { key: "no", label: "#" },
    { key: "nama_store", label: "Cabang" },
    { key: "total_transaksi", label: "Jumlah Transaksi" },
    { key: "total_pengeluaran", label: "Total Pengeluaran" },
    { key: "aksi", label: "Aksi" },
  ];

  // === Filter rekap cabang berdasarkan periode ===
  const filteredStoresByDate = stores.filter((s) => {
    if (!s.tanggal) return true;
    const tgl = new Date(s.tanggal);
    const selected = new Date(tanggalCabang);
    if (filterTypeCabang === "Harian") {
      return formatLocalDate(tgl) === formatLocalDate(selected);
    } else {
      return (
        tgl.getMonth() === selected.getMonth() &&
        tgl.getFullYear() === selected.getFullYear()
      );
    }
  });

  return (
    <MainLayout current="pengeluaran">
      {(searchTerm) => {
        const filteredStores = filteredStoresByDate.filter((s) =>
          s.nama_store.toLowerCase().includes(searchTerm.toLowerCase()),
        );

        return (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-10 transition-all duration-300">
              {/* === REKAP CABANG === */}
              <div className="border-b border-gray-100 pb-4 mb-4">
                <h1 className="text-xl font-semibold text-slate-800">
                  Rekap Pengeluaran
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Lihat total transaksi dan pengeluaran dari setiap cabang.
                </p>
              </div>

              {/* === FILTER CABANG === */}
              <div className="flex flex-wrap items-center gap-4 bg-white border border-gray-100 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Tipe:
                  </label>
                  <select
                    value={filterTypeCabang}
                    onChange={(e) => setFilterTypeCabang(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Harian">Harian</option>
                    <option value="Bulanan">Bulanan</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    {filterTypeCabang === "Harian" ? "Tanggal:" : "Bulan:"}
                  </label>
                  {filterTypeCabang === "Harian" ? (
                    <input
                      type="date"
                      value={tanggalCabang}
                      onChange={(e) => setTanggalCabang(e.target.value)}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  ) : (
                    <input
                      type="month"
                      value={tanggalCabang.slice(0, 7)}
                      onChange={(e) => setTanggalCabang(e.target.value + "-01")}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  )}
                </div>
              </div>

              {/* === TABEL REKAP === */}
              {loading ? (
                <p className="text-gray-500">Memuat data...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : filteredStores.length === 0 ? (
                <p className="text-gray-500 italic">
                  Tidak ada data pengeluaran untuk periode ini.
                </p>
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
                          "id-ID",
                        )}
                      </div>
                    ),
                    aksi: (
                      <button
                        onClick={() => navigate(`/pengeluaran/${s.id_store}`)}
                        className="flex items-center gap-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        Lihat
                      </button>
                    ),
                  }))}
                />
              )}
            </div>
          </>
        );
      }}
    </MainLayout>
  );
}
