import MainLayout from "../../layouts/MainLayout";
import ChartKeuangan from "../../components/ChartKeuangan";
import { Store, Scissors, Package, DollarSign } from "lucide-react";
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

  // 💰 Hitung total
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

  const goTo = (path) => navigate(path);

  return (
    <MainLayout current="dashboard">
      {(searchTerm) => {
        const filterMatch = (text) =>
          text?.toString().toLowerCase().includes(searchTerm.toLowerCase());

        const filteredStore = storeData?.filter((s) =>
          filterMatch(s.nama_store)
        );
        const filteredCapster = capsters?.filter((c) =>
          filterMatch(c.nama_capster)
        );
        const filteredProduk = produk?.filter((p) =>
          filterMatch(p.nama_produk)
        );

        return (
          <div className="bg-white shadow-md rounded-2xl border border-gray-100 p-7 space-y-8 transition-all duration-300">
            {/* === BARIS 1: Data utama === */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div
                onClick={() => goTo("/store")}
                className="cursor-pointer bg-[#0f62fe] text-white rounded-xl p-6 shadow hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm opacity-90">Total Cabang</p>
                  <Store size={28} />
                </div>
                <h2 className="text-3xl font-semibold">
                  {filteredStore?.length || 0}
                </h2>
                <p className="text-xs opacity-80 mt-1">Cabang aktif</p>
              </div>

              <div
                onClick={() => goTo("/capster")}
                className="cursor-pointer bg-[#1d4ed8] text-white rounded-xl p-6 shadow hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm opacity-90">Total Capster</p>
                  <Scissors size={28} />
                </div>
                <h2 className="text-3xl font-semibold">
                  {filteredCapster?.length || 0}
                </h2>
                <p className="text-xs opacity-80 mt-1">Karyawan terdaftar</p>
              </div>

              <div
                onClick={() => goTo("/produk")}
                className="cursor-pointer bg-[#2563eb] text-white rounded-xl p-6 shadow hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm opacity-90">Total Produk</p>
                  <Package size={28} />
                </div>
                <h2 className="text-3xl font-semibold">
                  {filteredProduk?.length || 0}
                </h2>
                <p className="text-xs opacity-80 mt-1">Produk tersedia</p>
              </div>

              <div
                onClick={() => goTo("/transaksi/admin")}
                className="cursor-pointer bg-[#38bdf8] text-white rounded-xl p-6 shadow hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm opacity-90">Total Transaksi</p>
                  <DollarSign size={28} />
                </div>
                <h2 className="text-3xl font-semibold">
                  {totalTransaksi.toLocaleString("id-ID")}
                </h2>
                <p className="text-xs opacity-80 mt-1">Transaksi bulan ini</p>
              </div>
            </div>

            {/* === BARIS 2: Pendapatan === */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div
                onClick={() => goTo("/transaksi/admin")}
                className="cursor-pointer bg-[#22d3ee] text-white rounded-xl p-6 shadow hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm opacity-90">
                    Pendapatan Kotor Bulan Ini
                  </p>
                  <DollarSign size={28} />
                </div>
                <h2 className="text-3xl font-semibold">
                  Rp {totalPendapatanKotor.toLocaleString("id-ID")}
                </h2>
                <p className="text-xs opacity-80 mt-1">
                  Sebelum pemotongan komisi
                </p>
              </div>

              <div
                onClick={() => goTo("/transaksi/admin")}
                className="cursor-pointer bg-[#34d399] text-white rounded-xl p-6 shadow hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm opacity-90">
                    Pendapatan Bersih Bulan Ini
                  </p>
                  <DollarSign size={28} />
                </div>
                <h2 className="text-3xl font-semibold">
                  Rp {totalPendapatanBersih.toLocaleString("id-ID")}
                </h2>
                <p className="text-xs opacity-80 mt-1">
                  Setelah pembagian komisi
                </p>
              </div>
            </div>

            {/* === Grafik Keuangan === */}
            {loadKeuangan ? (
              <div className="bg-[#f9fafb] rounded-2xl border border-gray-100 p-6 text-center text-gray-500 shadow-inner">
                Memuat grafik...
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <ChartKeuangan data={keuangan} />
              </div>
            )}
          </div>
        );
      }}
    </MainLayout>
  );
}
