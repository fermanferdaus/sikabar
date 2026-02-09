import { useEffect, useState } from "react";

export default function useProfil() {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfil = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/profil`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal mengambil data profil.");
        return;
      }

      // === MAPPING FRONTEND ===
      setProfil({
        id: data.id_profil,
        nama_barbershop: data.nama_barbershop,
        nama_owner: data.nama_owner,
        telepon: data.telepon,
        instagram: data.instagram,
        tiktok: data.tiktok,
        logo_url: data.logo_url,
      });
    } catch (err) {
      setError("Gagal mengambil data profil.");
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // UPDATE PROFIL TANPA LOGO
  // ======================================================
  const updateProfil = async (formData) => {
    const res = await fetch(`${API_URL}/profil`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nama_barbershop: formData.nama_barbershop,
        nama_owner: formData.nama_owner,
        telepon: formData.telepon,
        instagram: formData.instagram,
        tiktok: formData.tiktok,
      }),
    });

    return res.json();
  };

  // ======================================================
  // UPDATE LOGO (FormData)
  // ======================================================
  const updateLogo = async (file) => {
    const fd = new FormData();
    fd.append("logo", file);

    const res = await fetch(`${API_URL}/profil/logo`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });

    return res.json();
  };

  useEffect(() => {
    fetchProfil();
  }, []);

  return {
    profil,
    loading,
    error,
    fetchProfil,
    updateProfil,
    updateLogo,
  };
}
