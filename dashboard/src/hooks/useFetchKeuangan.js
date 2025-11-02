import { useEffect, useState } from "react";

export default function useFetchKeuangan({
  id_store = null,
  type = "Bulanan",
  includeSummary = false, // optional: untuk ambil summary (kasir/admin)
} = {}) {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchKeuangan = async () => {
      try {
        let url;
        if (id_store) {
          // 🔹 Mode kasir atau per-store
          url = `${API_URL}/keuangan/store/${id_store}`;
        } else {
          // 🔹 Mode admin (global)
          url = `${API_URL}/keuangan`;
        }

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Gagal memuat data keuangan");

        const json = await res.json();

        // 🔹 Untuk endpoint /keuangan (grafik harian)
        if (Array.isArray(json.data)) {
          const mapped = json.data.map((r) => {
            let tanggalLabel = r.tanggal;
            try {
              if (r.tanggal?.includes("T")) {
                const [y, m, d] = r.tanggal.split("T")[0].split("-");
                const bulanNama = new Date(`${y}-${m}-01`).toLocaleString("id-ID", {
                  month: "short",
                });
                tanggalLabel = `${d} ${bulanNama}`;
              }
            } catch {
              tanggalLabel = r.tanggal;
            }

            return {
              tanggal: tanggalLabel,
              pendapatan_kotor: Number(r.pendapatan_kotor) || 0,
              pengeluaran: Number(r.pengeluaran) || 0,
              pendapatan_bersih: Number(r.pendapatan_bersih) || 0,
            };
          });

          setData(mapped);
        }

        // 🔹 Jika ingin include summary bulanan
        if (includeSummary && !id_store) {
          const resSummary = await fetch(`${API_URL}/keuangan/summary`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const sumJson = await resSummary.json();
          if (sumJson.status === "success") setSummary(sumJson.data.total);
        }

        // 🔹 Untuk kasir (id_store)
        if (id_store && json.status === "success" && json.data) {
          setSummary(json.data);
        }

      } catch (err) {
        console.error("❌ useFetchKeuangan Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchKeuangan();
  }, [id_store, type, includeSummary]);

  return { data, summary, loading, error };
}