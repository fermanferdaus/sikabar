import MainLayout from "../../layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { RefreshCcw } from "lucide-react";
import useFetchTransaksiAdmin from "../../hooks/useFetchTransaksi";
import TableData from "../../components/TableData";

export default function TransaksiAdmin() {
  const [filterType, setFilterType] = useState("Bulanan");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0]
  );

  const navigate = useNavigate();
  const { data, loading, error, refresh } = useFetchTransaksiAdmin(
    filterType,
    tanggal
  );

  const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(angka) || 0);

  // 🔹 Data yang difilter berdasarkan pencarian
  const filteredData = useMemo(() => data, [data]);

  const totalKotor = filteredData.reduce(
    (sum, d) => sum + Number(d.pendapatan_kotor || 0),
    0
  );
  const totalBersih = filteredData.reduce(
    (sum, d) => sum + Number(d.pendapatan_bersih || 0),
    0
  );
  const totalTransaksi = filteredData.reduce(
    (sum, d) => sum + Number(d.total_transaksi || 0),
    0
  );

  const columns = [
    { key: "no", label: "#" },
    { key: "nama_store", label: "Cabang" },
    { key: "total_transaksi", label: "Total Transaksi" },
    { key: "pendapatan_kotor", label: "Pendapatan Kotor" },
    { key: "pendapatan_bersih", label: "Pendapatan Bersih" },
    { key: "aksi", label: "Aksi" },
  ];

  const tableData = filteredData.map((d, i) => ({
    no: i + 1,
    nama_store: d.nama_store,
    total_transaksi: (
      <div className="text-left font-medium text-slate-700">
        {d.total_transaksi.toLocaleString("id-ID")}
      </div>
    ),
    pendapatan_kotor: (
      <div className="text-left text-blue-600 font-medium">
        {formatRupiah(d.pendapatan_kotor)}
      </div>
    ),
    pendapatan_bersih: (
      <div className="text-left text-green-600 font-semibold">
        {formatRupiah(d.pendapatan_bersih)}
      </div>
    ),
    aksi: (
      <div className="flex items-center justify-left gap-2">
        <button
          onClick={() => navigate(`/transaksi/admin/store/${d.id_store}`)}
          className="flex items-center gap-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
        >
          Lihat
        </button>
      </div>
    ),
  }));

  return (
    <MainLayout current="transaksi">
      {(searchTerm) => {
        const searchedData = filteredData.filter((d) =>
          d.nama_store.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8 transition-all duration-300">
            {/* === Header === */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  Riwayat Transaksi
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Ringkasan transaksi dan pendapatan setiap cabang.
                </p>
              </div>
            </div>

            {/* === Filter Bar === */}
            <div className="flex flex-wrap items-center gap-4 bg-white border border-gray-100 rounded-xl p-4">
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

              <div className="flex items-center gap-2">
                <label className="text-gray-600 font-medium text-sm">
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
            </div>

            {/* === Summary Cards === */}
            {searchedData.length > 0 && (
              <div className="grid sm:grid-cols-3 gap-6 mt-2">
                <div className="p-5 bg-white shadow-sm rounded-xl text-center transition hover:-translate-y-1 hover:shadow-md duration-300">
                  <p className="text-gray-500">Jumlah Transaksi</p>
                  <h2 className="text-3xl font-bold text-blue-600 mt-1">
                    {totalTransaksi.toLocaleString("id-ID")}
                  </h2>
                </div>
                <div className="p-5 bg-white shadow-sm rounded-xl text-center transition hover:-translate-y-1 hover:shadow-md duration-300">
                  <p className="text-gray-500">Pendapatan Kotor</p>
                  <h2 className="text-3xl font-bold text-sky-600 mt-1">
                    {formatRupiah(totalKotor)}
                  </h2>
                </div>
                <div className="p-5 bg-white shadow-sm rounded-xl text-center transition hover:-translate-y-1 hover:shadow-md duration-300">
                  <p className="text-gray-500">Pendapatan Bersih</p>
                  <h2 className="text-3xl font-bold text-emerald-600 mt-1">
                    {formatRupiah(totalBersih)}
                  </h2>
                </div>
              </div>
            )}

            {/* === Tabel === */}
            {loading ? (
              <p className="text-gray-500 italic">Memuat data transaksi...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : searchedData.length === 0 ? (
              <p className="text-gray-500 italic">Tidak ada data transaksi.</p>
            ) : (
              <TableData columns={columns} data={tableData} />
            )}
          </div>
        );
      }}
    </MainLayout>
  );
}
