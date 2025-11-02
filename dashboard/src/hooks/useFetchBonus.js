import { useEffect, useState } from "react";

export default function useFetchBonus() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  /* =======================================================
     🔹 Ambil Semua Bonus
  ======================================================= */
  const fetchBonus = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/gaji/bonus`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal mengambil data bonus");
      const result = await res.json();
      setData(result);
      setError(null);
    } catch (err) {
      console.error("❌ useFetchBonus Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     🔹 Ambil 1 Bonus berdasarkan ID
  ======================================================= */
  const getBonusById = async (id_bonus) => {
    try {
      const res = await fetch(`${API_URL}/bonus/${id_bonus}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal mengambil data bonus");
      const result = await res.json();
      return result;
    } catch (err) {
      console.error("❌ Gagal ambil detail bonus:", err);
      return null;
    }
  };

  /* =======================================================
     💾 Tambah Bonus Baru
  ======================================================= */
  const saveBonus = async (payload) => {
    try {
      const res = await fetch(`${API_URL}/gaji/bonus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gagal menyimpan bonus");
      await fetchBonus();
      return { success: true, message: result.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  /* =======================================================
     ✏️ Update Bonus
  ======================================================= */
  const updateBonus = async (id_bonus, payload) => {
    try {
      const res = await fetch(`${API_URL}/gaji/bonus/${id_bonus}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gagal memperbarui bonus");
      await fetchBonus();
      return { success: true, message: result.message };
    } catch (err) {
      console.error("❌ Gagal update bonus:", err);
      return { success: false, message: err.message };
    }
  };

  /* =======================================================
     🗑️ Hapus Bonus
  ======================================================= */
  const deleteBonus = async (id_bonus) => {
    try {
      const res = await fetch(`${API_URL}/gaji/bonus/${id_bonus}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      // Coba parse JSON dengan aman
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server mengembalikan respons tidak valid");
      }

      if (!res.ok) throw new Error(data.message || "Gagal menghapus bonus");

      // Refresh data otomatis
      await fetchBonus();

      return {
        success: true,
        message: data.message || "Bonus berhasil dihapus",
      };
    } catch (err) {
      return {
        success: false,
        message: err.message || "Gagal menghapus bonus",
      };
    }
  };

  useEffect(() => {
    fetchBonus();
  }, []);

  return {
    data,
    loading,
    error,
    refresh: fetchBonus,
    saveBonus,
    updateBonus,
    getBonusById,
    deleteBonus,
  };
}
