import { useState, useEffect } from "react";

export default function useCapsterKasir(id_store) {
  const [capsters, setCapsters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  /* =========================================================
     🔹 Ambil Semua Capster milik Store Kasir
     ---------------------------------------------------------
     GET /capster/kasir/store/:id_store
  ========================================================= */
  const fetchCapsters = async () => {
    if (!id_store) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/capster/kasir/store/${id_store}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Gagal mengambil data capster");
      const data = await res.json();
      setCapsters(data);
      setError(null);
    } catch (err) {
      console.error("❌ useCapsterKasir fetchCapsters:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
   🟢 Tambah Capster (FIX)
   ---------------------------------------------------------
   POST /capster/kasir
========================================================= */
  const addCapster = async (formData) => {
    try {
      const res = await fetch(`${API_URL}/capster/kasir`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal menambahkan capster");
      }

      await fetchCapsters();
      return true;
    } catch (err) {
      console.error("❌ useCapsterKasir addCapster:", err);
      throw err;
    }
  };

  /* =========================================================
     🟡 Update Capster
     ---------------------------------------------------------
     PUT /capster/kasir/:id
  ========================================================= */
  const updateCapster = async (id_capster, formData) => {
    try {
      const res = await fetch(`${API_URL}/capster/kasir/${id_capster}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Gagal memperbarui capster");
      await fetchCapsters();
      return true;
    } catch (err) {
      console.error("❌ useCapsterKasir updateCapster:", err);
      throw err;
    }
  };

  /* =========================================================
     🔴 Hapus Capster
     ---------------------------------------------------------
     DELETE /capster/kasir/:id
  ========================================================= */
  const deleteCapster = async (id_capster) => {
    try {
      const res = await fetch(`${API_URL}/capster/kasir/${id_capster}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Gagal menghapus capster");
      await fetchCapsters();
      return true;
    } catch (err) {
      console.error("❌ useCapsterKasir deleteCapster:", err);
      throw err;
    }
  };

  /* =========================================================
     🔄 Auto-fetch setiap kali id_store berubah
  ========================================================= */
  useEffect(() => {
    fetchCapsters();
  }, [id_store]);

  return {
    capsters,
    loading,
    error,
    fetchCapsters,
    addCapster,
    updateCapster,
    deleteCapster,
  };
}
