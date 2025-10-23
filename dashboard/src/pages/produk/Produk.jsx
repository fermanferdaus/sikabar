import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react"; // 🔍 Tambahkan ikon Search
import MainLayout from "../../layouts/MainLayout";

export default function Produk() {
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [search, setSearch] = useState("");
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
        setFilteredStores(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  // 🔍 Filter otomatis setiap kali isi search berubah
  useEffect(() => {
    const lower = search.toLowerCase();
    const filtered = stores.filter((s) =>
      s.nama_store.toLowerCase().includes(lower)
    );
    setFilteredStores(filtered);
  }, [search, stores]);

  return (
    <MainLayout current="produk">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">
          Data Stok Per Store
        </h1>

        {/* 🔍 Search Bar dengan ikon */}
        <div className="relative w-full sm:w-64">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Cari nama store..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Memuat data...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : filteredStores.length === 0 ? (
        <p className="text-gray-500">Data tidak ditemukan.</p>
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
              {filteredStores.map((s, i) => (
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
