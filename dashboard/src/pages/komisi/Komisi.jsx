import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchKomisi from "../../hooks/useFetchKomisi";

export default function Komisi() {
  const [filterType, setFilterType] = useState("Bulanan");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0]
  );
  const { komisi, komisiDetail, loading, error } = useFetchKomisi(
    null,
    filterType,
    tanggal
  );
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const data = role === "capster" ? komisiDetail : komisi;

  return (
    <MainLayout current="komisi">
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">
        {role === "capster" ? "Komisi Saya" : "Komisi Capster"}
      </h1>

      {/* === Filter hanya muncul jika capster === */}
      {role === "capster" && (
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="text-sm text-gray-600 mr-2">Tipe:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border rounded-lg p-2"
            >
              <option value="Harian">Harian</option>
              <option value="Bulanan">Bulanan</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mr-2">Tanggal:</label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="border rounded-lg p-2"
            />
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Memuat data...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : role === "capster" && data ? (
        // ===================== CAPSTER VIEW =====================
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
        // ===================== ADMIN VIEW =====================
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          {data.length === 0 ? (
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
                {data.map((k, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="p-3 border">{k.nama_capster}</td>
                    <td className="p-3 border">{k.nama_store}</td>
                    <td className="p-3 border text-right text-green-600 font-semibold">
                      Rp {Number(k.total_komisi).toLocaleString("id-ID")}
                    </td>
                    <td className="p-3 border text-center">
                      <button
                        onClick={() => navigate(`/komisi/${k.id_capster}`)}
                        className="text-blue-600 hover:underline"
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
