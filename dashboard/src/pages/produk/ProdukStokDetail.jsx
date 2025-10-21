import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

export default function ProdukStokDetail() {
  const { id_store } = useParams();
  const navigate = useNavigate();
  const [produk, setProduk] = useState([]);
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/produk/stok/${id_store}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Gagal memuat data");
        setProduk(data);
        if (data.length > 0) setStoreName(data[0].nama_store || "");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id_store]);

  return (
    <MainLayout current="produk">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">
          Stok Produk – {storeName || `Store #${id_store}`}
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          ← Kembali
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Memuat data...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : produk.length === 0 ? (
        <p className="text-gray-500">Belum ada data produk untuk store ini.</p>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-xl shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 border">#</th>
                <th className="p-3 border text-left">Nama Produk</th>
                <th className="p-3 border text-center">Harga Jual</th>
                <th className="p-3 border text-center">Stok</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {produk.map((p, i) => (
                <tr key={p.id_produk} className="hover:bg-gray-50 transition">
                  <td className="p-3 border text-center">{i + 1}</td>
                  <td className="p-3 border">{p.nama_produk}</td>
                  <td className="p-3 border text-center">
                    Rp {p.harga_jual.toLocaleString("id-ID")}
                  </td>
                  <td className="p-3 border text-center">{p.stok}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </MainLayout>
  );
}
