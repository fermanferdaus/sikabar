import MainLayout from "../layouts/MainLayout";
import CardStat from "../components/CardStat";
import ChartKeuangan from "../components/ChartKeuangan";
import { Users, Scissors, Package, DollarSign } from "lucide-react";
import useFetchCapster from "../hooks/useFetchCapster";
import useFetchProduk from "../hooks/useFetchProduk";
import useFetchTransaksi from "../hooks/useFetchTransaksi";
import useFetchKeuangan from "../hooks/useFetchKeuangan";

export default function Dashboard() {
  const { capsters } = useFetchCapster();
  const { produk } = useFetchProduk();
  const { transaksi } = useFetchTransaksi();
  const { data: keuangan, loading: loadKeuangan } = useFetchKeuangan();

  return (
    <MainLayout current="dashboard">
      {/* Statistik Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <CardStat
          title="Total Capster"
          value={capsters?.length || 0}
          icon={<Scissors size={24} />}
          color="bg-amber-500"
        />
        <CardStat
          title="Total Produk"
          value={produk?.length || 0}
          icon={<Package size={24} />}
          color="bg-blue-500"
        />
        <CardStat
          title="Total Transaksi"
          value={transaksi?.length || 0}
          icon={<DollarSign size={24} />}
          color="bg-green-500"
        />
        <CardStat
          title="Total Pengguna"
          value="5"
          icon={<Users size={24} />}
          color="bg-purple-500"
        />
      </div>

      {/* Grafik */}
      {loadKeuangan ? (
        <div className="bg-white border rounded-xl shadow-sm p-6 text-center text-gray-500">
          Memuat grafik...
        </div>
      ) : (
        <ChartKeuangan data={keuangan} />
      )}
    </MainLayout>
  );
}
