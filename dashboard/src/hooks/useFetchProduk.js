import { useEffect, useState } from "react";

export default function useFetchProduk() {
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProduk = async () => {
      try {
        const res = await fetch(`${API_URL}/produk`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Gagal mengambil data produk");
        const data = await res.json();
        setProduk(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduk();
  }, [API_URL, token]);

  return { produk, loading, error };
}
