import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function useCapsterActions() {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 🟡 Tambah Capster
  const addCapster = async (formData) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/capster`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Gagal menambah capster");
      await res.json();

      localStorage.setItem(
        "capsterMessage",
        JSON.stringify({
          type: "success",
          text: "Capster berhasil ditambahkan",
        }),
      );

      navigate("/pegawai");
    } catch (err) {
      localStorage.setItem(
        "capsterMessage",
        JSON.stringify({
          type: "error",
          text: "Gagal menambah capster: " + err.message,
        }),
      );
      navigate("/pegawai");
    } finally {
      setLoading(false);
    }
  };

  // 🟠 Update Capster
  const updateCapster = async (id, formData) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/capster/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Gagal memperbarui capster");
      await res.json();

      localStorage.setItem(
        "capsterMessage",
        JSON.stringify({
          type: "success",
          text: "Capster berhasil diperbarui",
        }),
      );

      navigate("/pegawai");
    } catch (err) {
      localStorage.setItem(
        "capsterMessage",
        JSON.stringify({
          type: "error",
          text: "Gagal memperbarui capster: " + err.message,
        }),
      );
      navigate("/pegawai");
    } finally {
      setLoading(false);
    }
  };

  // 🔴 Hapus Capster
  const deleteCapster = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/capster/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal menghapus capster");
      await res.json();

      localStorage.setItem(
        "capsterMessage",
        JSON.stringify({
          type: "success",
          text: "Capster berhasil dihapus",
        }),
      );

      window.location.reload();
    } catch (err) {
      localStorage.setItem(
        "capsterMessage",
        JSON.stringify({
          type: "error",
          text: "Gagal menghapus capster: " + err.message,
        }),
      );

      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  return { addCapster, updateCapster, deleteCapster, loading };
}
