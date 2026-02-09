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

export default function LaporanPenjualanProdukKasir() {
  const [data, setData] = useState([]);
  const [filterType, setFilterType] = useState("Harian");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7));
  const [periodeMulai, setPeriodeMulai] = useState("");
  const [periodeAkhir, setPeriodeAkhir] = useState("");
  const [loading, setLoading] = useState(false);
  const [storeName, setStoreName] = useState(
    localStorage.getItem("nama_store") || "-",
  );

  const API_URL = import.meta.env.VITE_API_URL;
  const id_store = localStorage.getItem("id_store");
  const { profil } = useProfil();
  let logoSrc = profil?.logo_url || "/Logo1.png";
  if (!logoSrc.includes("localhost") && !logoSrc.includes("127.0.0.1")) {
    logoSrc = logoSrc.replace("http://", "https://");
  }

  // ================================
  // FETCH DATA
  // ================================
  const fetchData = async () => {
    try {
      setLoading(true);

      let url = `${API_URL}/laporan/penjualan-produk-kasir?id_store=${id_store}&`;

      if (filterType === "Harian") url += `filter=hari&tanggal=${tanggal}`;
      else if (filterType === "Bulanan") url += `filter=bulan&bulan=${bulan}`;
      else if (filterType === "Periode")
        url += `filter=periode&startDate=${periodeMulai}&endDate=${periodeAkhir}`;

      const res = await fetch(url);
      const json = await res.json();

      if (json.success) {
        setData(json.data || []);
        setStoreName(
          json.store ||
            json.data?.[0]?.store ||
            localStorage.getItem("nama_store") ||
            "-",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterType, tanggal, bulan, periodeMulai, periodeAkhir]);

  // ================================
  // FORMAT TABEL
  // ================================
  const tableData = useMemo(
    () =>
      data.map((d, i) => ({
        no: i + 1,
        tanggal: formatTanggal(d.tanggal),
        faktur: d.nomor_struk,
        produk: d.nama_produk,
        jumlah: d.jumlah,
        harga_satuan: formatRupiah(d.harga_satuan),
        total: formatRupiah(d.total),
        _search: `${d.nama_produk} ${d.nomor_struk}`.toLowerCase(),
      })),
    [data],
  );

  const filterSearch = (s) =>
    tableData.filter((d) => d._search.includes(s.toLowerCase()));

  // ================================
  // PRINT PDF (STYLE SAMA SEMUA LAPORAN KASIR)
  // ================================
  const handlePrintPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const kasirName = localStorage.getItem("nama_user") || "-";

    // LOGO
    const logo = new Image();
    logo.src = logoSrc;
    doc.addImage(logo, "PNG", 80, 6, 22, 22);

    // HEADER
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(profil?.nama_barbershop, pageWidth / 2, 12, { align: "center" });

    doc.setFontSize(12);
    doc.text("LAPORAN PENJUALAN PRODUK CABANG", pageWidth / 2, 18, {
      align: "center",
    });

    doc.setFontSize(11);
    doc.text(storeName, pageWidth / 2, 23, { align: "center" });

    const tglID = (tgl) =>
      new Date(tgl).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

    let periodeText = "";
    if (filterType === "Harian") periodeText = `Tanggal: ${tglID(tanggal)}`;
    else if (filterType === "Bulanan")
      periodeText = `Periode Bulan: ${formatPeriode(bulan)}`;
    else
      periodeText = `Periode: ${tglID(periodeMulai)} s.d. ${tglID(
        periodeAkhir,
      )}`;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(periodeText, pageWidth / 2, 28, { align: "center" });

    // TABEL
    const headers = [
      [
        "No",
        "Tanggal",
        "No Faktur",
        "Nama Produk",
        "Jumlah",
        "Harga Satuan",
        "Total",
      ],
    ];

    const rows = data.map((d, i) => [
      i + 1,
      tglID(d.tanggal),
      d.nomor_struk,
      d.nama_produk,
      d.jumlah,
      `Rp ${Number(d.harga_satuan).toLocaleString("id-ID")}`,
      `Rp ${Number(d.total).toLocaleString("id-ID")}`,
    ]);

    const totalSemua = data.reduce((sum, d) => sum + Number(d.total), 0);

    rows.push([
      {
        content: "Total Pendapatan Produk",
        colSpan: 6,
        styles: { halign: "right", fontStyle: "bold" },
      },
      {
        content: `Rp ${totalSemua.toLocaleString("id-ID")}`,
        styles: { halign: "center", fontStyle: "bold" },
      },
    ]);

    autoTable(doc, {
      startY: 34,
      head: headers,
      body: rows,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        halign: "center",
      },
      bodyStyles: { halign: "center", textColor: [0, 0, 0] },
      margin: { left: 15, right: 15 },
    });

    // TANDA TANGAN
    const nowID = new Date().toLocaleDateString("id-ID", {
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

    doc.text(`Bandar Lampung, ${nowID}`, ttdX, ttdY);
    ttdY += 7;
    doc.text("Kasir,", ttdX, ttdY);

    // ruang tanda tangan
    ttdY += 25;

    doc.text(kasirName, ttdX, ttdY);

    doc.save(
      `Laporan_Penjualan_Produk_${new Date().toISOString().slice(0, 10)}.pdf`,
    );
  };

  // ================================
  // TABLE COLUMNS
  // ================================
  const columns = [
    { key: "no", label: "#" },
    { key: "tanggal", label: "Tanggal" },
    { key: "faktur", label: "No Faktur" },
    { key: "produk", label: "Nama Produk" },
    { key: "jumlah", label: "Jumlah" },
    { key: "harga_satuan", label: "Harga Satuan" },
    { key: "total", label: "Total Harga" },
  ];

  return (
    <MainLayout current="laporan">
      {(searchTerm) => {
        const filtered = filterSearch(searchTerm);

        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">
            <BackButton to="/laporan/kasir" />
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  Laporan Penjualan Produk — <span>{storeName}</span>
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Rekap penjualan produk berdasarkan transaksi.
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

            {/* FILTERS */}
            <div className="flex flex-wrap items-center gap-4 bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <label className="text-gray-600 font-medium text-sm">
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

            {/* TABEL */}
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
