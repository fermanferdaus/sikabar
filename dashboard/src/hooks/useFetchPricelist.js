import { useEffect, useState } from "react";

export default function useFetchPricelist() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPricelist = async () => {
      try {
        const res = await fetch(`${API_URL}/pricelist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Gagal mengambil data pricelist");
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPricelist();
  }, [API_URL, token]);

  return { data, loading, error };
}
