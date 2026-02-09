import { useState, useEffect, useMemo } from "react";
import MainLayout from "../../layouts/MainLayout";
import TableData from "../../components/TableData";
import { FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatTanggal, formatPeriode } from "../../utils/dateFormatter";
import { formatKodeProduk } from "../../utils/formatProduk";
import useFetchStore from "../../hooks/useFetchStore";
import formatRupiah from "../../utils/formatRupiah";
import useProfil from "../../hooks/useProfil";
import BackButton from "../../components/BackButton";
import useNamaOwner from "../../hooks/useNamaOwner";

export default function LaporanPendapatanProduk() {
  const [data, setData] = useState([]);
  const [selectedStore, setSelectedStore] = useState("Semua");
  const [filterType, setFilterType] = useState("Harian");

  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7));
  const [periodeMulai, setPeriodeMulai] = useState("");
  const [periodeAkhir, setPeriodeAkhir] = useState("");

  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const { data: storeData, loading: loadingStore } = useFetchStore();
  const { profil } = useProfil();
  const { namaOwner, loading: loadingOwner } = useNamaOwner();

  let logoSrc = profil?.logo_url || "/Logo1.png";
  if (!logoSrc.includes("localhost") && !logoSrc.includes("127.0.0.1")) {
    logoSrc = logoSrc.replace("http://", "https://");
  }

  // ===============================
  // FETCH DATA
  // ===============================
  const fetchData = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/laporan/pendapatan-produk?`;

      if (selectedStore !== "Semua") url += `store=${selectedStore}&`;

      if (filterType === "Harian") url += `filter=hari&tanggal=${tanggal}`;
      else if (filterType === "Bulanan") url += `filter=bulan&bulan=${bulan}`;
      else if (filterType === "Periode")
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
  // TABLE DATA (PERBAIKAN DI SINI)
  // ===============================
  const tableData = useMemo(
    () =>
      data.map((d, i) => ({
        no: i + 1,
        store: d.store,
        tanggal: formatTanggal(d.tanggal_transaksi),
        kode_produk: formatKodeProduk(d.id_produk),
        nama_produk: d.nama_produk,

        stok_awal: d.stok_awal,
        terjual: d.terjual,
        stok_sisa: d.stok_sisa,

        pendapatan_raw: Number(d.pendapatan || 0), // angka asli
        pendapatan: formatRupiah(d.pendapatan), // tampilan

        _search: `${d.store} ${d.nama_produk}`.toLowerCase(),
      })),
    [data],
  );

  const filterSearch = (s) =>
    tableData.filter((d) => d._search.includes(s.toLowerCase()));

  // ===============================
  // PRINT PDF (PERBAIKAN TOTAL)
  // ===============================
  const handlePrintPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // === LOGO ===
    const logo = new Image();
    logo.src = logoSrc;
    doc.addImage(logo, "PNG", 80, 6, 22, 22);

    // === HEADER ===
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(profil?.nama_barbershop || "-", pageWidth / 2, 12, {
      align: "center",
    });

    doc.setFontSize(12);
    doc.text("LAPORAN PENDAPATAN PRODUK", pageWidth / 2, 18, {
      align: "center",
    });

    // === FORMAT TANGGAL INDONESIA ===
    const formatTanggalID = (tgl) => {
      const d = new Date(tgl);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    };

    // === PERIODE ===
    let periodeText = "";
    if (filterType === "Harian") {
      periodeText = `Tanggal: ${formatTanggalID(tanggal)}`;
    } else if (filterType === "Bulanan") {
      periodeText = `Periode Bulan: ${formatPeriode(bulan)}`;
    } else if (filterType === "Periode") {
      periodeText = `Periode: ${formatTanggalID(
        periodeMulai,
      )} s.d. ${formatTanggalID(periodeAkhir)}`;
    } else {
      periodeText = "Semua Data Pendapatan Produk";
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(periodeText, pageWidth / 2, 24, { align: "center" });

    // === TABLE HEADER ===
    const headers = [
      [
        "No",
        "Cabang",
        "Tanggal",
        "Kode Produk",
        "Nama Produk",
        "Stok Awal",
        "Produk Terjual",
        "Sisa Produk",
        "Pendapatan",
      ],
    ];

    // === TABLE ROWS ===
    const rows = tableData.map((d) => [
      d.no,
      d.store,
      d.tanggal,
      d.kode_produk,
      d.nama_produk,
      d.stok_awal,
      d.terjual,
      d.stok_sisa,
      d.pendapatan,
    ]);

    // === TOTAL ===
    const totalPendapatan = tableData.reduce(
      (sum, d) => sum + d.pendapatan_raw,
      0,
    );

    rows.push([
      {
        content: "Total Pendapatan",
        colSpan: 8,
        styles: { halign: "right", fontStyle: "bold" },
      },
      {
        content: formatRupiah(totalPendapatan),
        styles: { halign: "center", fontStyle: "bold" },
      },
    ]);

    // === DRAW TABLE ===
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

    // ===========================
    // BLOK TANDA TANGAN
    // ===========================
    const now = new Date();
    const tanggalID = now.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const pageHeight = doc.internal.pageSize.getHeight();

    let ttdY = doc.lastAutoTable.finalY + 12;
    const ttdX = pageWidth - 80;

    // Cek overflow halaman
    if (ttdY + 40 > pageHeight) {
      doc.addPage();
      ttdY = 20;
    }

    doc.setFontSize(11);

    doc.text(`Bandar Lampung, ${tanggalID}`, ttdX, ttdY);
    ttdY += 7;
    doc.text("Owner,", ttdX, ttdY);

    // ruang tanda tangan
    ttdY += 25;

    doc.text(loadingOwner ? "-" : namaOwner, ttdX, ttdY);

    // === SAVE ===
    doc.save(
      `Laporan_Pendapatan_Produk_${new Date().toISOString().slice(0, 10)}.pdf`,
    );
  };

  // ===============================
  // TABLE COLUMNS
  // ===============================
  const columns = [
    { key: "no", label: "#" },
    { key: "store", label: "Cabang" },
    { key: "tanggal", label: "Tanggal" },
    { key: "kode_produk", label: "Kode Produk" },
    { key: "nama_produk", label: "Nama Produk" },
    { key: "stok_awal", label: "Stok Awal" },
    { key: "terjual", label: "Terjual" },
    { key: "stok_sisa", label: "Sisa Produk" },
    { key: "pendapatan", label: "Pendapatan" },
  ];

  // ===============================
  // UI RETURN
  // ===============================
  return (
    <MainLayout current="laporan">
      {(searchTerm) => {
        const filtered = filterSearch(searchTerm);

        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">
            <BackButton to="/laporan" />
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  Laporan Pendapatan Produk
                </h1>
                <p className="text-sm text-gray-500">
                  Rekap pendapatan produk berdasarkan transaksi.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-start sm:justify-end">
                <button
                  onClick={handlePrintPDF}
                  className="flex items-center gap-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm"
                >
                  <FileText size={16} />
                  Cetak PDF
                </button>
              </div>
            </div>

            {/* FILTER BAR */}
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
                <label className="text-gray-600 text-sm">Cabang:</label>
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

              {/* FILTER HARIAN */}
              {filterType === "Harian" && (
                <div className="flex items-center gap-2">
                  <label className="text-gray-600 text-sm">Tanggal:</label>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  />
                </div>
              )}

              {/* FILTER BULANAN */}
              {filterType === "Bulanan" && (
                <div className="flex items-center gap-2">
                  <label className="text-gray-600 text-sm">Bulan:</label>
                  <input
                    type="month"
                    value={bulan}
                    onChange={(e) => setBulan(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  />
                </div>
              )}

              {/* FILTER PERIODE */}
              {filterType === "Periode" && (
                <div className="flex items-center gap-2">
                  <label className="text-gray-600 text-sm">Tanggal:</label>
                  <input
                    type="date"
                    value={periodeMulai}
                    onChange={(e) => setPeriodeMulai(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  />
                  <span className="text-gray-500 text-sm">sampai</span>
                  <label className="text-gray-600 text-sm">Tanggal:</label>
                  <input
                    type="date"
                    value={periodeAkhir}
                    onChange={(e) => setPeriodeAkhir(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  />
                </div>
              )}
            </div>

            {/* TABLE RESULT */}
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
