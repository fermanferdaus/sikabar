import { useEffect, useState } from "react";

export default function useFetchPricelist() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const fetchData = async () => {
    setLoading(true);
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

  const addPricelist = async (body) => {
    const res = await fetch(`${API_URL}/pricelist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Gagal menambahkan layanan");
    await fetchData();
  };

  const updatePricelist = async (id, body) => {
    const res = await fetch(`${API_URL}/pricelist/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Gagal memperbarui layanan");
    await fetchData();
  };

  const deletePricelist = async (id) => {
    const res = await fetch(`${API_URL}/pricelist/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Gagal menghapus layanan");
    await fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    addPricelist,
    updatePricelist,
    deletePricelist,
  };
}
