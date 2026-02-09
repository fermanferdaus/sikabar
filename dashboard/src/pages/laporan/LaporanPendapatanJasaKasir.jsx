import { useState, useEffect, useMemo } from "react";
import MainLayout from "../../layouts/MainLayout";
import TableData from "../../components/TableData";
import { FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import formatRupiah from "../../utils/formatRupiah";
import { formatPeriode, formatTanggal } from "../../utils/dateFormatter";
import useProfil from "../../hooks/useProfil";
import BackButton from "../../components/BackButton";

export default function LaporanPendapatanJasaKasir() {
  const [data, setData] = useState([]);
  const [filterType, setFilterType] = useState("Harian");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7));
  const [periodeMulai, setPeriodeMulai] = useState("");
  const [periodeAkhir, setPeriodeAkhir] = useState("");
  const [storeName, setStoreName] = useState(
    localStorage.getItem("nama_store") || "-",
  );
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const id_store = localStorage.getItem("id_store");
  const { profil } = useProfil();
  let logoSrc = profil?.logo_url || "/Logo1.png";
  if (!logoSrc.includes("localhost") && !logoSrc.includes("127.0.0.1")) {
    logoSrc = logoSrc.replace("http://", "https://");
  }

  // ======================================================
  // FETCH DATA
  // ======================================================
  const fetchData = async () => {
    try {
      setLoading(true);

      let url = `${API_URL}/laporan/pendapatan-jasa-kasir?id_store=${id_store}&`;

      if (filterType === "Harian") url += `filter=hari&tanggal=${tanggal}`;
      else if (filterType === "Bulanan") url += `filter=bulan&bulan=${bulan}`;
      else if (filterType === "Periode")
        url += `filter=periode&startDate=${periodeMulai}&endDate=${periodeAkhir}`;

      const res = await fetch(url);
      const json = await res.json();

      if (json.success) {
        setData(json.data || []);
        setStoreName(json.store || localStorage.getItem("nama_store"));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterType, tanggal, bulan, periodeMulai, periodeAkhir]);

  // ======================================================
  // TABLE DATA
  // ======================================================
  const tableData = useMemo(
    () =>
      data.map((d, i) => ({
        no: i + 1,
        tanggal: formatTanggal(d.tanggal),
        no_faktur: d.no_faktur,
        layanan: d.layanan,
        harga: formatRupiah(d.harga),
        laba: formatRupiah(d.laba),
        _search: `${d.layanan} ${d.no_faktur}`.toLowerCase(),
      })),
    [data],
  );

  const filterSearch = (v) =>
    tableData.filter((d) => d._search.includes(v.toLowerCase()));

  // ======================================================
  // PRINT PDF
  // ======================================================
  const handlePrintPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const kasirName = localStorage.getItem("nama_user");

    const tglID = (tgl) =>
      new Date(tgl).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

    // LOGO (persis style laporan sebelumnya)
    const logo = new Image();
    logo.src = logoSrc;
    doc.addImage(logo, "PNG", 80, 6, 22, 22);

    // ============================
    // HEADER
    // ============================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0); // tulisan hitam
    doc.text(profil?.nama_barbershop, pageWidth / 2, 12, { align: "center" });

    doc.setFontSize(12);
    doc.text("LAPORAN PENDAPATAN JASA CABANG", pageWidth / 2, 18, {
      align: "center",
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(storeName, pageWidth / 2, 23, { align: "center" });

    // ============================
    // PERIODE (style sama persis)
    // ============================
    let periodeText = "";
    if (filterType === "Harian") periodeText = `Tanggal: ${tglID(tanggal)}`;
    else if (filterType === "Bulanan")
      periodeText = `Periode Bulan: ${formatPeriode(bulan)}`;
    else
      periodeText = `Periode: ${tglID(periodeMulai)} s.d. ${tglID(
        periodeAkhir,
      )}`;

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(periodeText, pageWidth / 2, 28, { align: "center" });

    // ============================
    // TABLE
    // ============================
    const headers = [
      ["No", "Tanggal", "No Faktur", "Layanan", "Harga", "Pendapatan"],
    ];

    const rows = data.map((d, i) => [
      i + 1,
      tglID(d.tanggal),
      d.no_faktur,
      d.layanan,
      `Rp ${Number(d.harga).toLocaleString("id-ID")}`,
      `Rp ${Number(d.laba).toLocaleString("id-ID")}`,
    ]);

    const totalLaba = data.reduce((a, b) => a + Number(b.laba), 0);

    rows.push([
      {
        content: "Total Pendapatan",
        colSpan: 5,
        styles: { halign: "right", fontStyle: "bold", textColor: [0, 0, 0] },
      },
      {
        content: `Rp ${totalLaba.toLocaleString("id-ID")}`,
        styles: { halign: "center", fontStyle: "bold", textColor: [0, 0, 0] },
      },
    ]);

    autoTable(doc, {
      startY: 34,
      head: headers,
      body: rows,
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: [0, 0, 0], // agar default hitam seperti laporan lain
      },
      headStyles: {
        fillColor: [37, 99, 235], // biru sama
        textColor: 255, // putih
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        halign: "center",
        textColor: [0, 0, 0],
      },
      margin: { left: 15, right: 15 },
    });

    // ============================
    // TANDA TANGAN
    // ============================
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
    doc.text("Kasir,", ttdX, ttdY);

    doc.text(kasirName, ttdX, ttdY + 32);

    doc.save(
      `Laporan_Pendapatan_Jasa_Kasir_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`,
    );
  };

  // ======================================================
  // TABLE COLUMNS
  // ======================================================
  const columns = [
    { key: "no", label: "#" },
    { key: "tanggal", label: "Tanggal" },
    { key: "no_faktur", label: "No Faktur" },
    { key: "layanan", label: "Layanan" },
    { key: "harga", label: "Harga" },
    { key: "laba", label: "Pendapatan" },
  ];

  return (
    <MainLayout current="laporan">
      {(searchTerm) => {
        const filtered = filterSearch(searchTerm);

        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">
            <BackButton to="/laporan/kasir" />
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  Laporan Pendapatan Jasa — <span>{storeName}</span>
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Rekap pendapatan jasa berdasarkan transaksi.
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

            {/* FILTER */}
            <div className="flex flex-wrap items-center gap-4 border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 font-medium">
                  Jenis:
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Harian">Harian</option>
                  <option value="Bulanan">Bulanan</option>
                  <option value="Periode">Periode</option>
                </select>
              </div>

              {filterType === "Harian" && (
                <div className="flex items-center gap-2">
                  <label className="text-gray-600 text-sm">Tanggal:</label>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}

              {filterType === "Bulanan" && (
                <div className="flex items-center gap-2">
                  <label className="text-gray-600 text-sm">Bulan:</label>
                  <input
                    type="month"
                    value={bulan}
                    onChange={(e) => setBulan(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}

              {filterType === "Periode" && (
                <div className="flex items-center gap-2">
                  <label className="text-gray-600 text-sm">Tanggal:</label>
                  <input
                    type="date"
                    value={periodeMulai}
                    onChange={(e) => setPeriodeMulai(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-gray-500 text-sm">sampai</span>
                  <label className="text-gray-600 text-sm">Tanggal:</label>
                  <input
                    type="date"
                    value={periodeAkhir}
                    onChange={(e) => setPeriodeAkhir(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* TABLE */}
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
