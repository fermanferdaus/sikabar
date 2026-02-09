import MainLayout from "../../layouts/MainLayout";
import {
  Wallet,
  Gift,
  DollarSign,
  TrendingUp,
  Scissors,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatPeriode } from "../../utils/dateFormatter";
import CardStat from "../../components/CardStat";

export default function CapsterDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const idCapster = localStorage.getItem("id_capster");

  const goTo = (path) => navigate(path);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/dashboard/capster/${idCapster}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();

        if (result.success) {
          setData(result);
        } else {
          setData({
            pendapatan_bersih: 0,
            gaji_pokok: 0,
            bonus_bulanan: 0,
            total_pendapatan: 0,
            potongan_bulan_ini: 0,
            kasbon_aktif: 0,
            judul_bonus: "-",
            periode: "-",
          });
        }
      } catch (err) {
        console.error("❌ Gagal ambil dashboard capster:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading)
    return (
      <MainLayout current="dashboard">
        <p className="text-gray-500 italic p-8">Memuat data dashboard...</p>
      </MainLayout>
    );

  const periodeLabel =
    data?.periode && data.periode !== "-" ? formatPeriode(data.periode) : "-";

  return (
    <MainLayout current="dashboard">
      <div className="bg-white shadow-md rounded-2xl border border-gray-100 p-7 space-y-8 transition-all duration-300">
        {/* === Header === */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Dasbor Kapster
          </h1>
          <p className="text-sm text-gray-500 mt-1">Periode: {periodeLabel}</p>
        </div>

        {/* === Card Grid === */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {/* 1. Komisi */}
          <CardStat
            title="Komisi"
            icon={<TrendingUp size={32} />}
            value={`Rp ${Number(data?.pendapatan_bersih || 0).toLocaleString(
              "id-ID",
            )}`}
            gradient="from-sky-500 to-blue-600"
            subtitle={periodeLabel}
            onClick={() => goTo("/komisi/capster")}
          />

          {/* 2. Bonus */}
          <CardStat
            title="Bonus"
            icon={<Gift size={32} />}
            value={`Rp ${Number(data?.bonus_bulanan || 0).toLocaleString(
              "id-ID",
            )}`}
            gradient="from-amber-400 to-orange-500"
            subtitle={data?.judul_bonus || "-"}
            onClick={() => goTo("/slip-gaji")}
          />

          {/* 3. Potongan */}
          <CardStat
            title="Potongan"
            icon={<Scissors size={32} />}
            value={`Rp ${Number(data?.potongan_bulan_ini || 0).toLocaleString(
              "id-ID",
            )}`}
            gradient="from-rose-400 to-red-500"
            subtitle="Total potongan bulan ini"
            onClick={() => goTo("/slip-gaji")}
          />

          {/* 4. Kasbon */}
          <CardStat
            title="Kasbon"
            icon={<AlertCircle size={32} />}
            value={`Rp ${Number(data?.kasbon_aktif || 0).toLocaleString(
              "id-ID",
            )}`}
            gradient="from-fuchsia-500 to-purple-600"
            subtitle="Sisa kasbon berjalan"
            onClick={() => goTo("/slip-gaji")}
          />

          {/* 5. Total Pendapatan → FULL WIDTH */}
          <div className="col-span-1 sm:col-span-2">
            <CardStat
              title="Total Pendapatan"
              icon={<DollarSign size={32} />}
              value={`Rp ${Number(data?.total_pendapatan || 0).toLocaleString(
                "id-ID",
              )}`}
              gradient="from-emerald-400 to-green-500"
              subtitle={periodeLabel}
              onClick={() => goTo("/slip-gaji")}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
