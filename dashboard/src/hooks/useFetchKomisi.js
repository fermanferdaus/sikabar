import { useEffect, useState } from "react";

export default function useFetchKomisi(
  idCapster = null,
  filterType = null,
  tanggal = null
) {
  const [komisi, setKomisi] = useState([]); // untuk admin
  const [komisiDetail, setKomisiDetail] = useState({
    pendapatan_kotor: 0,
    pendapatan_bersih: 0,
    riwayat: [],
  }); // untuk capster
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    const fetchKomisi = async () => {
      try {
        setLoading(true);
        let endpoint = "/komisi";

        if (role === "capster") endpoint = "/komisi/me";
        else if (role === "admin" && idCapster)
          endpoint = `/komisi/${idCapster}`;

        const params = new URLSearchParams();
        if (filterType) params.append("type", filterType);
        if (tanggal) params.append("tanggal", tanggal);

        const url = `${API_URL}${endpoint}${
          params.toString() ? `?${params}` : ""
        }`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Gagal mengambil data komisi");
        const data = await res.json();

        // 🔹 Pisahkan data berdasarkan role
        if (role === "capster") setKomisiDetail(data);
        else setKomisi(data);
      } catch (err) {
        console.error("❌ Fetch Komisi Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchKomisi();
  }, [API_URL, token, role, idCapster, filterType, tanggal]);

  return { komisi, komisiDetail, loading, error };
}
