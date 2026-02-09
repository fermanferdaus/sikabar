import { useEffect, useState, useCallback } from "react";

export default function useFetchPengeluaranDetail(id_store) {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [pengeluaran, setPengeluaran] = useState([]);
  const [storeName, setStoreName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 🔹 1. Ambil STORE (induk)
      const storeRes = await fetch(`${API_URL}/store/${id_store}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (storeRes.ok) {
        const store = await storeRes.json();
        setStoreName(store.nama_store);
      } else {
        setStoreName(`Store #${id_store}`);
      }

      // 🔹 2. Ambil PENGELUARAN (anak)
      const pengRes = await fetch(`${API_URL}/pengeluaran/store/${id_store}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!pengRes.ok) throw new Error("Gagal memuat data pengeluaran");

      const pengData = await pengRes.json();

      if (pengData.status !== "success") {
        throw new Error(pengData.message || "Gagal memuat data");
      }

      setPengeluaran(pengData.data || []);
      setError(null);
    } catch (err) {
      console.error("❌ Error fetch pengeluaran:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [API_URL, id_store, token]);

  useEffect(() => {
    if (id_store) fetchData();
  }, [id_store, fetchData]);

  return {
    pengeluaran,
    storeName,
    loading,
    error,
    refetch: fetchData,
  };
}
