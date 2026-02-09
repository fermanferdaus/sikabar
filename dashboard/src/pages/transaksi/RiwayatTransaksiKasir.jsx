import { useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useFetchRiwayatKasir } from "../../hooks/useFetchRiwayatKasir";
import { formatTanggalJam } from "../../utils/dateFormatter";
import TableData from "../../components/TableData";

export default function RiwayatTransaksiKasir() {
  const [filterType, setFilterType] = useState("Bulanan");
  const [filterTipeTransaksi, setFilterTipeTransaksi] = useState("Semua");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showCount] = useState(25);

  const {
    data: rawData,
    loading,
    error,
  } = useFetchRiwayatKasir(filterType, tanggal);

  const data = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData?.data)
    ? rawData.data
    : [];

  return (
    <MainLayout current="riwayat transaksi">
      {(searchTerm) => {
        const filteredData = data
          .filter((d) =>
            filterTipeTransaksi === "Semua"
              ? true
              : d.tipe_transaksi === filterTipeTransaksi
          )
          .filter(
            (d) =>
              d.metode_bayar
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              d.produk?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              d.layanan?.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .slice(0, showCount);

        const totalTransaksi = filteredData.length;
        const totalKotor = filteredData.reduce(
          (sum, d) => sum + Number(d.subtotal || 0),
          0
        );
        const totalBersih = filteredData.reduce(
          (sum, d) => sum + Number(d.pendapatan_bersih || 0),
          0
        );

        const columns = [
          { key: "no", label: "#" },
          { key: "tanggal", label: "Tanggal" },
          { key: "tipe_transaksi", label: "Tipe Transaksi" },
          { key: "detail", label: "Detail" },
          { key: "subtotal", label: "Total" },
          { key: "metode_bayar", label: "Metode Bayar" },
          { key: "bukti", label: "Bukti Qris" },
          { key: "struk", label: "Struk" },
        ];

        const tableData = filteredData.map((d, i) => ({
          no: i + 1,
          tanggal: formatTanggalJam(d.created_at),
          tipe_transaksi: (
            <span className="capitalize">{d.tipe_transaksi}</span>
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
              Rp {Number(d.subtotal || 0).toLocaleString("id-ID")}
            </div>
          ),
          metode_bayar: <span className="capitalize">{d.metode_bayar}</span>,
          bukti: d.bukti_qris ? (
            <button
              onClick={() =>
                window.open(
                  `${import.meta.env.VITE_BACKEND_URL}${d.bukti_qris}`,
                  "_blank"
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
                  "_blank"
                )
              }
              className="px-3 py-1.5 text-xs font-medium rounded-md text-white bg-[#0e57b5] hover:bg-[#0b4894] transition"
            >
              Lihat
            </button>
          ),
        }));

        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6 transition-all duration-300">
            {/* === Header === */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-gray-100 pb-4">
              <div className="order-1 sm:order-none text-left w-full sm:w-auto">
                <h1 className="text-xl font-semibold text-slate-800">
                  Riwayat Transaksi Toko
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Daftar transaksi yang telah dilakukan.
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

              {/* Filter Jenis Transaksi */}
              <div className="flex items-center gap-2">
                <label className="text-gray-600 font-medium text-sm">
                  Jenis Transaksi:
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
            <div className="grid sm:grid-cols-3 gap-6 mt-4">
              <SummaryCard
                title="Total Transaksi"
                value={`${totalTransaksi}`}
                color="text-indigo-600"
              />
              <SummaryCard
                title="Pendapatan Kotor"
                value={`Rp ${totalKotor.toLocaleString("id-ID")}`}
                color="text-blue-600"
              />
              <SummaryCard
                title="Pendapatan Bersih"
                value={`Rp ${totalBersih.toLocaleString("id-ID")}`}
                color="text-green-600"
              />
            </div>

            {/* === Konten Tabel === */}
            {loading ? (
              <p className="text-gray-500 italic">Memuat data transaksi...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : filteredData.length === 0 ? (
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

/* ===============================
   🔹 COMPONENT SUMMARY CARD
=============================== */
function SummaryCard({ title, value, color }) {
  return (
    <div className="p-5 bg-white shadow-sm rounded-xl border border-gray-100 text-center transition hover:-translate-y-1 hover:shadow-md duration-300">
      <p className="text-gray-600">{title}</p>
      <h2 className={`text-3xl font-bold mt-1 ${color}`}>{value}</h2>
    </div>
  );
}
