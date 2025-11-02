import { useState, useEffect } from "react";

export default function useFetchPengeluaranKasir() {
  const [pengeluaran, setPengeluaran] = useState([]);
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const id_store = localStorage.getItem("id_store");

  const loadPengeluaran = async () => {
    if (!token || !id_store) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/pengeluaran/store/${id_store}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.status !== "success")
        throw new Error(data.message || "Gagal memuat data");

      setPengeluaran(data.data);
      if (data.data.length > 0) setStoreName(data.data[0].nama_store || "");
      setError(null);
    } catch (err) {
      console.error("❌ useFetchPengeluaranKasir error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPengeluaran();
  }, [id_store]);

  return { pengeluaran, storeName, loading, error, refetch: loadPengeluaran };
}
