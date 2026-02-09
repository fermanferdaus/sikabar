import React from "react";
import MainLayout from "../../layouts/MainLayout";
import ChartKeuangan from "../../components/ChartKeuangan";
import {
  Store,
  Scissors,
  Package,
  DollarSign,
  ArrowDownCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useFetchCapster from "../../hooks/useFetchCapster";
import useFetchProduk from "../../hooks/useFetchProduk";
import useFetchTransaksiAdmin from "../../hooks/useFetchTransaksi";
import useFetchStore from "../../hooks/useFetchStore";
import useFetchKeuangan from "../../hooks/useFetchKeuangan";
import CardStat from "../../components/CardStat";

export default function Dashboard() {
  const navigate = useNavigate();

  // 🔹 Data dari berbagai hook
  const { data: storeData } = useFetchStore();
  const { capsters } = useFetchCapster();
  const { produk } = useFetchProduk();
  const { data: transaksiData } = useFetchTransaksiAdmin("Bulanan");

  // 🔹 Ambil grafik & summary global dari hook keuangan
  const { grafik: grafikKeuangan, summary, loading } = useFetchKeuangan({
    includeSummary: true,
    includeGrafik: true,
  });

  const goTo = (path) => navigate(path);

  // 🔹 Ambil nilai total dari summary (real tanpa pembulatan)
  const totalPendapatanKotor = Number(summary?.pendapatan_kotor || 0);
  const totalPengeluaran = Number(summary?.pengeluaran || 0);
  const totalPendapatanBersih = Number(summary?.pendapatan_bersih || 0);
  const totalTransaksi = transaksiData.reduce(
    (sum, d) => sum + Number(d.total_transaksi || 0),
    0
  );

  // 🔹 Loading state
  if (loading) {
    return (
      <MainLayout current="dashboard">
        <div className="flex items-center justify-center min-h-screen text-gray-500">
          Memuat data dashboard admin...
        </div>
      </MainLayout>
    );
  }

  // ===============================================================
  // 🧭 DASHBOARD UI
  // ===============================================================
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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-7 space-y-8 transition-all duration-300">
            {/* === TITLE === */}
            <h1 className="text-2xl font-semibold text-slate-800">
              Dasbor Owner
            </h1>

            {/* === BARIS 1: Statistik Umum === */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              <CardStat
                gradient="from-indigo-500 to-blue-500"
                title="Total Cabang"
                subtitle="Cabang aktif"
                value={filteredStore?.length || 0}
                icon={<Store size={32} />}
                onClick={() => goTo("/store")}
              />
              <CardStat
                gradient="from-blue-400 to-cyan-400"
                title="Total Kapster"
                subtitle="Kapster terdaftar"
                value={filteredCapster?.length || 0}
                icon={<Scissors size={32} />}
                onClick={() => goTo("/pegawai")}
              />
              <CardStat
                gradient="from-cyan-400 to-sky-500"
                title="Total Produk"
                subtitle="Produk tersedia"
                value={filteredProduk?.length || 0}
                icon={<Package size={32} />}
                onClick={() => goTo("/produk")}
              />
              <CardStat
                gradient="from-teal-400 to-cyan-500"
                title="Total Transaksi"
                subtitle="Transaksi bulan ini"
                value={totalTransaksi.toLocaleString("id-ID")}
                icon={<DollarSign size={32} />}
                onClick={() => goTo("/transaksi/admin")}
              />
            </div>

            {/* === BARIS 2: Pendapatan & Pengeluaran === */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <CardStat
                gradient="from-sky-500 to-blue-600"
                title="Pendapatan Kotor"
                subtitle="Sebelum dikurangi pengeluaran"
                value={`Rp ${totalPendapatanKotor.toLocaleString("id-ID")}`}
                icon={<DollarSign size={32} />}
                onClick={() => goTo("/transaksi/admin")}
              />
              <CardStat
                gradient="from-rose-400 to-red-500"
                title="Total Pengeluaran"
                subtitle="Biaya operasional"
                value={`Rp ${totalPengeluaran.toLocaleString("id-ID")}`}
                icon={<ArrowDownCircle size={32} />}
                onClick={() => goTo("/pengeluaran")}
              />
            </div>

            {/* === BARIS 3: Pendapatan Bersih === */}
            <div>
              <CardStat
                gradient="from-emerald-400 to-green-500"
                title="Pendapatan Bersih"
                subtitle="Setelah dikurangi pengeluaran"
                value={`Rp ${totalPendapatanBersih.toLocaleString("id-ID")}`}
                icon={<DollarSign size={32} />}
                onClick={() => goTo("/laporan/pendapatan")}
              />
            </div>

            {/* === GRAFIK GLOBAL === */}
            {/* {!loading && <ChartKeuangan data={grafikKeuangan} />} */}
          </div>
        );
      }}
    </MainLayout>
  );
}
