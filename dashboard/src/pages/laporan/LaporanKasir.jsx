import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { BarChart3, Package, Activity, Receipt, FileText, Wallet } from "lucide-react";

export default function LaporanKasir() {
  const navigate = useNavigate();

  const menus = [
    {
      title: "Laporan Data Produk",
      desc: "Lihat data lengkap produk setiap cabang barbershop.",
      icon: <Package size={28} />,
      route: "/laporan/kasir/produk",
    },
    {
      title: "Laporan Penjualan Produk",
      desc: "Rekap penjualan produk setiap cabang.",
      icon: <Receipt size={28} />,
      route: "/laporan/kasir/penjualan-produk",
    },
    {
      title: "Laporan Pendapatan Produk",
      desc: "Total pemasukan dan keuntungan dari penjualan produk.",
      icon: <BarChart3 size={28} />,
      route: "/laporan/kasir/pendapatan-produk",
    },
    {
      title: "Laporan Pendapatan Jasa",
      desc: "Pendapatan jasa potong rambut dan layanan lainnya.",
      icon: <Activity size={28} />,
      route: "/laporan/kasir/pendapatan-jasa",
    },
    {
      title: "Laporan Pendapatan Cabang",
      desc: "Ringkasan pendapatan bersih cabang.",
      icon: <Wallet size={28} />,
      route: "/laporan/kasir/pendapatan-cabang",
    },
    {
      title: "Laporan Pengeluaran",
      desc: "Total pengeluaran operasional setiap cabang.",
      icon: <FileText size={28} />,
      route: "/laporan/kasir/pengeluaran",
    },
  ];

  return (
    <MainLayout current="laporan">
      {() => (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8 transition-all duration-300">
          {/* === Header === */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-gray-100 pb-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-800">
                Laporan Keuangan & Operasional
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Pilih jenis laporan yang ingin dilihat.
              </p>
            </div>
          </div>

          {/* === Grid Menu === */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {menus.map((m, i) => (
              <div
                key={i}
                onClick={() => navigate(m.route)}
                className="cursor-pointer border border-gray-100 bg-white rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-[#0e57b5] rounded-lg">
                    {m.icon}
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-800">
                      {m.title}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">{m.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </MainLayout>
  );
}
