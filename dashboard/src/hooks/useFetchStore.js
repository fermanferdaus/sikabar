import { useEffect, useState } from "react";

export default function useFetchStore() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  // 🔹 Ambil semua data store
  const fetchStore = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/store`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal mengambil data store");
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Tambah store baru
  const addStore = async (store) => {
    try {
      const res = await fetch(`${API_URL}/store`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(store),
      });
      if (!res.ok) throw new Error("Gagal menambahkan store");
      await fetchStore();
      alert("Store berhasil ditambahkan!");
    } catch (err) {
      alert(err.message);
    }
  };

  // 🔹 Update store
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
      alert("Store berhasil diperbarui!");
    } catch (err) {
      alert(err.message);
    }
  };

  // 🔹 Hapus store
  const deleteStore = async (id_store) => {
    const confirmDelete = window.confirm("Yakin ingin menghapus store ini?");
    if (!confirmDelete) return;
    try {
      const res = await fetch(`${API_URL}/store/${id_store}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal menghapus store");
      await fetchStore();
      alert("Store berhasil dihapus!");
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchStore();
  }, []);

  return { data, loading, error, addStore, updateStore, deleteStore };
}
