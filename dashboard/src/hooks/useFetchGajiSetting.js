import { useEffect, useState } from "react";

export default function useFetchGajiSetting() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  /* ============================================================
     🔹 Ambil Semua Data Gaji
  ============================================================ */
  const fetchGaji = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/gaji/setting`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Gagal mengambil data gaji pokok");

      const result = await res.json();
      setData(result);
      setError(null);
    } catch (err) {
      console.error("❌ useFetchGajiSetting Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     💾 Tambah / Auto-Update Gaji (by capster atau kasir)
  ============================================================ */
  const saveGaji = async (payload) => {
    try {
      const res = await fetch(`${API_URL}/gaji/setting`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error("Respon server tidak valid (bukan JSON)");
      }

      if (!res.ok) throw new Error(result.message || "Gagal menyimpan gaji");

      await fetchGaji();
      return { success: true, message: result.message };
    } catch (err) {
      console.error("❌ saveGaji Error:", err);
      return { success: false, message: err.message };
    }
  };

  /* ============================================================
     ✏️ Update Gaji Manual (by ID)
  ============================================================ */
  const updateGaji = async (id_gaji_setting, payload) => {
    try {
      const res = await fetch(`${API_URL}/gaji/setting/${id_gaji_setting}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error("Respon dari server tidak valid JSON");
      }

      if (!res.ok) throw new Error(result.message || "Gagal memperbarui gaji");

      await fetchGaji();
      return { success: true, message: result.message };
    } catch (err) {
      console.error("❌ updateGaji Error:", err);
      return { success: false, message: err.message };
    }
  };

  /* ============================================================
     🗑️ Hapus Gaji (aman tanpa alert browser)
  ============================================================ */
  const deleteGaji = async (id_gaji_setting) => {
    try {
      const res = await fetch(`${API_URL}/gaji/gaji-setting/${id_gaji_setting}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      // Parse dengan aman
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server mengembalikan respons tidak valid");
      }

      if (!res.ok) throw new Error(data.message || "Gagal menghapus gaji");

      // Refresh data otomatis
      await fetchGaji();

      return {
        success: true,
        message: data.message || "Data gaji berhasil dihapus",
      };
    } catch (err) {
      return { success: false, message: err.message || "Gagal menghapus gaji" };
    }
  };

  /* ============================================================
     🚀 Fetch Data Saat Mount
  ============================================================ */
  useEffect(() => {
    fetchGaji();
  }, []);

  return {
    data,
    loading,
    error,
    refresh: fetchGaji,
    saveGaji,
    updateGaji,
    deleteGaji,
  };
}
