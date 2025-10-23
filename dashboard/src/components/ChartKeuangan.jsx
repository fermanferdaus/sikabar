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
        Tidak ada data keuangan untuk ditampilkan
      </div>
    );

  // 🔹 Format tanggal singkat
  const formattedData = data.map((item) => {
    let rawDate = item.tanggal || item.bulan || "";
    let tanggalLabel = rawDate;

    if (rawDate) {
      if (/^\d{4}-\d{2}$/.test(rawDate)) rawDate = `${rawDate}-01`;
      const dateObj = new Date(rawDate);
      if (!isNaN(dateObj)) {
        tanggalLabel = dateObj.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
        });
      }
    }

    return {
      ...item,
      tanggal: tanggalLabel,
    };
  });

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-700 mb-4">
        Grafik Pendapatan Bulanan
      </h2>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={formattedData}
          margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
          barGap={8}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="tanggal"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatRupiah}
            width={90}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(v) => formatRupiah(v)}
            labelFormatter={(label) => `Periode: ${label}`}
            contentStyle={{
              borderRadius: "10px",
              borderColor: "#e2e8f0",
              backgroundColor: "#fff",
              boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
            }}
          />
          <Legend
            wrapperStyle={{
              fontSize: "13px",
              marginTop: "10px",
            }}
          />

          {/* 🟦 Pendapatan Kotor */}
          <Bar
            dataKey="pendapatan_kotor"
            name="Pendapatan Kotor"
            fill="url(#gradientKotor)"
            radius={[6, 6, 0, 0]}
          />

          {/* 🟩 Pendapatan Bersih */}
          <Bar
            dataKey="pendapatan_bersih"
            name="Pendapatan Bersih"
            fill="url(#gradientBersih)"
            radius={[6, 6, 0, 0]}
          />

          {/* Gradien Warna */}
          <defs>
            <linearGradient id="gradientKotor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id="gradientBersih" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#4ade80" stopOpacity={0.8} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
