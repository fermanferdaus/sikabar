import { useState } from "react";

export default function useFetchPotongan() {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);

  /* ========================================================
     🔹 Ambil daftar kasbon aktif (opsional untuk potongan kasbon)
  ======================================================== */
  const fetchKasbonList = async () => {
    try {
      const res = await fetch(`${API_URL}/kasbon`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();

      if (result.success) {
        // Ambil hanya kasbon yang masih aktif
        return result.data.filter((k) => k.status === "aktif");
      }
      return [];
    } catch (error) {
      console.error("❌ Gagal memuat kasbon:", error);
      return [];
    }
  };

  /* ========================================================
     💾 Tambah Potongan (Umum / Kasbon)
  ======================================================== */
  const savePotongan = async (payload) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/potongan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      setLoading(false);
      return result;
    } catch (error) {
      console.error("❌ Gagal menambahkan potongan:", error);
      setLoading(false);
      return { success: false, message: "Gagal menambahkan potongan." };
    }
  };

  /* ========================================================
     ✏️ Ambil potongan berdasarkan ID
  ======================================================== */
  const getPotonganById = async (id) => {
    try {
      const res = await fetch(`${API_URL}/potongan/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error("❌ Gagal mengambil potongan:", error);
      return null;
    }
  };

  /* ========================================================
     🛠️ Update potongan
  ======================================================== */
  const updatePotongan = async (id, payload) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/potongan/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      setLoading(false);
      return result;
    } catch (error) {
      console.error("❌ Gagal memperbarui potongan:", error);
      setLoading(false);
      return { success: false, message: "Gagal memperbarui potongan." };
    }
  };

  /* ========================================================
     ❌ Hapus potongan
  ======================================================== */
  const deletePotongan = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/potongan/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();
      setLoading(false);
      return result;
    } catch (error) {
      console.error("❌ Gagal menghapus potongan:", error);
      setLoading(false);
      return { success: false, message: "Gagal menghapus potongan." };
    }
  };

  return {
    loading,
    fetchKasbonList,
    savePotongan,
    getPotonganById,
    updatePotongan,
    deletePotongan,
  };
}
