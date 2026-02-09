import { useState } from "react";

export default function useFetchKasbon() {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ========================================================
     🔹 Simpan Kasbon Baru
  ======================================================== */
  const saveKasbon = async (data) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/kasbon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok)
        throw new Error(result.message || "Gagal menambahkan kasbon");

      return { success: true, data: result.data || null };
    } catch (err) {
      console.error("❌ saveKasbon error:", err);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  /* ========================================================
     🔹 Ambil daftar Capster & Kasir
  ======================================================== */
  const fetchCapstersAndKasirs = async () => {
    try {
      const [resCap, resKasir, resStore] = await Promise.all([
        fetch(`${API_URL}/capster`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/kasir`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/store`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const capRaw = await resCap.json();
      const kasirRaw = await resKasir.json();
      const storeRaw = await resStore.json();

      const capData = capRaw.data || capRaw || [];
      const kasirData = kasirRaw.data || kasirRaw || [];
      const stores = storeRaw.data || storeRaw || [];

      // ================================================
      // 🔹 Normalisasi Data Capster
      // ================================================
      const capsters = capData.map((c) => ({
        id_capster: c.id_capster || c.id || null,
        nama_capster: c.nama_capster || c.nama || c.nama_user || "",
        id_store: c.id_store,
        nama_store:
          stores.find((s) => s.id_store === c.id_store)?.nama_store || "-",
      }));

      // ================================================
      // 🔹 Normalisasi Data Kasir
      // ================================================
      const kasirs = kasirData.map((k) => ({
        id_kasir: k.id_kasir || k.id_user || k.id, // 🔥 fallback aman
        nama_kasir: k.nama_kasir || k.nama_user || k.nama || "",
        id_store: k.id_store,
        nama_store:
          stores.find((s) => s.id_store === k.id_store)?.nama_store || "-",
      }));

      return { capsters, kasirs };
    } catch (err) {
      console.error("❌ fetchCapstersAndKasirs error:", err);
      return { capsters: [], kasirs: [] };
    }
  };

  /* ========================================================
     🔹 GET Kasbon by ID
  ======================================================== */
  const getKasbonById = async (id) => {
    try {
      const res = await fetch(`${API_URL}/kasbon/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengambil kasbon");

      return { success: true, data: data.data };
    } catch (err) {
      console.error("❌ getKasbonById error:", err);
      return { success: false, message: err.message };
    }
  };

  /* ========================================================
     🔹 Update Kasbon
  ======================================================== */
  const updateKasbon = async (id, payload) => {
    try {
      const res = await fetch(`${API_URL}/kasbon/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memperbarui kasbon");

      return { success: true, data };
    } catch (err) {
      console.error("❌ updateKasbon error:", err);
      return { success: false, message: err.message };
    }
  };

  /* ========================================================
   🔹 GET TOTAL KASBON AKTIF
======================================================== */
  const fetchTotalKasbonAktif = async ({ id_capster, id_kasir }) => {
    try {
      const params = new URLSearchParams();
      if (id_capster) params.append("id_capster", id_capster);
      if (id_kasir) params.append("id_kasir", id_kasir);

      const res = await fetch(
        `${API_URL}/kasbon/total-aktif?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      return data.total || 0;
    } catch (err) {
      console.error("❌ fetchTotalKasbonAktif error:", err);
      return 0;
    }
  };

  return {
    saveKasbon,
    updateKasbon,
    getKasbonById,
    fetchCapstersAndKasirs,
    fetchTotalKasbonAktif,
    loading,
    error,
  };
}
