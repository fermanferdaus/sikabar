import MainLayout from "../../layouts/MainLayout";
import CardStat from "../../components/CardStat";
import ChartKeuangan from "../../components/ChartKeuangan";
import { Store, Scissors, Package, DollarSign, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useFetchCapster from "../../hooks/useFetchCapster";
import useFetchProduk from "../../hooks/useFetchProduk";
import useFetchTransaksiAdmin from "../../hooks/useFetchTransaksi";
import useFetchStore from "../../hooks/useFetchStore";
import useFetchKeuangan from "../../hooks/useFetchKeuangan";

export default function Dashboard() {
  const navigate = useNavigate();

  // 🔹 Ambil data dari hooks
  const { data: storeData } = useFetchStore();
  const { capsters } = useFetchCapster();
  const { produk } = useFetchProduk();
  const { data: transaksiData } = useFetchTransaksiAdmin("Bulanan");
  const { data: keuangan, loading: loadKeuangan } = useFetchKeuangan();

  // 💰 Hitung total transaksi & pendapatan
  const totalTransaksi = transaksiData.reduce(
    (sum, d) => sum + Number(d.total_transaksi || 0),
    0
  );
  const totalPendapatanKotor = transaksiData.reduce(
    (sum, d) => sum + Number(d.pendapatan_kotor || 0),
    0
  );
  const totalPendapatanBersih = transaksiData.reduce(
    (sum, d) => sum + Number(d.pendapatan_bersih || 0),
    0
  );

  // 🔗 Navigasi cepat
  const goTo = (path) => navigate(path);

  return (
    <MainLayout current="dashboard">
      {/* === BARIS 1: Data Umum === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {/* 🏬 Total Store */}
        <div className="bg-white border rounded-xl shadow-sm hover:shadow-md transition p-5 flex flex-col">
          <CardStat
            title="Total Store"
            value={storeData?.length || 0}
            icon={<Store size={24} />}
            color="bg-purple-500"
          />
          <hr className="my-3 border-gray-200" />
          <button
            onClick={() => goTo("/store")}
            className="text-purple-600 hover:text-purple-800 flex items-center gap-1 text-sm font-medium self-end"
          >
            Lihat Selengkapnya <ArrowRight size={15} />
          </button>
        </div>

        {/* ✂️ Total Capster */}
        <div className="bg-white border rounded-xl shadow-sm hover:shadow-md transition p-5 flex flex-col">
          <CardStat
            title="Total Capster"
            value={capsters?.length || 0}
            icon={<Scissors size={24} />}
            color="bg-amber-500"
          />
          <hr className="my-3 border-gray-200" />
          <button
            onClick={() => goTo("/capster")}
            className="text-amber-600 hover:text-amber-800 flex items-center gap-1 text-sm font-medium self-end"
          >
            Lihat Selengkapnya <ArrowRight size={15} />
          </button>
        </div>

        {/* 📦 Total Produk */}
        <div className="bg-white border rounded-xl shadow-sm hover:shadow-md transition p-5 flex flex-col">
          <CardStat
            title="Total Produk"
            value={produk?.length || 0}
            icon={<Package size={24} />}
            color="bg-blue-500"
          />
          <hr className="my-3 border-gray-200" />
          <button
            onClick={() => goTo("/produk")}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium self-end"
          >
            Lihat Selengkapnya <ArrowRight size={15} />
          </button>
        </div>

        {/* 💰 Total Transaksi */}
        <div className="bg-white border rounded-xl shadow-sm hover:shadow-md transition p-5 flex flex-col">
          <CardStat
            title="Total Transaksi"
            value={totalTransaksi.toLocaleString("id-ID")}
            icon={<DollarSign size={24} />}
            color="bg-green-500"
          />
          <hr className="my-3 border-gray-200" />
          <button
            onClick={() => goTo("/transaksi/admin")}
            className="text-green-600 hover:text-green-800 flex items-center gap-1 text-sm font-medium self-end"
          >
            Lihat Selengkapnya <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* === BARIS 2: Pendapatan Bulanan === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5 mb-6">
        {/* 💵 Pendapatan Kotor Bulan Ini */}
        <div className="bg-white border rounded-xl shadow-sm hover:shadow-md transition p-5 flex flex-col">
          <CardStat
            title="Pendapatan Kotor Bulan Ini"
            value={`Rp ${totalPendapatanKotor.toLocaleString("id-ID")}`}
            icon={<DollarSign size={24} />}
            color="bg-sky-500"
          />
          <hr className="my-3 border-gray-200" />
          <button
            onClick={() => goTo("/transaksi/admin")}
            className="text-sky-600 hover:text-sky-800 flex items-center gap-1 text-sm font-medium self-end"
          >
            Lihat Selengkapnya <ArrowRight size={15} />
          </button>
        </div>

        {/* 💸 Pendapatan Bersih Bulan Ini */}
        <div className="bg-white border rounded-xl shadow-sm hover:shadow-md transition p-5 flex flex-col">
          <CardStat
            title="Pendapatan Bersih Bulan Ini"
            value={`Rp ${totalPendapatanBersih.toLocaleString("id-ID")}`}
            icon={<DollarSign size={24} />}
            color="bg-emerald-600"
          />
          <hr className="my-3 border-gray-200" />
          <button
            onClick={() => goTo("/transaksi/admin")}
            className="text-emerald-600 hover:text-emerald-800 flex items-center gap-1 text-sm font-medium self-end"
          >
            Lihat Selengkapnya <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* === Grafik Keuangan === */}
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
