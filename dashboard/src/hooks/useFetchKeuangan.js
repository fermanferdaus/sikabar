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
        const res = await fetch(`${API_URL}/transaksi/keuangan`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Gagal memuat data keuangan");
        const result = await res.json();

        // pastikan format tanggal singkat agar rapi di chart
        const mapped = result.map((r) => ({
          tanggal: new Date(r.tanggal).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
          }),
          pendapatan_kotor: Number(r.pendapatan_kotor) || 0,
          pendapatan_bersih: Number(r.pendapatan_bersih) || 0,
        }));

        setData(mapped);
      } catch (err) {
        console.error("❌ useFetchKeuangan Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchKeuangan();
  }, []);

  return { data, loading, error };
}
