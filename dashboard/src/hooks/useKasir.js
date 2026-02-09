import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function useKasir(id_store = null) {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const [kasir, setKasir] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);

  /* ============================================================
     📦 Fetch Data Kasir
     ============================================================ */
  const fetchKasir = async () => {
    if (!token) return;

    try {
      setLoading(true);

      // Kasir tidak boleh melihat daftar kasir
      if (role === "kasir") {
        setKasir([]);
        setLoading(false);
        return;
      }

      const endpoint = id_store
        ? `${API_URL}/kasir?store=${id_store}`
        : `${API_URL}/kasir`;

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Gagal mengambil data kasir");

      const data = await res.json();
      setKasir(data);
      setError(null);
    } catch (err) {
      console.error("❌ useKasir Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     ➕ Add Kasir
     ============================================================ */
  const addKasir = async (formData) => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/kasir`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Gagal menambah kasir");

      localStorage.setItem(
        "kasirMessage",
        JSON.stringify({
          type: "success",
          text: "Kasir berhasil ditambahkan",
        }),
      );

      navigate("/pegawai");
    } catch (err) {
      localStorage.setItem(
        "kasirMessage",
        JSON.stringify({
          type: "error",
          text: "Gagal menambah kasir: " + err.message,
        }),
      );
      navigate("/pegawai");
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     ✏️ Update Kasir
     ============================================================ */
  const updateKasir = async (id, formData) => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/kasir/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Gagal memperbarui kasir");

      localStorage.setItem(
        "kasirMessage",
        JSON.stringify({
          type: "success",
          text: "Kasir berhasil diperbarui",
        }),
      );

      navigate("/pegawai");
    } catch (err) {
      localStorage.setItem(
        "kasirMessage",
        JSON.stringify({
          type: "error",
          text: "Gagal memperbarui kasir: " + err.message,
        }),
      );

      navigate("/pegawai");
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     🗑️ Delete Kasir
     ============================================================ */
  const deleteKasir = async (id) => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/kasir/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Gagal menghapus kasir");

      await fetchKasir(); // refresh otomatis
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     🔥 Ambil alert dari localStorage (success add/update/delete)
     ============================================================ */
  useEffect(() => {
    const message = localStorage.getItem("kasirMessage");
    if (message) {
      setAlert(JSON.parse(message));
      localStorage.removeItem("kasirMessage");
    }
  }, []);

  /* ============================================================
     ⏳ Auto-hide semua alert dalam 4 detik
     ============================================================ */
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  /* ============================================================
     🔄 Auto Fetch Data Kasir
     ============================================================ */
  useEffect(() => {
    fetchKasir();
  }, [id_store, role]);

  return {
    kasir,
    loading,
    error,
    alert,
    setAlert,
    addKasir,
    updateKasir,
    deleteKasir,
    refresh: fetchKasir,
  };
}
