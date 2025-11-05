import MainLayout from "../../layouts/MainLayout";
import ChartKeuangan from "../../components/ChartKeuangan";
import {
  Scissors,
  Package,
  DollarSign,
  User,
  Gift,
  ArrowDownCircle,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useFetchCapster from "../../hooks/useFetchCapster";
import useFetchProduk from "../../hooks/useFetchProduk";
import { useFetchTransaksiStore } from "../../hooks/useFetchTransaksi";
import useFetchKeuangan from "../../hooks/useFetchKeuangan";
import CardStat from "../../components/CardStat";

export default function DashboardKasir() {
  const navigate = useNavigate();
  const [idStore, setIdStore] = useState(null);
  const [pendapatanKasir, setPendapatanKasir] = useState(0);
  const [bonusKasir, setBonusKasir] = useState(0);
  const [judulBonus, setJudulBonus] = useState("-");

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const idKasir = localStorage.getItem("id_user");

  // 🔹 Ambil ID store dari localStorage
  useEffect(() => {
    const storeId = localStorage.getItem("id_store");
    if (storeId) setIdStore(storeId);
  }, []);

  // 🔹 Data umum
  const { capsters } = useFetchCapster(idStore);
  const { produk } = useFetchProduk(idStore);
  const { data: transaksiList } = useFetchTransaksiStore(idStore, "Bulanan");

  // 🔹 Data keuangan (grafik + summary)
  const {
    grafik: grafikKeuangan,
    summary,
    loading,
  } = useFetchKeuangan({
    id_store: idStore,
    includeSummary: true,
    includeGrafik: true,
  });

  // 🔹 Ambil data pendapatan kasir & bonus
  useEffect(() => {
    const fetchPendapatanKasir = async () => {
      try {
        const res = await fetch(`${API_URL}/dashboard/kasir/${idKasir}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        if (result.success) {
          setPendapatanKasir(result.total_pendapatan || 0);
          setBonusKasir(result.bonus_kasir || 0);
          setJudulBonus(result.judul_bonus || "-");
        }
      } catch (err) {
        console.error("❌ Gagal ambil pendapatan kasir:", err);
      }
    };
    fetchPendapatanKasir();
  }, [API_URL, idKasir, token]);

  const goTo = (path) => navigate(path);

  // 🔹 Data keuangan toko
  const pendapatanKotor = summary?.pendapatan_kotor || 0;
  const labaProduk = summary?.laba_produk || 0;
  const pengeluaranToko = summary?.pengeluaran || 0;
  const pendapatanBersih = summary?.pendapatan_bersih || 0;

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
            <h1 className="text-2xl font-semibold text-slate-800">
              Dashboard Kasir
            </h1>

            {/* === BARIS 1: Statistik Umum === */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <CardStat
                gradient="from-indigo-500 to-blue-500"
                title="Total Capster"
                subtitle="Karyawan terdaftar"
                value={filteredCapster?.length || 0}
                icon={<Scissors size={32} />}
                onClick={() => goTo("/capster/kasir")}
              />
              <CardStat
                gradient="from-blue-400 to-cyan-400"
                title="Total Produk"
                subtitle="Produk tersedia"
                value={filteredProduk?.length || 0}
                icon={<Package size={32} />}
                onClick={() => goTo("/produk/kasir")}
              />
              <CardStat
                gradient="from-cyan-400 to-sky-500"
                title="Total Transaksi"
                subtitle="Transaksi bulan ini"
                value={transaksiList.length.toLocaleString("id-ID")}
                icon={<DollarSign size={32} />}
                onClick={() => goTo("/riwayat")}
              />
            </div>

            {/* === BARIS 2: Pendapatan & Laba Produk === */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <CardStat
                gradient="from-teal-400 to-cyan-500"
                title="Pendapatan Kotor"
                subtitle="Sebelum pemotongan komisi"
                value={
                  loading
                    ? "Memuat..."
                    : `Rp ${pendapatanKotor.toLocaleString("id-ID")}`
                }
                icon={<DollarSign size={32} />}
              />
              <CardStat
                gradient="from-cyan-500 to-blue-500"
                title="Laba Produk"
                subtitle="Total keuntungan penjualan produk"
                value={
                  loading
                    ? "Memuat..."
                    : `Rp ${labaProduk.toLocaleString("id-ID")}`
                }
                icon={<TrendingUp size={32} />}
              />
            </div>

            {/* === BARIS 3: Pengeluaran & Gaji Kasir === */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <CardStat
                gradient="from-rose-400 to-red-500"
                title="Pengeluaran Toko"
                subtitle="Biaya operasional toko"
                value={
                  loading
                    ? "Memuat..."
                    : `Rp ${pengeluaranToko.toLocaleString("id-ID")}`
                }
                icon={<ArrowDownCircle size={32} />}
              />
              <CardStat
                gradient="from-amber-400 to-orange-500"
                title="Bonus Kasir Bulan Ini"
                subtitle={judulBonus || "-"}
                value={`Rp ${Number(bonusKasir || 0).toLocaleString("id-ID")}`}
                icon={<Gift size={32} />}
              />
            </div>

            {/* === BARIS 4: Bonus & Pendapatan Bersih === */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <CardStat
                gradient="from-violet-500 to-indigo-500"
                title="Gaji Kasir Bulan Ini"
                subtitle="Total penghasilan bersih"
                value={`Rp ${Number(pendapatanKasir || 0).toLocaleString(
                  "id-ID"
                )}`}
                icon={<User size={32} />}
              />
              <CardStat
                gradient="from-emerald-400 to-green-500"
                title="Pendapatan Bersih"
                subtitle="Setelah pengeluaran & komisi"
                value={
                  loading
                    ? "Memuat..."
                    : `Rp ${pendapatanBersih.toLocaleString("id-ID")}`
                }
                icon={<DollarSign size={32} />}
              />
            </div>

            {/* === GRAFIK === */}
            {loading ? (
              <div className="bg-[#f9fafb] rounded-2xl border border-gray-100 p-6 text-center text-gray-500">
                Memuat grafik pendapatan toko...
              </div>
            ) : grafikKeuangan.length === 0 ? (
              <div className="bg-[#f9fafb] rounded-2xl border border-gray-100 p-6 text-center text-gray-400 italic">
                Belum ada data pendapatan untuk toko ini.
              </div>
            ) : (
              <ChartKeuangan data={grafikKeuangan} />
            )}
          </div>
        );
      }}
    </MainLayout>
  );
}
