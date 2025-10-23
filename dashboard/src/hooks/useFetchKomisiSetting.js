import { useEffect, useState } from "react";

export default function useFetchKomisiSetting() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  // === Ambil semua data komisi setting ===
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/komisi-setting`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal mengambil data komisi setting");
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // === Tambah komisi setting ===
  const addKomisi = async (newData) => {
    try {
      const res = await fetch(`${API_URL}/komisi-setting`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newData),
      });
      if (!res.ok) throw new Error("Gagal menambahkan data komisi");
      await fetchData();
    } catch (err) {
      console.error("❌ Error addKomisi:", err);
      throw err;
    }
  };

  // === Update komisi setting ===
  const updateKomisi = async (id_setting, updatedData) => {
    try {
      const res = await fetch(`${API_URL}/komisi-setting/${id_setting}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error("Gagal memperbarui data komisi");
      await fetchData();
    } catch (err) {
      console.error("❌ Error updateKomisi:", err);
      throw err;
    }
  };

  // === Hapus komisi setting (tanpa window.confirm) ===
  const deleteKomisi = async (id_setting) => {
    try {
      const res = await fetch(`${API_URL}/komisi-setting/${id_setting}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal menghapus data komisi");
      await fetchData();
    } catch (err) {
      console.error("❌ Error deleteKomisi:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    addKomisi,
    updateKomisi,
    deleteKomisi,
  };
}
