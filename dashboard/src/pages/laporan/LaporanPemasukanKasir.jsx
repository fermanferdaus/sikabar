import { useState, useEffect, useMemo } from "react";
import MainLayout from "../../layouts/MainLayout";
import TableData from "../../components/TableData";
import { FileText, Calendar } from "lucide-react";
import formatRupiah from "../../utils/formatRupiah";
import { formatTanggal } from "../../utils/dateFormatter";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function LaporanPemasukanKasir() {
  const [filterType, setFilterType] = useState("Harian");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7));
  const [periodeMulai, setPeriodeMulai] = useState("");
  const [periodeAkhir, setPeriodeAkhir] = useState("");
  const [tipeTransaksi, setTipeTransaksi] = useState("Semua");
  const [data, setData] = useState([]);
  const [storeName, setStoreName] = useState(
    localStorage.getItem("nama_store") || "-"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;
  const idStore = localStorage.getItem("id_store");

  // === FETCH DATA ===
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      let url = `${API_URL}/laporan/pemasukan/kasir?id_store=${idStore}`;

      if (filterType === "Harian") {
        url += `&filter=periode&startDate=${tanggal}&endDate=${tanggal}`;
      } else if (filterType === "Bulanan") {
        const [year, month] = bulan.split("-");
        const startDate = `${year}-${month}-01`;
        const endDate = `${year}-${month}-31`;
        url += `&filter=periode&startDate=${startDate}&endDate=${endDate}`;
      } else if (filterType === "Periode" && periodeMulai && periodeAkhir) {
        url += `&filter=periode&startDate=${periodeMulai}&endDate=${periodeAkhir}`;
      }

      if (tipeTransaksi !== "Semua") url += `&tipe_transaksi=${tipeTransaksi}`;

      const res = await fetch(url);
      const json = await res.json();

      if (json.success) {
        setData(json.data || []);
        // Ambil nama store dari response backend, data pertama, atau localStorage
        setStoreName(
          json.store ||
            json.data[0]?.store ||
            localStorage.getItem("nama_store") ||
            "Admin"
        );

        if (!json.data || json.data.length === 0) {
          setError("Tidak ada data ditemukan untuk filter ini.");
        }
      } else {
        setError("Gagal memuat data laporan.");
      }
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data laporan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterType, tanggal, bulan, periodeMulai, periodeAkhir, tipeTransaksi]);

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
    doc.text("LAPORAN PEMASUKAN KASIR", 148, 18, { align: "center" });
    doc.setFontSize(11);
    doc.text(`${storeName}`, 148, 23, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    // === FORMAT TANGGAL ===
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
    doc.text(periodeText, 148, 28, { align: "center" });

    // === HEADER TABEL ===
    const headers = [
      [
        "No",
        "Tanggal",
        "Tipe Transaksi",
        "Total Layanan",
        "Laba Produk",
        "Komisi Capster",
        "Total Bersih",
      ],
    ];

    // === ISI DATA ===
    const rows = data.map((d, i) => [
      i + 1,
      formatTanggalID(d.tanggal),
      d.tipe_transaksi === "service"
        ? "Layanan"
        : d.tipe_transaksi === "produk"
        ? "Produk"
        : d.tipe_transaksi === "campuran"
        ? "Campuran"
        : d.tipe_transaksi,
      `Rp ${Number(d.total_service || 0).toLocaleString("id-ID")}`,
      `Rp ${Number(d.laba_produk || 0).toLocaleString("id-ID")}`,
      `Rp ${Number(d.komisi_capster || 0).toLocaleString("id-ID")}`,
      `Rp ${Number(d.total_bersih || 0).toLocaleString("id-ID")}`,
    ]);

    // === TOTAL AKHIR ===
    const totalService = data.reduce(
      (sum, d) => sum + (d.total_service || 0),
      0
    );
    const totalLaba = data.reduce((sum, d) => sum + (d.laba_produk || 0), 0);
    const totalKomisi = data.reduce(
      (sum, d) => sum + (d.komisi_capster || 0),
      0
    );
    const totalBersih = data.reduce((sum, d) => sum + (d.total_bersih || 0), 0);

    rows.push([
      {
        content: "Total",
        colSpan: 3,
        styles: { halign: "left", fontStyle: "bold" },
      },
      {
        content: `Rp ${totalService.toLocaleString("id-ID")}`,
        styles: { halign: "right", fontStyle: "bold" },
      },
      {
        content: `Rp ${totalLaba.toLocaleString("id-ID")}`,
        styles: { halign: "right", fontStyle: "bold" },
      },
      {
        content: `Rp ${totalKomisi.toLocaleString("id-ID")}`,
        styles: { halign: "right", fontStyle: "bold" },
      },
      {
        content: `Rp ${totalBersih.toLocaleString("id-ID")}`,
        styles: { halign: "right", fontStyle: "bold" },
      },
    ]);

    // === BARIS TOTAL KESELURUHAN ===
    rows.push([
      {
        content: "Total Pendapatan Bersih",
        colSpan: 6,
        styles: { halign: "left", fontStyle: "bold" },
      },
      {
        content: `Rp ${totalBersih.toLocaleString("id-ID")}`,
        styles: { halign: "right", fontStyle: "bold" },
      },
    ]);

    // === CETAK TABEL ===
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
      columnStyles: {
        0: { cellWidth: "wrap" },
        1: { cellWidth: "wrap" },
        2: { cellWidth: "wrap" },
        3: { cellWidth: "wrap", halign: "right" },
        4: { cellWidth: "wrap", halign: "right" },
        5: { cellWidth: "wrap", halign: "right" },
        6: { cellWidth: "wrap", halign: "right" },
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
      `Laporan_PemasukanKasir_${new Date().toISOString().slice(0, 10)}.pdf`
    );
  };

  // === KOLOM UNTUK TABEL DI WEB ===
  const columns = [
    { key: "no", label: "#" },
    { key: "tanggal", label: "Tanggal" },
    { key: "tipe_transaksi", label: "Tipe Transaksi" },
    { key: "total_service", label: "Total Layanan" },
    { key: "laba_produk", label: "Laba Produk" },
    { key: "komisi_capster", label: "Komisi Capster" },
    { key: "total_bersih", label: "Total Bersih" },
  ];

  return (
    <MainLayout current="laporan">
      {(searchTerm) => {
        const filteredData = useMemo(() => {
          if (!searchTerm) return data;
          const lower = searchTerm.toLowerCase();
          return data.filter(
            (d) =>
              d.tipe_transaksi.toLowerCase().includes(lower) ||
              d.tanggal.toLowerCase().includes(lower)
          );
        }, [searchTerm, data]);

        const tableData = useMemo(
          () =>
            filteredData.map((d, i) => ({
              no: i + 1,
              tanggal: formatTanggal(d.tanggal),
              tipe_transaksi: (
                <span className="capitalize">
                  {d.tipe_transaksi === "service"
                    ? "Layanan"
                    : d.tipe_transaksi === "produk"
                    ? "Produk"
                    : d.tipe_transaksi === "campuran"
                    ? "Campuran"
                    : d.tipe_transaksi}
                </span>
              ),
              total_service: (
                <span className="text-blue-600 font-medium">
                  {formatRupiah(d.total_service)}
                </span>
              ),
              laba_produk: (
                <span className="text-emerald-600 font-medium">
                  {formatRupiah(d.laba_produk)}
                </span>
              ),
              komisi_capster: (
                <span className="text-red-600 font-medium">
                  {formatRupiah(d.komisi_capster)}
                </span>
              ),
              total_bersih: (
                <span className="font-semibold text-slate-800">
                  {formatRupiah(d.total_bersih)}
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
                  Laporan Pemasukan Kasir —{" "}
                  <span className="text-slate-800">{storeName}</span>
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Rekap pendapatan kasir dari layanan, laba produk, dan potongan
                  komisi capster.
                </p>
              </div>
              <button
                onClick={handlePrintPDF}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
              >
                <FileText size={16} />
                Cetak PDF
              </button>
            </div>

            {/* === Filter Bar === */}
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

              <div className="flex items-center gap-2">
                <label className="text-gray-600 font-medium text-sm">
                  Tipe:
                </label>
                <select
                  value={tipeTransaksi}
                  onChange={(e) => setTipeTransaksi(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Semua">Semua</option>
                  <option value="service">Layanan</option>
                  <option value="produk">Produk</option>
                  <option value="campuran">Campuran</option>
                </select>
              </div>

              {/* Filter tanggal */}
              {filterType === "Harian" && (
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
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
                  <Calendar size={16} className="text-gray-500" />
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
                  <Calendar size={16} className="text-gray-500" />
                  <input
                    type="date"
                    value={periodeMulai}
                    onChange={(e) => setPeriodeMulai(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-gray-500 text-sm">sampai</span>
                  <input
                    type="date"
                    value={periodeAkhir}
                    onChange={(e) => setPeriodeAkhir(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* === Tabel === */}
            {loading ? (
              <p className="text-gray-500 italic">
                Memuat laporan pemasukan kasir...
              </p>
            ) : tableData.length === 0 ? (
              <p className="text-gray-500 italic">Tidak ada data pemasukan.</p>
            ) : (
              <TableData columns={columns} data={tableData} />
            )}
          </div>
        );
      }}
    </MainLayout>
  );
}
