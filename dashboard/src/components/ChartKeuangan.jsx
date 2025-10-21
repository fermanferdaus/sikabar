import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function ChartKeuangan({ data }) {
  if (!data || data.length === 0)
    return (
      <div className="text-center text-gray-500 py-6">
        Tidak ada data keuangan.
      </div>
    );

  const labels = data.map((d) => d.tanggal);
  const pendapatan = data.map((d) => d.pendapatan);
  const komisi = data.map((d) => d.komisi);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Pendapatan",
        data: pendapatan,
        borderColor: "#d97706",
        backgroundColor: "rgba(217,119,6,0.2)",
        tension: 0.3,
      },
      {
        label: "Komisi Capster",
        data: komisi,
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.2)",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (context) => `Rp ${context.formattedValue}`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (val) =>
            "Rp " + val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
        },
      },
    },
  };

  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        Grafik Pendapatan & Komisi
      </h2>
      <Line data={chartData} options={options} />
    </div>
  );
}
