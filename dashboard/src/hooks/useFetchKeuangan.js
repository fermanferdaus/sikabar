import { useEffect, useState } from "react";

export default function useFetchKeuangan({
  id_store = null,
  includeSummary = true, // default: ambil summary juga
  includeGrafik = true, // default: ambil grafik juga
} = {}) {
  const [summary, setSummary] = useState(null);
  const [grafik, setGrafik] = useState([]); // 🎯 Pisahkan grafik dari summary
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchKeuangan = async () => {
      try {
        setLoading(true);

        // =========================================================
        // 🔹 1️⃣ Fetch Grafik Keuangan (harian)
        // =========================================================
        if (includeGrafik) {
          let grafikUrl = id_store
            ? `${API_URL}/keuangan/store/${id_store}/grafik`
            : `${API_URL}/keuangan`;

          const resGrafik = await fetch(grafikUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (!resGrafik.ok)
            throw new Error("Gagal memuat data grafik keuangan");

          const jsonGrafik = await resGrafik.json();
          if (
            jsonGrafik.status === "success" &&
            Array.isArray(jsonGrafik.data)
          ) {
            const mapped = jsonGrafik.data.map((r) => {
              let tanggalLabel = r.tanggal;
              try {
                if (r.tanggal) {
                  const [y, m, d] = r.tanggal.split("-");
                  const bulanIndo = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "Mei",
                    "Jun",
                    "Jul",
                    "Agu",
                    "Sep",
                    "Okt",
                    "Nov",
                    "Des",
                  ];
                  tanggalLabel = `${d} ${bulanIndo[Number(m) - 1]}`;
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
            setGrafik(mapped);
          }
        }

        // =========================================================
        // 🔹 2️⃣ Fetch Summary Keuangan (bulanan)
        // =========================================================
        if (includeSummary) {
          let summaryUrl;

          if (id_store) {
            summaryUrl = `${API_URL}/keuangan/store/${id_store}`;
          } else {
            summaryUrl = `${API_URL}/keuangan/summary`;
          }

          const resSummary = await fetch(summaryUrl, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!resSummary.ok)
            throw new Error("Gagal memuat ringkasan keuangan");

          const jsonSum = await resSummary.json();
          if (jsonSum.status === "success") {
            if (id_store) setSummary(jsonSum.data);
            else setSummary(jsonSum.data.total);
          }
        }
      } catch (err) {
        console.error("❌ useFetchKeuangan Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchKeuangan();
  }, [id_store, includeSummary, includeGrafik]);

  return { grafik, summary, loading, error };
}
