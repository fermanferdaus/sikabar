import { useState, useEffect } from "react";

export default function useFetchPengeluaran() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  // ✅ Ambil semua data pengeluaran
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/pengeluaran`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (json.status === "success") {
        setData(json.data || []);
      } else {
        console.error("❌ Gagal memuat data pengeluaran:", json.message);
      }
    } catch (err) {
      console.error("❌ Gagal memuat data pengeluaran", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Hapus pengeluaran berdasarkan ID
  // ✅ Hapus pengeluaran berdasarkan ID
  const deletePengeluaran = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/pengeluaran/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      return json;
    } catch (err) {
      console.error("❌ Error deletePengeluaran:", err);
      return { status: "error", message: "Gagal menghapus data pengeluaran" };
    }
  };

  // ✅ Tambah pengeluaran (opsional, bisa dipakai di AddPengeluaran)
  const addPengeluaran = async (payload) => {
    try {
      const res = await fetch(`${API_URL}/pengeluaran`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      return json;
    } catch (err) {
      console.error("❌ Error addPengeluaran:", err);
      return { status: "error", message: "Gagal menambah pengeluaran" };
    }
  };

  // ✅ Update pengeluaran (opsional)
  const updatePengeluaran = async (id, payload) => {
    try {
      const res = await fetch(`${API_URL}/pengeluaran/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      return json;
    } catch (err) {
      console.error("❌ Error updatePengeluaran:", err);
      return { status: "error", message: "Gagal memperbarui pengeluaran" };
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    fetchData,
    deletePengeluaran,
    addPengeluaran,
    updatePengeluaran,
  };
}
