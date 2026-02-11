import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { useFetchTransaksiStore } from "../../hooks/useFetchTransaksi";
import { formatTanggalJam } from "../../utils/dateFormatter";
import TableData from "../../components/TableData";
import { formatKasirID } from "../../utils/formatID";
import BackButton from "../../components/BackButton";

export default function TransaksiDetail() {
  const { id_store } = useParams();

  const [filterType, setFilterType] = useState("Bulanan");
  const [filterTipeTransaksi, setFilterTipeTransaksi] = useState("Semua");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0],
  );

  const { data, summary, loading, error } = useFetchTransaksiStore(
    id_store,
    filterType,
    tanggal,
  );

  // 🔹 Filter berdasarkan tipe transaksi
  const filteredData = useMemo(() => {
    return data.filter((d) =>
      filterTipeTransaksi === "Semua"
        ? true
        : d.tipe_transaksi === filterTipeTransaksi,
    );
  }, [data, filterTipeTransaksi]);

  // 🔹 Summary fallback manual jika tidak dikirim backend
  const totalTransaksi = summary?.total_transaksi || filteredData.length || 0;

  const totalPendapatanKotor =
    summary?.pendapatan_kotor && summary.pendapatan_kotor > 0
      ? summary.pendapatan_kotor
      : filteredData.reduce((sum, d) => sum + (Number(d.subtotal) || 0), 0);

  const totalPendapatanBersih =
    summary?.pendapatan_bersih && summary.pendapatan_bersih > 0
      ? summary.pendapatan_bersih
      : filteredData.reduce(
          (sum, d) => sum + (Number(d.pendapatan_bersih || d.subtotal) || 0),
          0,
        );

  // 🔹 Format Rupiah
  const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(angka) || 0);

  return (
    <MainLayout current="transaksi">
      {(searchTerm) => {
        const searched = filteredData.filter(
          (d) =>
            d.kasir?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.metode_bayar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.produk?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.layanan?.toLowerCase().includes(searchTerm.toLowerCase()),
        );

        const columns = [
          { key: "no", label: "#" },
          { key: "tanggal", label: "Tanggal" },
          { key: "id_kasir", label: "ID Pegawai" },
          { key: "kasir", label: "Kasir" },
          { key: "tipe_transaksi", label: "Tipe Transaksi" },
          { key: "detail", label: "Detail" },
          { key: "subtotal", label: "Total" },
          { key: "metode_bayar", label: "Metode Bayar" },
          { key: "bukti", label: "Bukti Qris" },
          { key: "struk", label: "Struk" },
        ];

        const tableData = searched.map((d, i) => ({
          no: i + 1,
          tanggal: formatTanggalJam(d.created_at),
          id_kasir: (
            <span className="font-semibold text-slate-700">
              {d.id_kasir ? formatKasirID(d.id_kasir) : "-"}
            </span>
          ),
          kasir: d.kasir || "-",
          tipe_transaksi: (
            <span className="capitalize">
              {d.tipe_transaksi === "service" ? "Layanan" : d.tipe_transaksi}
            </span>
          ),
          detail:
            d.tipe_transaksi === "campuran" ? (
              <>
                <strong>Layanan:</strong> {d.layanan || "-"} <br />
                <strong>Produk:</strong> {d.produk || "-"}
              </>
            ) : d.tipe_transaksi === "service" ? (
              d.layanan || "-"
            ) : (
              d.produk || "-"
            ),
          subtotal: (
            <div className="text-left font-medium text-slate-700">
              {formatRupiah(d.subtotal)}
            </div>
          ),
          metode_bayar: (
            <span className="capitalize">{d.metode_bayar || "-"}</span>
          ),
          bukti: d.bukti_qris ? (
            <button
              onClick={() =>
                window.open(
                  `${import.meta.env.VITE_BACKEND_URL}${d.bukti_qris}`,
                  "_blank",
                )
              }
              className="px-3 py-1.5 text-xs font-medium rounded-md text-white bg-[#0e57b5] hover:bg-[#0b4894] transition"
            >
              Lihat
            </button>
          ) : (
            <button
              disabled
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-300 text-gray-500 cursor-not-allowed"
            >
              Tidak ada
            </button>
          ),

          struk: (
            <button
              onClick={() =>
                window.open(
                  `${import.meta.env.VITE_API_URL}/struk/print/${
                    d.id_transaksi
                  }`,
                  "_blank",
                )
              }
              className="px-3 py-1.5 text-xs font-medium rounded-md text-white bg-[#0e57b5] hover:bg-[#0b4894] transition"
            >
              Lihat
            </button>
          ),
        }));

        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8 transition-all duration-300">
            {/* Back Button */}
            <BackButton to="/transaksi/admin" />

            {/* === Header === */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  Detail Transaksi Cabang
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Riwayat transaksi kasir, layanan, dan produk berdasarkan
                  periode tertentu.
                </p>
              </div>
            </div>

            {/* === Filter Bar === */}
            <div className="flex flex-wrap items-center gap-4 bg-white border border-gray-100 rounded-xl p-4">
              {/* Filter Periode */}
              <div className="flex items-center gap-2">
                <label className="text-gray-600 font-medium text-sm">
                  Tipe:
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Harian">Harian</option>
                  <option value="Bulanan">Bulanan</option>
                </select>
              </div>

              {/* Input Kalender Adaptif */}
              <div className="flex items-center gap-2">
                <label className="text-gray-600 font-medium text-sm">
                  {filterType === "Harian" ? "Tanggal:" : "Bulan:"}
                </label>
                {filterType === "Harian" ? (
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                ) : (
                  <input
                    type="month"
                    value={tanggal.slice(0, 7)}
                    onChange={(e) => setTanggal(e.target.value + "-01")}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                )}
              </div>

              {/* Filter Tipe Transaksi */}
              <div className="flex items-center gap-2">
                <label className="text-gray-600 font-medium text-sm">
                  Tipe Transaksi:
                </label>
                <select
                  value={filterTipeTransaksi}
                  onChange={(e) => setFilterTipeTransaksi(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Semua">Semua</option>
                  <option value="service">Layanan</option>
                  <option value="produk">Produk</option>
                  <option value="campuran">Campuran</option>
                </select>
              </div>
            </div>

            {/* === Summary Cards === */}
            <div className="grid sm:grid-cols-3 gap-6 mt-2">
              <div className="p-5 bg-white shadow-sm rounded-xl text-center transition hover:-translate-y-1 hover:shadow-md duration-300">
                <p className="text-gray-500">Jumlah Transaksi</p>
                <h2 className="text-3xl font-bold text-blue-600 mt-1">
                  {totalTransaksi}
                </h2>
              </div>
              <div className="p-5 bg-white shadow-sm rounded-xl text-center transition hover:-translate-y-1 hover:shadow-md duration-300">
                <p className="text-gray-500">Pendapatan Kotor</p>
                <h2 className="text-3xl font-bold text-sky-600 mt-1">
                  {formatRupiah(totalPendapatanKotor)}
                </h2>
              </div>
              <div className="p-5 bg-white shadow-sm rounded-xl text-center transition hover:-translate-y-1 hover:shadow-md duration-300">
                <p className="text-gray-500">Pendapatan Bersih</p>
                <h2 className="text-3xl font-bold text-emerald-600 mt-1">
                  {formatRupiah(totalPendapatanBersih)}
                </h2>
              </div>
            </div>

            {/* === Tabel === */}
            {loading ? (
              <p className="text-gray-500 italic">Memuat data transaksi...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : searched.length === 0 ? (
              <p className="text-gray-500 italic">Tidak ada transaksi.</p>
            ) : (
              <TableData columns={columns} data={tableData} />
            )}
          </div>
        );
      }}
    </MainLayout>
  );
}
