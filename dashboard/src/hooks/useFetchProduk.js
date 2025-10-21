import { useEffect, useState } from "react";

export default function useFetchProduk(id_store = null) {
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProduk = async () => {
      try {
        setLoading(true);

        // 🔹 Jika ada id_store (kasir login), ambil produk sesuai store
        const endpoint = id_store
          ? `${API_URL}/produk/stok/${id_store}`
          : `${API_URL}/produk`;

        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Gagal mengambil data produk");
        const data = await res.json();
        setProduk(data);
      } catch (err) {
        console.error("❌ useFetchProduk Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduk();
  }, [API_URL, token, id_store]);

  return { produk, loading, error };
}
