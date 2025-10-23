import MainLayout from "../../layouts/MainLayout";
import ChartKeuangan from "../../components/ChartKeuangan";
import { Scissors, Package, DollarSign } from "lucide-react";
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

  const { capsters } = useFetchCapster(idStore);
  const { produk } = useFetchProduk(idStore);
  const { data: transaksiData, loading } = useFetchTransaksiStore(
    idStore,
    "Bulanan"
  );

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
      {(searchTerm) => {
        const filterMatch = (text) =>
          text?.toString().toLowerCase().includes(searchTerm.toLowerCase());

        const filteredCapster = capsters?.filter((c) =>
          filterMatch(c.nama_capster)
        );
        const filteredProduk = produk?.filter((p) =>
          filterMatch(p.nama_produk)
        );

        return (
          <div className="bg-white shadow-md rounded-2xl border border-gray-100 p-7 space-y-8 transition-all duration-300">
            {/* === BARIS 1: Statistik Umum === */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* ✂️ Total Capster */}
              <div
                onClick={() => goTo("/capster/kasir")}
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

              {/* 📦 Total Produk */}
              <div
                onClick={() => goTo("/produk/kasir")}
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

              {/* 💰 Total Transaksi */}
              <div
                onClick={() => goTo("/riwayat")}
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
              {/* 💵 Pendapatan Kotor Bulan Ini */}
              <div
                onClick={() => goTo("/riwayat")}
                className="cursor-pointer bg-[#22d3ee] text-white rounded-xl p-6 shadow hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm opacity-90">
                    Pendapatan Kotor Bulan Ini
                  </p>
                  <DollarSign size={28} />
                </div>
                <h2 className="text-3xl font-semibold">
                  Rp {totalKotor.toLocaleString("id-ID")}
                </h2>
                <p className="text-xs opacity-80 mt-1">
                  Sebelum pemotongan komisi
                </p>
              </div>

              {/* 💸 Pendapatan Bersih Bulan Ini */}
              <div
                onClick={() => goTo("/riwayat")}
                className="cursor-pointer bg-[#34d399] text-white rounded-xl p-6 shadow hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm opacity-90">
                    Pendapatan Bersih Bulan Ini
                  </p>
                  <DollarSign size={28} />
                </div>
                <h2 className="text-3xl font-semibold">
                  Rp {totalBersih.toLocaleString("id-ID")}
                </h2>
                <p className="text-xs opacity-80 mt-1">
                  Setelah pembagian komisi
                </p>
              </div>
            </div>

            {/* === GRAFIK KEUANGAN === */}
            {loading ? (
              <div className="bg-[#f9fafb] rounded-2xl border border-gray-100 p-6 text-center text-gray-500">
                Memuat grafik pendapatan toko...
              </div>
            ) : transaksiData.length === 0 ? (
              <div className="bg-[#f9fafb] rounded-2xl border border-gray-100 p-6 text-center text-gray-400 italic">
                Belum ada data pendapatan untuk toko ini.
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <ChartKeuangan data={transaksiData} />
              </div>
            )}
          </div>
        );
      }}
    </MainLayout>
  );
}
