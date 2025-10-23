import MainLayout from "../../layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Search } from "lucide-react";
import useFetchTransaksiAdmin from "../../hooks/useFetchTransaksi";

export default function TransaksiAdmin() {
  const [filterType, setFilterType] = useState("Bulanan");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { data, loading, error, refresh } = useFetchTransaksiAdmin(
    filterType,
    tanggal
  );

  const filteredData = data.filter((d) =>
    d.nama_store.toLowerCase().includes(search.toLowerCase())
  );

  const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(angka) || 0);

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

  return (
    <MainLayout current="transaksi">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">
          Laporan Transaksi
        </h1>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative w-full sm:w-64">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Cari nama toko..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            onClick={refresh}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-5 bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-gray-600 font-medium">Tipe:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="Harian">Harian</option>
            <option value="Bulanan">Bulanan</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-gray-600 font-medium">Tanggal:</label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {filteredData.length > 0 && (
        <div className="bg-white border rounded-xl p-5 shadow-sm mb-5">
          <h2 className="text-lg font-semibold text-slate-700 mb-3">
            Ringkasan Total
          </h2>
          <div className="grid sm:grid-cols-3 gap-4 text-center">
            <div className="p-3 border rounded-lg bg-blue-50">
              <p className="text-sm text-gray-600">Total Transaksi</p>
              <p className="text-lg font-semibold text-blue-700">
                {totalTransaksi.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="p-3 border rounded-lg bg-sky-50">
              <p className="text-sm text-gray-600">Pendapatan Kotor</p>
              <p className="text-lg font-semibold text-sky-700">
                {formatRupiah(totalKotor)}
              </p>
            </div>
            <div className="p-3 border rounded-lg bg-green-50">
              <p className="text-sm text-gray-600">Pendapatan Bersih</p>
              <p className="text-lg font-semibold text-green-700">
                {formatRupiah(totalBersih)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full text-sm border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 border text-left">Toko</th>
              <th className="p-3 border text-right">Total Transaksi</th>
              <th className="p-3 border text-right">Pendapatan Kotor</th>
              <th className="p-3 border text-right">Pendapatan Bersih</th>
              <th className="p-3 border text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  Memuat data transaksi...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="p-4 text-center text-gray-500 italic"
                >
                  Tidak ada data transaksi
                </td>
              </tr>
            ) : (
              filteredData.map((d, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="p-3 border">{d.nama_store}</td>
                  <td className="p-3 border text-right">{d.total_transaksi}</td>
                  <td className="p-3 border text-right text-blue-600 font-medium">
                    {formatRupiah(d.pendapatan_kotor)}
                  </td>
                  <td className="p-3 border text-right text-green-600 font-semibold">
                    {formatRupiah(d.pendapatan_bersih)}
                  </td>
                  <td className="p-3 border text-center">
                    <button
                      onClick={() => navigate(`/transaksi/store/${d.id_store}`)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Lihat Detail
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}
