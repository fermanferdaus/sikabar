import { useEffect, useState } from "react";

export default function useNamaOwner() {
  const [namaOwner, setNamaOwner] = useState("-");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProfil = async () => {
      try {

        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/profil`);
        const json = await res.json();

        if (json.success) {
          setNamaOwner(json.nama_owner || "-");
        } else {
          setError(json.message || "Gagal mengambil nama owner");
        }
      } catch (err) {
        setError("Gagal mengambil data profil");
      } finally {
        setLoading(false);
      }
    };

    fetchProfil();
  }, [API_URL]);

  return { namaOwner, loading, error };
}
