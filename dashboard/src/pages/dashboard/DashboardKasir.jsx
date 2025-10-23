import MainLayout from "../../layouts/MainLayout";
import CardStat from "../../components/CardStat";
import ChartKeuangan from "../../components/ChartKeuangan";
import { Scissors, Package, DollarSign, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useFetchCapster from "../../hooks/useFetchCapster";
import useFetchProduk from "../../hooks/useFetchProduk";
import { useFetchTransaksiStore } from "../../hooks/useFetchTransaksi";

export default function DashboardKasir() {
  const navigate = useNavigate();
  const [idStore, setIdStore] = useState(null);

  useEffect(() => {
    const storeId = localStorage.getItem("id_store");
    if (storeId) setIdStore(storeId);
  }, []);

  // 🔹 Ambil data berdasarkan store kasir
  const { capsters } = useFetchCapster(idStore);
  const { produk } = useFetchProduk(idStore);
  const { data: transaksiData, loading } = useFetchTransaksiStore(
    idStore,
    "Bulanan"
  );

  // 💰 Hitung total transaksi & pendapatan
  const totalTransaksi = transaksiData.reduce(
    (sum, d) => sum + Number(d.total_transaksi || 0),
    0
  );
  const totalKotor = transaksiData.reduce(
    (sum, d) => sum + Number(d.pendapatan_kotor || 0),
    0
  );
  const totalBersih = transaksiData.reduce(
    (sum, d) => sum + Number(d.pendapatan_bersih || 0),
    0
  );

  const goTo = (path) => navigate(path);

  return (
    <MainLayout current="dashboard">
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">
        Dashboard Kasir
      </h1>

      {/* === BARIS 1: Statistik Umum === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
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
            onClick={() => goTo("/capster/kasir")}
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
            onClick={() => goTo("/produk/kasir")}
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
            onClick={() => goTo("/riwayat")}
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
            value={`Rp ${totalKotor.toLocaleString("id-ID")}`}
            icon={<DollarSign size={24} />}
            color="bg-sky-500"
          />
        </div>

        {/* 💸 Pendapatan Bersih Bulan Ini */}
        <div className="bg-white border rounded-xl shadow-sm hover:shadow-md transition p-5 flex flex-col">
          <CardStat
            title="Pendapatan Bersih Bulan Ini"
            value={`Rp ${totalBersih.toLocaleString("id-ID")}`}
            icon={<DollarSign size={24} />}
            color="bg-emerald-600"
          />
        </div>
      </div>

      {/* === GRAFIK KEUANGAN === */}
      {loading ? (
        <div className="bg-white border rounded-xl shadow-sm p-6 text-center text-gray-500">
          Memuat grafik pendapatan toko...
        </div>
      ) : transaksiData.length === 0 ? (
        <div className="bg-white border rounded-xl shadow-sm p-6 text-center text-gray-400 italic">
          Belum ada data pendapatan untuk toko ini.
        </div>
      ) : (
        <ChartKeuangan data={transaksiData} />
      )}
    </MainLayout>
  );
}
