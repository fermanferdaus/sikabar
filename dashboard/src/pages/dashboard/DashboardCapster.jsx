import MainLayout from "../../layouts/MainLayout";
import { Wallet, Gift, DollarSign, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatPeriode } from "../../utils/dateFormatter";
import CardStat from "../../components/CardStat"; // 🔹 Pindahkan ke file terpisah

export default function CapsterDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const idCapster = localStorage.getItem("id_capster");

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
            Dashboard Capster
          </h1>
          <p className="text-sm text-gray-500 mt-1">Periode: {periodeLabel}</p>
        </div>

        {/* === Card Pendapatan (2 Baris × 2 Kolom) === */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {/* Urutan warna disusun harmonis dari biru → ungu → oranye → hijau */}
          <CardStat
            title="Komisi"
            icon={<TrendingUp size={32} />}
            value={`Rp ${Number(data?.pendapatan_bersih || 0).toLocaleString(
              "id-ID"
            )}`}
            gradient="from-sky-500 to-blue-600"
            subtitle={periodeLabel}
          />

          <CardStat
            title="Gaji Pokok"
            icon={<Wallet size={32} />}
            value={`Rp ${Number(data?.gaji_pokok || 0).toLocaleString(
              "id-ID"
            )}`}
            gradient="from-indigo-500 to-violet-500"
            subtitle={periodeLabel}
          />

          <CardStat
            title="Bonus"
            icon={<Gift size={32} />}
            value={`Rp ${Number(data?.bonus_bulanan || 0).toLocaleString(
              "id-ID"
            )}`}
            gradient="from-amber-400 to-orange-500"
            subtitle={
              data?.judul_bonus && data.judul_bonus !== ""
                ? data.judul_bonus
                : "-"
            }
          />

          <CardStat
            title="Total Pendapatan"
            icon={<DollarSign size={32} />}
            value={`Rp ${Number(data?.total_pendapatan || 0).toLocaleString(
              "id-ID"
            )}`}
            gradient="from-emerald-400 to-green-500"
            subtitle={periodeLabel}
          />
        </div>
      </div>
    </MainLayout>
  );
}
