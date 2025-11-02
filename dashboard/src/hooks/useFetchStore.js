import { useEffect, useState } from "react";

export default function useFetchStore() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const fetchStore = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/store`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal mengambil data store");
      const result = await res.json();

      // ✅ fix di sini
      setData(result || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addStore = async (store) => {
    try {
      const res = await fetch(`${API_URL}/store`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nama_store: store.nama_store,
          alamat_store: store.alamat_store,
        }),
      });

      if (!res.ok) {
        const errMsg = await res.text();
        throw new Error(`Gagal menambahkan store: ${errMsg}`);
      }

      await fetchStore();
    } catch (err) {
      console.error("❌ Error addStore:", err);
      throw err;
    }
  };

  const updateStore = async (id_store, updatedStore) => {
    try {
      const res = await fetch(`${API_URL}/store/${id_store}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedStore),
      });
      if (!res.ok) throw new Error("Gagal memperbarui store");
      await fetchStore();
    } catch (err) {
      console.error("❌ Error updateStore:", err);
      throw err;
    }
  };

  const deleteStore = async (id_store) => {
    try {
      const res = await fetch(`${API_URL}/store/${id_store}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal menghapus store");
      await fetchStore();
    } catch (err) {
      console.error("❌ Error deleteStore:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchStore();
  }, []);

  return { data, loading, error, addStore, updateStore, deleteStore };
}
