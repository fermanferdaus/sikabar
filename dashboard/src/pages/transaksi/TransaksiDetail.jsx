import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { useFetchTransaksiStore } from "../../hooks/useFetchTransaksi";
import { formatTanggalJam } from "../../utils/dateFormatter";
import { ArrowLeft } from "lucide-react";
import TableData from "../../components/TableData";

export default function TransaksiDetail() {
  const { id_store } = useParams();
  const navigate = useNavigate();

  const [filterType, setFilterType] = useState("Bulanan");
  const [filterTipeTransaksi, setFilterTipeTransaksi] = useState("Semua");
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [showCount, setShowCount] = useState(25); // jumlah data ditampilkan

  const { data, loading, error } = useFetchTransaksiStore(
    id_store,
    filterType,
    tanggal
  );

  return (
    <MainLayout current="transaksi">
      {(searchTerm) => {
        const filteredData = data
          .filter((d) =>
            filterTipeTransaksi === "Semua"
              ? true
              : d.tipe_transaksi === filterTipeTransaksi
          )
          .filter(
            (d) =>
              d.kasir?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              d.metode_bayar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              d.produk?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              d.layanan?.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .slice(0, showCount); // batasi jumlah tampil

        const columns = [
          { key: "no", label: "#" },
          { key: "tanggal", label: "Tanggal" },
          { key: "kasir", label: "Kasir" },
          { key: "tipe_transaksi", label: "Tipe Transaksi" },
          { key: "detail", label: "Detail" },
          { key: "subtotal", label: "Total" },
          { key: "metode_bayar", label: "Metode Bayar" },
        ];

        const tableData = filteredData.map((d, i) => ({
          no: i + 1,
          tanggal: formatTanggalJam(d.created_at),
          kasir: d.kasir,
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
              Rp {Number(d.subtotal).toLocaleString("id-ID")}
            </div>
          ),
          metode_bayar: (
            <span className="capitalize">{d.metode_bayar}</span>
          ),
        }));

        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6 transition-all duration-300">
            {/* === Header Card === */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  Detail Transaksi Toko
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Riwayat transaksi kasir, layanan, dan produk.
                </p>
              </div>

              <button
                onClick={() => navigate("/transaksi/admin")}
                className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2.5 rounded-xl font-medium text-sm transition-all"
              >
                <ArrowLeft size={16} />
                Kembali
              </button>
            </div>

            {/* === Filter Bar === */}
            <div className="flex flex-wrap items-center gap-4 bg-gray-50 border border-gray-100 rounded-xl p-4">
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

              <div className="flex items-center gap-2">
                <label className="text-gray-600 font-medium text-sm">
                  Tanggal:
                </label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

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

            {/* === Tabel === */}
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
