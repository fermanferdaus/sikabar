import { useEffect, useState } from "react";

export default function useFetchKeuangan() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchKeuangan = async () => {
      try {
        const res = await fetch(`${API_URL}/transaksi/laporan`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Gagal mengambil data keuangan");
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchKeuangan();
  }, [API_URL, token]);

  return { data, loading, error };
}
