import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { useFetchTransaksiStore } from "../../hooks/useFetchTransaksi";
import { formatTanggalJam } from "../../utils/dateFormatter";
import { Search } from "lucide-react";

export default function TransaksiDetail() {
  const { id_store } = useParams();
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState("Bulanan");
  const [filterTipeTransaksi, setFilterTipeTransaksi] = useState("Semua");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [search, setSearch] = useState("");

  const { data, loading, error } = useFetchTransaksiStore(
    id_store,
    filterType,
    tanggal
  );

  const filteredData = data
    .filter((d) =>
      filterTipeTransaksi === "Semua"
        ? true
        : d.tipe_transaksi === filterTipeTransaksi
    )
    .filter(
      (d) =>
        d.kasir?.toLowerCase().includes(search.toLowerCase()) ||
        d.metode_bayar?.toLowerCase().includes(search.toLowerCase()) ||
        d.produk?.toLowerCase().includes(search.toLowerCase()) ||
        d.layanan?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <MainLayout current="transaksi">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">
          Detail Transaksi Toko
        </h1>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative w-full sm:w-64">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Cari kasir, produk, atau metode bayar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => navigate("/transaksi/admin")}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2.5 rounded-lg font-medium transition-all"
          >
            ← Kembali
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center bg-white p-4 border rounded-xl shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-gray-600 font-medium">Tipe:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border rounded-md px-2 py-1 text-sm"
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
            className="border rounded-md px-2 py-1 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-gray-600 font-medium">Tipe Transaksi:</label>
          <select
            value={filterTipeTransaksi}
            onChange={(e) => setFilterTipeTransaksi(e.target.value)}
            className="border rounded-md px-2 py-1 text-sm"
          >
            <option value="Semua">Semua</option>
            <option value="service">Layanan</option>
            <option value="produk">Produk</option>
            <option value="campuran">Campuran</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500 mt-4">Memuat data...</p>
      ) : error ? (
        <p className="text-red-500 mt-4">{error}</p>
      ) : (
        <RiwayatTable filteredData={filteredData} />
      )}
    </MainLayout>
  );
}

function RiwayatTable({ filteredData }) {
  return (
    <div className="mt-6">
      <table className="min-w-full border-collapse border bg-white rounded-xl shadow-sm">
        <thead className="bg-gray-100 text-gray-700 text-sm">
          <tr>
            <th className="p-3 border text-left">Tanggal</th>
            <th className="p-3 border text-left">Kasir</th>
            <th className="p-3 border text-left">Tipe Transaksi</th>
            <th className="p-3 border text-left">Detail</th>
            <th className="p-3 border text-right">Total</th>
            <th className="p-3 border text-left">Metode Bayar</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center p-4 text-gray-500 italic">
                Tidak ada transaksi
              </td>
            </tr>
          ) : (
            filteredData.map((d, i) => (
              <tr key={i} className="hover:bg-gray-50 transition">
                <td className="p-3 border text-sm text-gray-700">
                  {formatTanggalJam(d.created_at)}
                </td>
                <td className="p-3 border">{d.kasir}</td>
                <td className="p-3 border capitalize">{d.tipe_transaksi}</td>
                <td className="p-3 border text-sm text-gray-700">
                  {d.tipe_transaksi === "campuran" && (
                    <>
                      <strong>Layanan:</strong> {d.layanan || "-"} <br />
                      <strong>Produk:</strong> {d.produk || "-"}
                    </>
                  )}
                  {d.tipe_transaksi === "service" && (
                    <span>{d.layanan || "-"}</span>
                  )}
                  {d.tipe_transaksi === "produk" && (
                    <span>{d.produk || "-"}</span>
                  )}
                </td>
                <td className="p-3 border text-right text-slate-700">
                  Rp {Number(d.subtotal).toLocaleString("id-ID")}
                </td>
                <td className="p-3 border capitalize">{d.metode_bayar}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
