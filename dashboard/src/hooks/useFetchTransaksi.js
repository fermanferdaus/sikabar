import { useEffect, useState } from "react";

export default function useFetchTransaksiAdmin(
  filterType = "Bulanan",
  tanggal = new Date().toISOString().split("T")[0]
) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const fetchLaporan = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({ type: filterType, tanggal });
      const res = await fetch(`${API_URL}/transaksi/laporan?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Gagal mengambil laporan transaksi");

      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("❌ useFetchTransaksiAdmin Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan();
  }, [filterType, tanggal]);

  return { data, loading, error, refresh: fetchLaporan };
}

export function useFetchTransaksiStore(
  id_store,
  filterType = "Bulanan",
  tanggal = new Date().toISOString().split("T")[0]
) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const fetchDetail = async () => {
    if (!id_store) return;
    try {
      setLoading(true);

      const params = new URLSearchParams({ type: filterType, tanggal });
      const res = await fetch(
        `${API_URL}/transaksi/store/${id_store}?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Gagal mengambil detail transaksi toko");

      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("❌ useFetchTransaksiStore Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id_store, filterType, tanggal]);

  return { data, loading, error, refresh: fetchDetail };
}
