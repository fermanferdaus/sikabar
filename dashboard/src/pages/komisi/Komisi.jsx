import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchKomisi from "../../hooks/useFetchKomisi";
import { Search } from "lucide-react";

export default function Komisi() {
  const [filterType, setFilterType] = useState("Bulanan");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [search, setSearch] = useState("");

  const { komisi, komisiDetail, loading, error } = useFetchKomisi(
    null,
    filterType,
    tanggal
  );

  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const data = role === "capster" ? komisiDetail : komisi;
  const filteredData =
    role === "capster"
      ? data
      : data.filter(
          (k) =>
            k.nama_capster.toLowerCase().includes(search.toLowerCase()) ||
            k.nama_store.toLowerCase().includes(search.toLowerCase())
        );

  return (
    <MainLayout current="komisi">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">
          {role === "capster" ? "Komisi Saya" : "Komisi Capster"}
        </h1>

        {role !== "capster" && (
          <div className="relative w-full sm:w-64">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Cari capster atau store..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        )}
      </div>

      {role === "capster" && (
        <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 border rounded-xl shadow-sm">
          <div className="flex items-center gap-2">
            <label className="text-gray-600 font-medium">Tipe:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border rounded-lg p-2 text-sm"
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
              className="border rounded-lg p-2 text-sm"
            />
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Memuat data...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : role === "capster" && data ? (
        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-6">
          <div className="grid sm:grid-cols-2 gap-4 text-center">
            <div className="p-4 border rounded-lg">
              <p className="text-gray-500">Pendapatan Kotor</p>
              <h2 className="text-2xl font-bold text-blue-600">
                Rp {Number(data.pendapatan_kotor || 0).toLocaleString("id-ID")}
              </h2>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-gray-500">Pendapatan Bersih (Komisi)</p>
              <h2 className="text-2xl font-bold text-green-600">
                Rp {Number(data.pendapatan_bersih || 0).toLocaleString("id-ID")}
              </h2>
            </div>
          </div>

          <table className="min-w-full border-collapse border bg-white rounded-lg shadow-sm">
            <thead className="bg-gray-100 text-gray-700 text-sm">
              <tr>
                <th className="p-3 border text-left">Tanggal</th>
                <th className="p-3 border text-left">Service</th>
                <th className="p-3 border text-right">Harga</th>
                <th className="p-3 border text-right">Komisi</th>
              </tr>
            </thead>
            <tbody>
              {data.riwayat.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500 p-4">
                    Belum ada transaksi.
                  </td>
                </tr>
              ) : (
                data.riwayat.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="p-3 border">
                      {new Date(r.tanggal).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-3 border">{r.service}</td>
                    <td className="p-3 border text-right">
                      Rp {r.harga.toLocaleString("id-ID")}
                    </td>
                    <td className="p-3 border text-right text-green-600 font-semibold">
                      Rp {r.komisi.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          {filteredData.length === 0 ? (
            <p className="text-gray-500">Belum ada data capster.</p>
          ) : (
            <table className="min-w-full border-collapse border bg-white rounded-lg shadow-sm">
              <thead className="bg-gray-100 text-gray-700 text-sm">
                <tr>
                  <th className="p-3 border text-left">Capster</th>
                  <th className="p-3 border text-left">Store</th>
                  <th className="p-3 border text-right">Total Komisi</th>
                  <th className="p-3 border text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((k, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="p-3 border">{k.nama_capster}</td>
                    <td className="p-3 border">{k.nama_store}</td>
                    <td className="p-3 border text-right text-green-600 font-semibold">
                      Rp {Number(k.total_komisi).toLocaleString("id-ID")}
                    </td>
                    <td className="p-3 border text-center">
                      <button
                        onClick={() => navigate(`/komisi/${k.id_capster}`)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </MainLayout>
  );
}
