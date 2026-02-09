import { useEffect, useState } from "react";

/* === 🔹 Hook: Ambil riwayat transaksi kasir login === */
export function useFetchRiwayatKasir(filterType = "Bulanan", tanggal) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const fetchRiwayat = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}/transaksi?type=${filterType}&tanggal=${tanggal}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Gagal mengambil riwayat transaksi");

      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("❌ useFetchRiwayatKasir Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayat();
  }, [filterType, tanggal]);

  return { data, loading, error, refresh: fetchRiwayat };
}
