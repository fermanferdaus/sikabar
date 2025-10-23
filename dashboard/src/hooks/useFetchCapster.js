import { useEffect, useState } from "react";

export default function useFetchCapster(id_store = null) {
  const [capsters, setCapsters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // 🔹 Ambil data capster (admin = semua, kasir = per store)
  const fetchCapsters = async () => {
    if (!token) return;
    try {
      setLoading(true);

      let endpoint;

      // Tentukan endpoint berdasarkan role login
      if (role === "kasir") {
        if (!id_store) {
          console.warn(
            "⚠️ ID store belum ada di localStorage, fetch dilewati."
          );
          setCapsters([]);
          setLoading(false);
          return;
        }
        endpoint = `${API_URL}/capster/kasir/store/${id_store}`;
      } else {
        endpoint = id_store
          ? `${API_URL}/capster?store=${id_store}`
          : `${API_URL}/capster`;
      }

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const message =
          res.status === 403
            ? "Akses ditolak. Periksa role pengguna atau token."
            : "Gagal mengambil data capster";
        throw new Error(message);
      }

      const data = await res.json();
      setCapsters(data);
      setError(null);
    } catch (err) {
      console.error("❌ useFetchCapster Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCapsters();
  }, [id_store, role]);

  return { capsters, loading, error, refresh: fetchCapsters };
}
