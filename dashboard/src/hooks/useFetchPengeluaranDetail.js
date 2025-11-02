import { useEffect, useState, useCallback } from "react";

export default function useFetchPengeluaranDetail(id_store) {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [pengeluaran, setPengeluaran] = useState([]);
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fungsi reusable untuk ambil data
  const fetchPengeluaran = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/pengeluaran/store/${id_store}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.status !== "success")
        throw new Error(data.message || "Gagal memuat data");

      setPengeluaran(data.data);
      if (data.data.length > 0) {
        setStoreName(data.data[0].nama_store || "");
      } else {
        setStoreName("");
      }
      setError(null);
    } catch (err) {
      console.error("❌ Error fetch pengeluaran:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [API_URL, id_store, token]);

  // 🔁 Ambil data pertama kali
  useEffect(() => {
    if (id_store) fetchPengeluaran();
  }, [id_store, fetchPengeluaran]);

  // ✅ Return fungsi refetch biar bisa dipanggil ulang dari luar
  return { pengeluaran, storeName, loading, error, refetch: fetchPengeluaran };
}
