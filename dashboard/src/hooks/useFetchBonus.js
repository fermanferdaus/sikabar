import { useEffect, useState } from "react";

export default function useFetchBonus() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  /* =======================================================
     🔹 GET Semua Bonus
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
     🔹 GET Bonus by ID
  ======================================================= */
  const getBonusById = async (id_bonus) => {
    try {
      const res = await fetch(`${API_URL}/gaji/bonus/${id_bonus}`, {
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
     💾 Tambah Bonus (POST)
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
     ✏️ UPDATE Bonus (PUT)
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
      console.error("❌ updateBonus Error:", err);
      return { success: false, message: err.message };
    }
  };

  /* =======================================================
     🔄 UPDATE Status Bonus
  ======================================================= */
  const updateBonusStatus = async (id_bonus, status) => {
    try {
      const res = await fetch(`${API_URL}/gaji/bonus/status/${id_bonus}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gagal update status");

      await fetchBonus();
      return { success: true, message: result.message };
    } catch (err) {
      console.error("❌ updateBonusStatus Error:", err);
      return { success: false, message: err.message };
    }
  };

  /* =======================================================
     🗑 DELETE Bonus
  ======================================================= */
  const deleteBonus = async (id_bonus) => {
    try {
      const res = await fetch(`${API_URL}/gaji/bonus/${id_bonus}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      // baca text dahulu supaya tidak error ketika JSON tidak valid
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server mengembalikan respons tidak valid");
      }

      if (!res.ok) throw new Error(data.message || "Gagal menghapus bonus");

      await fetchBonus();
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  /* =======================================================
     🚀 Auto-load data di mount
  ======================================================= */
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
    updateBonusStatus,
    getBonusById,
    deleteBonus,
  };
}
