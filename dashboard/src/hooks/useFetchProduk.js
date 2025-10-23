import { useEffect, useState } from "react";

export default function useFetchProduk(id_store = null) {
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  // 🔹 Ambil data produk (admin = semua, kasir = per store)
  const fetchProduk = async () => {
    if (!token) return;
    try {
      setLoading(true);

      // Jika ada id_store → ambil produk hanya milik store tersebut
      const endpoint = id_store
        ? `${API_URL}/produk/stok/${id_store}`
        : `${API_URL}/produk`;

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Gagal mengambil data produk");

      const data = await res.json();
      setProduk(data);
      setError(null);
    } catch (err) {
      console.error("❌ useFetchProduk Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduk();
  }, [id_store]);

  return { produk, loading, error, refresh: fetchProduk };
}
