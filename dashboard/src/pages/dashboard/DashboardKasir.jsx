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
  MinusCircle,
  FileMinus,
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

  const [pendapatanKasir, setPendapatanKasir] = useState(0);
  const [bonusKasir, setBonusKasir] = useState(0);
  const [judulBonus, setJudulBonus] = useState("-");
  const [potonganKasir, setPotonganKasir] = useState(0);
  const [kasbonKasir, setKasbonKasir] = useState(0);
  const [pendapatanBersihKasir, setPendapatanBersihKasir] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const idKasir = localStorage.getItem("id_kasir");
  const idStore = localStorage.getItem("id_store");

  const { capsters } = useFetchCapster(idStore);
  const { produk } = useFetchProduk(idStore);
  const { data: transaksiList } = useFetchTransaksiStore(idStore, "Bulanan");

  const {
    grafik: grafikKeuangan,
    summary,
    loading,
  } = useFetchKeuangan({
    id_store: idStore,
    includeSummary: true,
    includeGrafik: true,
  });

  useEffect(() => {
    const fetchPendapatanKasir = async () => {
      try {
        const res = await fetch(`${API_URL}/dashboard/kasir/${idKasir}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const result = await res.json();
        if (result.success) {
          setPendapatanKasir(result.gaji_pokok || 0);
          setBonusKasir(result.bonus_kasir || 0);
          setJudulBonus(result.judul_bonus || "-");
          setPotonganKasir(result.total_potongan || 0);
          setKasbonKasir(result.kasbon_aktif || 0);
          setPendapatanBersihKasir(result.pendapatan_bersih_kasir || 0);
        }
      } catch (err) {
        console.error("Gagal ambil data kasir:", err);
      }
    };
    fetchPendapatanKasir();
  }, [API_URL, idKasir, token]);

  const goTo = (p) => navigate(p);

  const pendapatanKotor = summary?.pendapatan_kotor || 0;
  const labaProduk = summary?.laba_produk || 0;
  const pengeluaranToko = summary?.pengeluaran || 0;
  const pendapatanBersihToko = summary?.pendapatan_bersih || 0;

  return (
    <MainLayout current="dashboard">
      {(searchTerm) => {
        const match = (t) =>
          t?.toString().toLowerCase().includes(searchTerm.toLowerCase());

        const filteredCapster = capsters?.filter((c) => match(c.nama_capster));
        const filteredProduk = produk?.filter((p) => match(p.nama_produk));

        return (
          <div className="bg-white shadow-md rounded-2xl border border-gray-100 p-7 space-y-10">
            <h1 className="text-2xl font-semibold text-slate-800">
              Dasbor Kasir
            </h1>

            {/* ================== STATISTIK TOKO ================== */}
            <section className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-700">
                Statistik Toko
              </h2>

              {(() => {
                const cardsToko = [
                  {
                    gradient: "from-indigo-500 to-blue-500",
                    title: "Total Kapster",
                    subtitle: "Karyawan toko ini",
                    value: filteredCapster?.length || 0,
                    icon: <Scissors size={32} />,
                    onClick: () => goTo("/capster/kasir"),
                  },
                  {
                    gradient: "from-blue-400 to-cyan-400",
                    title: "Total Produk",
                    subtitle: "Produk tersedia",
                    value: filteredProduk?.length || 0,
                    icon: <Package size={32} />,
                    onClick: () => goTo("/produk/kasir"),
                  },
                  {
                    gradient: "from-cyan-400 to-sky-500",
                    title: "Total Transaksi",
                    subtitle: "Bulan ini",
                    value: transaksiList.length.toLocaleString("id-ID"),
                    icon: <DollarSign size={32} />,
                    onClick: () => goTo("/riwayat"),
                  },
                  {
                    gradient: "from-teal-400 to-cyan-500",
                    title: "Pendapatan Kotor",
                    subtitle: "Sebelum komisi",
                    value: loading
                      ? "Memuat..."
                      : `Rp ${pendapatanKotor.toLocaleString("id-ID")}`,
                    icon: <DollarSign size={32} />,
                    onClick: () => goTo("/riwayat"),
                  },
                  {
                    gradient: "from-cyan-500 to-blue-500",
                    title: "Laba Produk",
                    subtitle: "Keuntungan produk",
                    value: loading
                      ? "Memuat..."
                      : `Rp ${labaProduk.toLocaleString("id-ID")}`,
                    icon: <TrendingUp size={32} />,
                    onClick: () => goTo("/produk/kasir"),
                  },
                  {
                    gradient: "from-rose-400 to-red-500",
                    title: "Pengeluaran Toko",
                    subtitle: "Operasional",
                    value: loading
                      ? "Memuat..."
                      : `Rp ${pengeluaranToko.toLocaleString("id-ID")}`,
                    icon: <ArrowDownCircle size={32} />,
                    onClick: () => goTo("/pengeluaran/kasir"),
                  },
                  {
                    gradient: "from-emerald-500 to-green-600",
                    title: "Pendapatan Bersih Toko",
                    subtitle: "Setelah pengeluaran & komisi",
                    value: loading
                      ? "Memuat..."
                      : `Rp ${pendapatanBersihToko.toLocaleString("id-ID")}`,
                    icon: <DollarSign size={32} />,
                    onClick: () => goTo("/laporan/kasir/pendapatan-cabang"),
                  },
                ];

                const isOdd = cardsToko.length % 2 === 1;

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {cardsToko.map((card, index) => {
                      const isLast = index === cardsToko.length - 1;

                      return (
                        <div
                          key={index}
                          className={isLast && isOdd ? "sm:col-span-2" : ""}
                        >
                          <CardStat {...card} />
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </section>

            {/* ================== STATISTIK KASIR ================== */}
            <section className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-700">
                Statistik Kasir
              </h2>

              {(() => {
                const cardsKasir = [
                  {
                    gradient: "from-amber-400 to-orange-500",
                    title: "Bonus Kasir",
                    subtitle: judulBonus,
                    value: `Rp ${bonusKasir.toLocaleString("id-ID")}`,
                    icon: <Gift size={32} />,
                  },
                  {
                    gradient: "from-red-500 to-red-600",
                    title: "Potongan Kasir",
                    subtitle: "Potongan bulan ini",
                    value: `Rp ${potonganKasir.toLocaleString("id-ID")}`,
                    icon: <MinusCircle size={32} />,
                  },
                  {
                    gradient: "from-orange-500 to-yellow-500",
                    title: "Kasbon Aktif",
                    subtitle: "Sisa kasbon",
                    value: `Rp ${kasbonKasir.toLocaleString("id-ID")}`,
                    icon: <FileMinus size={32} />,
                  },
                  {
                    gradient: "from-violet-500 to-indigo-500",
                    title: "Gaji Pokok Kasir",
                    subtitle: "Gaji tetap",
                    value: `Rp ${pendapatanKasir.toLocaleString("id-ID")}`,
                    icon: <User size={32} />,
                  },
                  {
                    gradient: "from-green-400 to-emerald-500",
                    title: "Pendapatan Bersih Kasir",
                    subtitle: "Gaji + bonus - potongan/kasbon",
                    value: `Rp ${pendapatanBersihKasir.toLocaleString(
                      "id-ID"
                    )}`,
                    icon: <DollarSign size={32} />,
                  },
                ];

                const isOdd = cardsKasir.length % 2 === 1;

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {cardsKasir.map((card, index) => {
                      const isLast = index === cardsKasir.length - 1;

                      return (
                        <div
                          key={index}
                          className={isLast && isOdd ? "sm:col-span-2" : ""}
                        >
                          <CardStat {...card} />
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </section>

            {/* ================== GRAFIK ================== */}
            {/* {!loading && <ChartKeuangan data={grafikKeuangan} />} */}
          </div>
        );
      }}
    </MainLayout>
  );
}
