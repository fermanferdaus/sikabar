import { useState, useEffect, useMemo } from "react";
import MainLayout from "../../layouts/MainLayout";
import TableData from "../../components/TableData";
import { FileText, Calendar, Store } from "lucide-react";
import formatRupiah from "../../utils/formatRupiah";
import { formatTanggal } from "../../utils/dateFormatter";
import useFetchStore from "../../hooks/useFetchStore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function LaporanPengeluaran() {
  const [filterType, setFilterType] = useState("Harian");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7));
  const [periodeMulai, setPeriodeMulai] = useState("");
  const [periodeAkhir, setPeriodeAkhir] = useState("");
  const [selectedStore, setSelectedStore] = useState("Semua");
  const [kategoriPengeluaran, setKategoriPengeluaran] = useState("Semua");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: storeData, loading: loadingStore } = useFetchStore();
  const API_URL = import.meta.env.VITE_API_URL;

  // === FETCH DATA ===
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      let url = `${API_URL}/laporan/pengeluaran?`;

      if (filterType === "Harian") {
        url += `filter=periode&startDate=${tanggal}&endDate=${tanggal}`;
      } else if (filterType === "Bulanan") {
        const [year, month] = bulan.split("-");
        const startDate = `${year}-${month}-01`;
        const endDate = `${year}-${month}-31`;
        url += `filter=periode&startDate=${startDate}&endDate=${endDate}`;
      } else if (filterType === "Periode" && periodeMulai && periodeAkhir) {
        url += `filter=periode&startDate=${periodeMulai}&endDate=${periodeAkhir}`;
      }

      if (selectedStore !== "Semua") url += `&store=${selectedStore}`;
      if (kategoriPengeluaran !== "Semua")
        url += `&kategori=${kategoriPengeluaran}`;

      const res = await fetch(url);
      const json = await res.json();

      if (json.success) setData(json.data);
      else setError("Tidak ada data ditemukan untuk filter ini.");
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data laporan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [
    filterType,
    tanggal,
    bulan,
    periodeMulai,
    periodeAkhir,
    selectedStore,
    kategoriPengeluaran,
  ]);

  // === CETAK PDF ===
  const handlePrintPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // === HEADER ===
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("LE MUANI BARBERSHOP", 148, 12, { align: "center" });
    doc.setFontSize(12);
    doc.text("LAPORAN PENGELUARAN", 148, 18, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const formatTanggalID = (tgl) => {
      const d = new Date(tgl);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    };

    let periodeText = "";
    if (filterType === "Harian")
      periodeText = `Tanggal: ${formatTanggalID(tanggal)}`;
    else if (filterType === "Bulanan")
      periodeText = `Periode Bulan: ${formatTanggalID(bulan + "-01")}`;
    else if (filterType === "Periode")
      periodeText = `Periode: ${formatTanggalID(
        periodeMulai
      )} s.d. ${formatTanggalID(periodeAkhir)}`;

    doc.text(periodeText, 148, 24, { align: "center" });

    // === HEADER TABEL ===
    const headers = [
      [
        "No",
        "Tanggal",
        "Store",
        "Kategori",
        "Keterangan",
        "Jumlah Pengeluaran",
      ],
    ];

    // === ISI DATA ===
    const rows = data.map((d, i) => [
      i + 1,
      formatTanggalID(d.tanggal),
      d.store,
      d.kategori,
      d.keterangan || "-",
      `Rp ${Number(d.jumlah || 0).toLocaleString("id-ID")}`,
    ]);

    // === TOTAL ===
    const totalJumlah = data.reduce((sum, d) => sum + (d.jumlah || 0), 0);

    // Baris total (merge kolom 1–5)
    rows.push([
      {
        content: "Total Pengeluaran",
        colSpan: 5,
        styles: { halign: "left", fontStyle: "bold" },
      },
      {
        content: `Rp ${totalJumlah.toLocaleString("id-ID")}`,
        styles: { halign: "right", fontStyle: "bold" },
      },
    ]);

    // === CETAK TABEL ===
    autoTable(doc, {
      startY: 30,
      head: headers,
      body: rows,
      theme: "grid",
      tableWidth: "auto",
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        halign: "center",
      }, // merah
      bodyStyles: { halign: "center", textColor: [0, 0, 0] },
      columnStyles: {
        0: { cellWidth: "wrap" },
        1: { cellWidth: "wrap" },
        2: { cellWidth: "wrap" },
        3: { cellWidth: "wrap" },
        4: { cellWidth: "wrap" },
        5: { cellWidth: "wrap", halign: "right" },
      },
    });

    // === FOOTER ===
    const now = new Date();
    doc.setFontSize(9);
    doc.text(
      `Dicetak pada: ${now.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      285,
      200,
      { align: "right" }
    );

    doc.save(
      `Laporan_Pengeluaran_${new Date().toISOString().slice(0, 10)}.pdf`
    );
  };

  // === KOLOM UNTUK TABEL WEB ===
  const columns = [
    { key: "no", label: "#" },
    { key: "tanggal", label: "Tanggal" },
    { key: "store", label: "Store" },
    { key: "kategori", label: "Kategori Pengeluaran" },
    { key: "keterangan", label: "Keterangan" },
    { key: "jumlah", label: "Jumlah Pengeluaran" },
  ];

  return (
    <MainLayout current="laporan">
      {(searchTerm) => {
        // 🔍 Filter data berdasarkan search bar
        const filteredData = useMemo(() => {
          if (!searchTerm) return data;
          const lower = searchTerm.toLowerCase();
          return data.filter(
            (d) =>
              d.store.toLowerCase().includes(lower) ||
              d.kategori.toLowerCase().includes(lower) ||
              d.keterangan.toLowerCase().includes(lower) ||
              d.tanggal.toLowerCase().includes(lower) ||
              String(d.jumlah).includes(lower)
          );
        }, [searchTerm, data]);

        // 🧾 Siapkan data untuk tabel
        const tableData = useMemo(
          () =>
            filteredData.map((d, i) => ({
              no: i + 1,
              tanggal: formatTanggal(d.tanggal),
              store: d.store,
              kategori: (
                <span className="capitalize text-slate-700">{d.kategori}</span>
              ),
              keterangan: d.keterangan || "-",
              jumlah: (
                <span className="text-red-600 font-medium">
                  {formatRupiah(d.jumlah)}
                </span>
              ),
            })),
          [filteredData]
        );

        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8 transition-all duration-300">
            {/* === Header === */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  Laporan Pengeluaran
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Rekap seluruh biaya operasional, pembelian barang, dan
                  pengeluaran kas lainnya.
                </p>
              </div>

              <button
                onClick={handlePrintPDF}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
              >
                <FileText size={16} />
                Cetak PDF
              </button>
            </div>

            {/* === Filter Bar === */}
            <div className="flex flex-wrap items-center gap-4 bg-white border border-gray-100 rounded-xl p-4">
              {/* Jenis Filter */}
              <div className="flex items-center gap-2">
                <label className="text-gray-600 font-medium text-sm">
                  Jenis:
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  <option value="Harian">Harian</option>
                  <option value="Bulanan">Bulanan</option>
                  <option value="Periode">Periode</option>
                </select>
              </div>

              {/* Filter Store */}
              <div className="flex items-center gap-2">
                <label className="text-gray-600 font-medium text-sm">
                  Store:
                </label>
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  disabled={loadingStore}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  <option value="Semua">Semua Store</option>
                  {storeData.map((s) => (
                    <option key={s.id_store} value={s.id_store}>
                      {s.nama_store}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Kategori Pengeluaran */}
              <div className="flex items-center gap-2">
                <label className="text-gray-600 font-medium text-sm">
                  Kategori:
                </label>
                <select
                  value={kategoriPengeluaran}
                  onChange={(e) => setKategoriPengeluaran(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  <option value="Semua">Semua</option>
                  <option value="operasional">Operasional</option>
                  <option value="pembelian">Pembelian</option>
                  <option value="gaji">Gaji / Komisi</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

              {/* Filter Waktu */}
              {filterType === "Harian" && (
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              )}

              {filterType === "Bulanan" && (
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
                  <input
                    type="month"
                    value={bulan}
                    onChange={(e) => setBulan(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              )}

              {filterType === "Periode" && (
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
                  <input
                    type="date"
                    value={periodeMulai}
                    onChange={(e) => setPeriodeMulai(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                  <span className="text-gray-500 text-sm">sampai</span>
                  <Calendar size={16} className="text-gray-500" />
                  <input
                    type="date"
                    value={periodeAkhir}
                    onChange={(e) => setPeriodeAkhir(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* === Tabel === */}
            {loading ? (
              <p className="text-gray-500 italic">
                Memuat laporan pengeluaran...
              </p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : tableData.length === 0 ? (
              <p className="text-gray-500 italic">
                Tidak ada data pengeluaran.
              </p>
            ) : (
              <TableData columns={columns} data={tableData} />
            )}
          </div>
        );
      }}
    </MainLayout>
  );
}
