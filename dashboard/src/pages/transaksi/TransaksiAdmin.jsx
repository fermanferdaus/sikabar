import MainLayout from "../../layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { RefreshCcw } from "lucide-react"; // ✅ Import ikon
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

  return (
    <MainLayout current="transaksi">
      {(searchTerm) => {
        const filteredData = data.filter((d) =>
          d.nama_store.toLowerCase().includes(searchTerm.toLowerCase())
        );

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
          { key: "nama_store", label: "Nama Toko" },
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
            <div className="text-left">
              <button
                onClick={() => navigate(`/transaksi/store/${d.id_store}`)}
                className="text-[#0e57b5] hover:underline font-medium"
              >
                Lihat Detail
              </button>
            </div>
          ),
        }));

        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6 transition-all duration-300">
            {/* === Header === */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-100 pb-4 gap-3">
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  Laporan Transaksi
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Ringkasan transaksi dan pendapatan setiap cabang.
                </p>
              </div>

              {/* Tombol Refresh */}
              <button
                onClick={refresh}
                disabled={loading}
                className={`flex items-center gap-2  bg-[#0e57b5] hover:bg-[#0b4894] text-white px-4 py-2 rounded-lg font-medium transition ${
                  loading ? "cursor-wait opacity-90" : ""
                }`}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "18px",
                    height: "18px",
                  }}
                >
                  <RefreshCcw
                    size={18}
                    style={{
                      transformOrigin: "center",
                      animation: loading
                        ? "spin360 1s linear infinite"
                        : "none",
                    }}
                  />
                </div>
                {loading ? "Merefresh..." : "Refresh"}
              </button>
            </div>

            {/* === Filter Bar === */}
            <div className="flex flex-wrap gap-4 items-center bg-white border border-gray-100 rounded-xl p-4">
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
                  Tanggal:
                </label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* === Summary Cards === */}
            {filteredData.length > 0 && (
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="p-5 bg-white rounded-xl shadow-sm text-center transition hover:-translate-y-1 hover:shadow-md duration-300">
                  <p className="text-sm text-gray-600">Total Transaksi</p>
                  <h2 className="text-2xl font-bold text-blue-700 mt-1">
                    {totalTransaksi.toLocaleString("id-ID")}
                  </h2>
                </div>
                <div className="p-5 bg-white rounded-xl shadow-sm text-center transition hover:-translate-y-1 hover:shadow-md duration-300">
                  <p className="text-sm text-gray-600">Pendapatan Kotor</p>
                  <h2 className="text-2xl font-bold text-sky-700 mt-1">
                    {formatRupiah(totalKotor)}
                  </h2>
                </div>
                <div className="p-5 bg-white rounded-xl shadow-sm text-center transition hover:-translate-y-1 hover:shadow-md duration-300">
                  <p className="text-sm text-gray-600">Pendapatan Bersih</p>
                  <h2 className="text-2xl font-bold text-emerald-700 mt-1">
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
            ) : filteredData.length === 0 ? (
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
