import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

export default function Produk() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetch(`${API_URL}/produk/stok`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Gagal memuat data");
        setStores(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  return (
    <MainLayout current="produk">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">
          Data Stok Per Store
        </h1>
      </div>

      {loading ? (
        <p className="text-gray-500">Memuat data...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : stores.length === 0 ? (
        <p className="text-gray-500">Belum ada data store.</p>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-xl shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 border">#</th>
                <th className="p-3 border text-left">Nama Store</th>
                <th className="p-3 border text-center">Total Produk</th>
                <th className="p-3 border text-center">Total Stok</th>
                <th className="p-3 border text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {stores.map((s, i) => (
                <tr key={s.id_store} className="hover:bg-gray-50">
                  <td className="p-3 border text-center">{i + 1}</td>
                  <td className="p-3 border">{s.nama_store}</td>
                  <td className="p-3 border text-center">{s.total_produk}</td>
                  <td className="p-3 border text-center">{s.total_stok}</td>
                  <td className="p-3 border text-center">
                    <button
                      onClick={() => navigate(`/produk/stok/${s.id_store}`)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Lihat Stok
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </MainLayout>
  );
}
