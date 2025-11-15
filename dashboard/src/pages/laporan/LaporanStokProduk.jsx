import { useState, useEffect, useMemo } from "react";
import MainLayout from "../../layouts/MainLayout";
import TableData from "../../components/TableData";
import { FileText, Store, Calendar } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import formatRupiah from "../../utils/formatRupiah";
import { formatTanggal, formatPeriode } from "../../utils/dateFormatter";
import { formatKodeProduk } from "../../utils/formatProduk";
import useFetchStore from "../../hooks/useFetchStore";

export default function LaporanStokProduk() {
  const [data, setData] = useState([]);
  const [selectedStore, setSelectedStore] = useState("Semua");
  const [filterType, setFilterType] = useState("Harian");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7));
  const [periodeMulai, setPeriodeMulai] = useState("");
  const [periodeAkhir, setPeriodeAkhir] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const { data: storeData, loading: loadingStore } = useFetchStore();

  // ===============================
  // FETCH DATA
  // ===============================
  const fetchData = async () => {
    try {
      setLoading(true);

      let url = `${API_URL}/laporan/stok-produk?`;

      if (selectedStore !== "Semua") url += `store=${selectedStore}&`;
      if (filterType === "Harian") url += `filter=hari&tanggal=${tanggal}`;
      else if (filterType === "Bulanan") url += `filter=bulan&bulan=${bulan}`;
      else if (filterType === "Periode" && periodeMulai && periodeAkhir)
        url += `filter=periode&startDate=${periodeMulai}&endDate=${periodeAkhir}`;

      const res = await fetch(url);
      const json = await res.json();
      if (json.success) setData(json.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedStore, filterType, tanggal, bulan, periodeMulai, periodeAkhir]);

  // ===============================
  // TABLE DATA
  // ===============================
  const tableData = useMemo(
    () =>
      data.map((d, i) => ({
        no: i + 1,
        store: d.store,
        tanggal: formatTanggal(d.tanggal),
        kode_produk: formatKodeProduk(d.id_produk),
        nama_produk: d.nama_produk,
        stok_awal: d.produk_tersedia, // jumlah_stok
        terjual: d.terjual,
        stok_sisa: d.sisa_produk, // stok_akhir
        _search: `${d.store} ${d.nama_produk}`.toLowerCase(),
      })),
    [data]
  );

  const filterSearch = (s) =>
    tableData.filter((d) => d._search.includes(s.toLowerCase()));

  // ===============================
  // PDF EXPORT
  // ===============================
  const handlePrintPDF = () => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // === LOGO (sesuai contoh) ===
  const logo = new Image();
  logo.src = "/Logo.png";
  doc.addImage(logo, "PNG", 80, 6, 22, 22);

  // === HEADER ===
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("LE MUANI BARBERSHOP", pageWidth / 2, 12, { align: "center" });

  doc.setFontSize(12);
  doc.text("LAPORAN STOK PRODUK", pageWidth / 2, 18, { align: "center" });

  // === Format Tanggal Indonesia ===
  const formatTanggalID = (tgl) => {
    const d = new Date(tgl);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // === Periode Text ===
  let periodeText = "";
  if (filterType === "Harian") {
    periodeText = `Tanggal: ${formatTanggalID(tanggal)}`;
  } else if (filterType === "Bulanan") {
    periodeText = `Periode Bulan: ${formatPeriode(bulan)}`;
  } else if (filterType === "Periode") {
    periodeText = `Periode: ${formatTanggalID(
      periodeMulai
    )} s.d. ${formatTanggalID(periodeAkhir)}`;
  } else {
    periodeText = "Semua Data Stok Produk";
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(periodeText, pageWidth / 2, 24, { align: "center" });

  // === TABLE HEADERS ===
  const headers = [
    [
      "No",
      "Cabang",
      "Tanggal Update",
      "Kode Produk",
      "Nama Produk",
      "Stok Produk",
      "Produk Terjual",
      "Sisa Produk",
    ],
  ];

  // === TABLE ROWS ===
  const rows = data.map((d, i) => [
    i + 1,
    d.store,
    formatTanggal(d.tanggal),
    formatKodeProduk(d.id_produk),
    d.nama_produk,
    d.produk_tersedia, // stok awal
    d.terjual,
    d.sisa_produk,
  ]);

  // === TOTAL (opsional, seperti contoh PDF lain punya total) ===
  const totalSisa = data.reduce((sum, d) => sum + (d.sisa_produk || 0), 0);

  rows.push([
    {
      content: "Total",
      colSpan: 7,
      styles: { halign: "right", fontStyle: "bold" },
    },
    {
      content: totalSisa.toLocaleString("id-ID"),
      styles: { halign: "center", fontStyle: "bold" },
    },
  ]);

  // === TABEL ===
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
    },
    bodyStyles: { halign: "center", textColor: [0, 0, 0] },
    margin: { left: 15, right: 15 },
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
    pageWidth - 15,
    200,
    { align: "right" }
  );

  doc.save(
    `Laporan_Stok_Produk_${new Date().toISOString().slice(0, 10)}.pdf`
  );
};

  // ===============================
  // COLUMNS
  // ===============================
  const columns = [
    { key: "no", label: "#" },
    { key: "store", label: "Cabang" },
    { key: "tanggal", label: "Tanggal Update" },
    { key: "kode_produk", label: "Kode Produk" },
    { key: "nama_produk", label: "Nama Produk" },
    { key: "stok_awal", label: "Stok Produk" },
    { key: "terjual", label: "Produk Terjual" },
    { key: "stok_sisa", label: "Sisa Produk" },
  ];

  // ===============================
  // RETURN UI
  // ===============================
  return (
    <MainLayout current="laporan">
      {(searchTerm) => {
        const filtered = filterSearch(searchTerm);

        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  Laporan Stok Produk
                </h1>
                <p className="text-sm text-gray-500">
                  Rekap seluruh stok produk per cabang.
                </p>
              </div>

              <button
                onClick={handlePrintPDF}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm"
              >
                <FileText size={16} />
                Cetak PDF
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-4 bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <label className="text-gray-600 text-sm">Jenis:</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                >
                  <option value="Harian">Harian</option>
                  <option value="Bulanan">Bulanan</option>
                  <option value="Periode">Periode</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Store size={16} className="text-gray-500" />
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  disabled={loadingStore}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                >
                  <option value="Semua">Semua Cabang</option>
                  {storeData.map((s) => (
                    <option key={s.id_store} value={s.id_store}>
                      {s.nama_store}
                    </option>
                  ))}
                </select>
              </div>

              {filterType === "Harian" && (
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
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
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
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
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  />
                  <span className="text-gray-500 text-sm">sampai</span>
                  <Calendar size={16} className="text-gray-500" />
                  <input
                    type="date"
                    value={periodeAkhir}
                    onChange={(e) => setPeriodeAkhir(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  />
                </div>
              )}
            </div>

            {loading ? (
              <p className="text-gray-500 italic">Memuat data...</p>
            ) : filtered.length === 0 ? (
              <p className="text-gray-500 italic">Tidak ada data.</p>
            ) : (
              <TableData columns={columns} data={filtered} />
            )}
          </div>
        );
      }}
    </MainLayout>
  );
}
