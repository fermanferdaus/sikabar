import { useEffect, useState } from "react";

export default function useFetchCapsterByStore(id_store) {
  const [capsters, setCapsters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!id_store) {
      return;
    }

    const fetchCapsters = async () => {
      try {
        const res = await fetch(`${API_URL}/capster/kasir/store/${id_store}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setCapsters(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCapsters();
  }, [API_URL, token, id_store]);

  return { capsters, loading, error };
}
