import {
  LineChart,
  Line,
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

  // 🔹 Samakan format tanggal (seperti admin)
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
    <div className="bg-white border rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-slate-700 mb-4">
        Grafik Pendapatan Bulanan
      </h2>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="tanggal" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={formatRupiah} width={100} />
          <Tooltip
            formatter={(v) => formatRupiah(v)}
            labelFormatter={(label) => `Periode: ${label}`}
            contentStyle={{
              borderRadius: "8px",
              borderColor: "#e2e8f0",
              backgroundColor: "#fff",
            }}
          />
          <Legend
            wrapperStyle={{
              fontSize: "13px",
              marginTop: "10px",
            }}
          />

          {/* 💙 Garis Pendapatan Kotor */}
          <Line
            type="monotone"
            dataKey="pendapatan_kotor"
            name="Pendapatan Kotor"
            stroke="#38bdf8"
            strokeWidth={2}
            dot={false}
          />

          {/* 💚 Garis Pendapatan Bersih */}
          <Line
            type="monotone"
            dataKey="pendapatan_bersih"
            name="Pendapatan Bersih"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
