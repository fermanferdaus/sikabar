import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import formatRupiah from "../utils/formatRupiah";

export default function ChartKeuangan({ data }) {
  if (!data || data.length === 0)
    return (
      <div className="text-gray-500 italic text-center py-6">
        Tidak ada grafik keuangan untuk ditampilkan
      </div>
    );
  
  // Format tanggal (contoh: 30 Okt)
  const formattedData = data.map((item) => {
    let tanggalLabel = item.tanggal;
    try {
      const d = new Date(item.tanggal);
      if (!isNaN(d)) {
        tanggalLabel = d.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
        });
      }
    } catch {
      tanggalLabel = item.tanggal;
    }

    return {
      tanggal: tanggalLabel,
      pendapatan_kotor: Number(item.pendapatan_kotor) || 0,
      pengeluaran: Number(item.pengeluaran) || 0,
      pendapatan_bersih: Number(item.pendapatan_bersih) || 0,
    };
  });

  return (
    <div className="relative bg-white rounded-2xl shadow-inner border border-gray-100 p-6">
      {/* Background dekoratif lembut */}
      <div className="absolute inset-0 bg-white animate-gradient-wave rounded-2xl pointer-events-none"></div>

      <h2 className="text-lg font-semibold text-slate-700 mb-5 relative z-10">
        Grafik Pendapatan & Pengeluaran Harian
      </h2>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={formattedData}
          margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
          barGap={8}
        >
          {/* Garis grid tipis & halus */}
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />

          {/* Sumbu X & Y minimalis */}
          <XAxis
            dataKey="tanggal"
            tick={{ fontSize: 12, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatRupiah}
            width={90}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#64748b" }}
          />

          {/* Tooltip custom */}
          <Tooltip
            formatter={(v, name) => [formatRupiah(v), name]}
            labelFormatter={(label) => `Tanggal: ${label}`}
            contentStyle={{
              borderRadius: "12px",
              borderColor: "#e2e8f0",
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.97), rgba(241,245,249,0.95))",
              boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
            }}
          />

          {/* Legend modern */}
          <Legend
            wrapperStyle={{
              fontSize: "13px",
              paddingTop: "10px",
              color: "#475569",
            }}
          />

          {/* 🟦 Pendapatan Kotor */}
          <Bar
            dataKey="pendapatan_kotor"
            name="Pendapatan Kotor"
            fill="url(#gradientKotor)"
            radius={[8, 8, 0, 0]}
          />

          {/* 🟥 Pengeluaran */}
          <Bar
            dataKey="pengeluaran"
            name="Pengeluaran"
            fill="url(#gradientPengeluaran)"
            radius={[8, 8, 0, 0]}
          />

          {/* 🟩 Pendapatan Bersih */}
          <Bar
            dataKey="pendapatan_bersih"
            name="Pendapatan Bersih"
            fill="url(#gradientBersih)"
            radius={[8, 8, 0, 0]}
          />

          {/* === GRADIENT DEFINITIONS === */}
          <defs>
            <linearGradient id="gradientKotor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="gradientPengeluaran" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f87171" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="gradientBersih" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0.7" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
