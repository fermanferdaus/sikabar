import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useNavigate } from "react-router-dom";

export default function TransaksiAdmin() {
  const [data, setData] = useState([]);
  const [filterType, setFilterType] = useState("Bulanan");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0]
  );

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${API_URL}/transaksi/laporan?type=${filterType}&tanggal=${tanggal}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Gagal memuat data transaksi:", err);
      }
    };
    fetchData();
  }, [filterType, tanggal]);

  return (
    <MainLayout current="transaksi">
      <h1 className="text-2xl font-semibold text-slate-800 mb-4">
        Laporan Transaksi
      </h1>

      {/* === Filter === */}
      <div className="flex flex-wrap gap-3 mb-4 bg-white p-4 rounded-xl border shadow-sm">
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

      {/* === Table === */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full text-sm border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 border text-left">Toko</th>
              <th className="p-3 border text-right">Total Transaksi</th>
              <th className="p-3 border text-right">Pendapatan</th>
              <th className="p-3 border text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="p-4 text-center text-gray-500 italic"
                >
                  Tidak ada data transaksi
                </td>
              </tr>
            ) : (
              data.map((d, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="p-3 border">{d.nama_store}</td>
                  <td className="p-3 border text-right">{d.total_transaksi}</td>
                  <td className="p-3 border text-right text-green-600 font-semibold">
                    Rp {Number(d.pendapatan_kotor).toLocaleString("id-ID")}
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
