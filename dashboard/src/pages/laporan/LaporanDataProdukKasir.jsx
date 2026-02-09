import { useState, useEffect, useMemo } from "react";
import MainLayout from "../../layouts/MainLayout";
import TableData from "../../components/TableData";
import { FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import formatRupiah from "../../utils/formatRupiah";
import { formatPeriode } from "../../utils/dateFormatter";
import { formatKodeProduk } from "../../utils/formatProduk";
import useProfil from "../../hooks/useProfil";
import BackButton from "../../components/BackButton";

export default function LaporanDataProdukKasir() {
  const [data, setData] = useState([]);
  const [filterType] = useState("Bulanan");
  const [tanggal] = useState(new Date().toISOString().split("T")[0]);
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7));
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

  // ======================================================
  // FETCH DATA
  // ======================================================
  const fetchData = async () => {
    try {
      setLoading(true);

      let url = `${API_URL}/laporan/produk-kasir?id_store=${id_store}&`;

      if (filterType === "Bulanan") url += `filter=bulan&bulan=${bulan}`;

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

        if (!json.data || json.data.length === 0) {
          setError("Tidak ada data ditemukan untuk filter ini.");
        }
      } else {
        setError("Gagal memuat data laporan.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterType, tanggal, bulan]);

  // ======================================================
  // FORMAT TABLE
  // ======================================================
  const tableData = useMemo(
    () =>
      data.map((d, i) => ({
        no: i + 1,
        kode_produk: formatKodeProduk(d.id_produk),
        nama_produk: d.nama_produk,
        satuan: "pcs",
        harga_awal: formatRupiah(d.harga_awal),
        harga_jual: formatRupiah(d.harga_jual),
        jumlah: d.jumlah_stok,
        _search: `${d.nama_produk}`.toLowerCase(),
      })),
    [data],
  );

  const filterSearch = (s) =>
    tableData.filter((d) => d._search.includes(s.toLowerCase()));

  // ======================================================
  // PRINT PDF — SAME STYLE AS LaporanPengeluaranKasir.jsx
  // ======================================================
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
    doc.text("LAPORAN DATA PRODUK CABANG", pageWidth / 2, 18, {
      align: "center",
    });

    doc.setFontSize(11);
    doc.text(`${storeName}`, pageWidth / 2, 23, { align: "center" });

    // PERIODE
    let periodeText = "";
    if (filterType === "Bulanan") {
      periodeText = `Periode Bulan: ${formatPeriode(bulan)}`;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(periodeText, pageWidth / 2, 28, { align: "center" });

    // TABLE
    const headers = [
      [
        "No",
        "Kode Produk",
        "Nama Produk",
        "Satuan",
        "Harga Pokok",
        "Harga Jual",
        "Jumlah Stok",
      ],
    ];

    const rows = data.map((d, i) => [
      i + 1,
      formatKodeProduk(d.id_produk),
      d.nama_produk,
      "pcs",
      `Rp ${Number(d.harga_awal).toLocaleString("id-ID")}`,
      `Rp ${Number(d.harga_jual).toLocaleString("id-ID")}`,
      d.jumlah_stok,
    ]);

    const totalStok = data.reduce((sum, d) => sum + (d.jumlah_stok || 0), 0);

    rows.push([
      {
        content: "Total",
        colSpan: 6,
        styles: { halign: "right", fontStyle: "bold" },
      },
      {
        content: totalStok.toLocaleString("id-ID"),
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
        fillColor: [37, 99, 235], // Biru sama seperti laporan kasir
        textColor: 255,
        halign: "center",
      },
      bodyStyles: { halign: "center", textColor: [0, 0, 0] },
      margin: { left: 15, right: 15 },
    });

    // TANDA TANGAN
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

    // ruang tanda tangan
    ttdY += 25;

    doc.text(kasirName, ttdX, ttdY);

    doc.save(
      `Laporan_Produk_Kasir_${new Date().toISOString().slice(0, 10)}.pdf`,
    );
  };

  // ======================================================
  // TABLE COLUMNS
  // ======================================================
  const columns = [
    { key: "no", label: "#" },
    { key: "kode_produk", label: "Kode Produk" },
    { key: "nama_produk", label: "Nama Produk" },
    { key: "satuan", label: "Satuan" },
    { key: "harga_awal", label: "Harga Pokok" },
    { key: "harga_jual", label: "Harga Jual" },
    { key: "jumlah", label: "Jumlah Stok" },
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
                  Laporan Data Produk Cabang — <span>{storeName}</span>
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Rekap stok & data produk cabang Anda.
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
              {filterType === "Bulanan" && (
                <div className="flex items-center gap-2">
                  Bulan:
                  <input
                    type="month"
                    value={bulan}
                    onChange={(e) => setBulan(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* TABLE */}
            {loading ? (
              <p className="text-gray-500 italic">Memuat data produk...</p>
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
