import { useEffect, useState } from "react";

export default function useFetchCapster() {
  const [capsters, setCapsters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCapsters = async () => {
      try {
        const res = await fetch(`${API_URL}/capster`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Gagal mengambil data capster");
        const data = await res.json();
        setCapsters(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCapsters();
  }, [API_URL, token]);

  return { capsters, loading, error };
}
