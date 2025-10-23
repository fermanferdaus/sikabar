import { useEffect, useState } from "react";

export default function useFetchCapsterByStore(id_store) {
  const [capsters, setCapsters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    console.log("🧩 useFetchCapsterByStore triggered, id_store =", id_store);
    if (!id_store) {
      console.warn("⚠️ Tidak ada id_store, fetch dibatalkan");
      return;
    }

    const fetchCapsters = async () => {
      try {
        console.log("📡 Fetching:", `${API_URL}/capster/kasir/store/${id_store}`);
        const res = await fetch(`${API_URL}/capster/kasir/store/${id_store}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("🔸 Status:", res.status);
        const data = await res.json();
        console.log("✅ CAPSTER DATA:", data);
        setCapsters(data);
      } catch (err) {
        console.error("❌ CAPSTER FETCH ERROR:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCapsters();
  }, [API_URL, token, id_store]);

  return { capsters, loading, error };
}
