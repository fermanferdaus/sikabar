import { useEffect, useState } from "react";

/* ===========================================================
   🟢 Hook: useFetchTransaksiAdmin
   =========================================================== */
export default function useFetchTransaksiAdmin(
  filterType = "Bulanan",
  tanggal = new Date().toISOString().split("T")[0]
) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const fetchLaporan = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({ type: filterType, tanggal });
      const res = await fetch(`${API_URL}/transaksi/laporan?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Gagal mengambil laporan transaksi");

      const result = await res.json();

      // ✅ Mapping data agar tidak ada nilai null & auto hitung pendapatan bersih
      const mapped = Array.isArray(result)
        ? result.map((r) => {
            const pendapatan_kotor = Number(r.pendapatan_kotor) || 0;
            const laba_produk = Number(r.laba_produk) || 0;
            const pendapatan_service = Number(r.pendapatan_service) || 0;
            const total_komisi_capster = Number(r.total_komisi_capster) || 0;
            const pendapatan_bersih =
              r.pendapatan_bersih ??
              laba_produk + (pendapatan_service - total_komisi_capster);

            return {
              id_store: r.id_store,
              nama_store: r.nama_store,
              total_transaksi: Number(r.total_transaksi) || 0,
              pendapatan_kotor,
              laba_produk,
              pendapatan_service,
              total_komisi_capster,
              pendapatan_bersih,
            };
          })
        : [];

      setData(mapped);
      setError(null);
    } catch (err) {
      console.error("❌ useFetchTransaksiAdmin Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan();
  }, [filterType, tanggal]);

  return { data, loading, error, refresh: fetchLaporan };
}

/* ===========================================================
   🔵 Hook: useFetchTransaksiStore
   =========================================================== */
export function useFetchTransaksiStore(
  id_store,
  type = "Bulanan",
  tanggal = new Date().toISOString().split("T")[0]
) {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({
    total_transaksi: 0,
    pendapatan_kotor: 0,
    pendapatan_bersih: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!id_store) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // 🔹 Pilih endpoint sesuai role login
        const endpoint =
          role === "admin"
            ? `${API_URL}/transaksi/store/${id_store}?type=${type}&tanggal=${tanggal}`
            : `${API_URL}/transaksi?type=${type}&tanggal=${tanggal}`;

        const res = await fetch(endpoint, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errMsg = await res.text();
          throw new Error(`Gagal mengambil data transaksi toko: ${errMsg}`);
        }

        const result = await res.json();

        // ✅ Antisipasi format backend (baru & lama)
        if (Array.isArray(result)) {
          setData(result);
        } else if (result?.data && Array.isArray(result.data)) {
          setData(result.data);
          setSummary(result.summary || {});
        } else if (result?.status === "success" && Array.isArray(result.data)) {
          setData(result.data);
          setSummary(result.summary || {});
        } else {
          setData([]);
          setSummary({
            total_transaksi: 0,
            pendapatan_kotor: 0,
            pendapatan_bersih: 0,
          });
        }

        setError(null);
      } catch (err) {
        console.error("❌ useFetchTransaksiStore Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id_store, type, role, tanggal]);

  return { data, summary, loading, error };
}
