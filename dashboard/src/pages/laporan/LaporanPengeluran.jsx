import { useState, useEffect, useMemo } from "react";
import MainLayout from "../../layouts/MainLayout";
import TableData from "../../components/TableData";
import { FileText } from "lucide-react";
import formatRupiah from "../../utils/formatRupiah";
import { formatTanggal, formatPeriode } from "../../utils/dateFormatter";
import useFetchStore from "../../hooks/useFetchStore";
import useProfil from "../../hooks/useProfil";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import BackButton from "../../components/BackButton";
import useNamaOwner from "../../hooks/useNamaOwner";

export default function LaporanPengeluaran() {
  const [filterType, setFilterType] = useState("Harian");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0],
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
  const { profil } = useProfil();
  const { namaOwner, loading: loadingOwner } = useNamaOwner();

  let logoSrc = profil?.logo_url || "/Logo1.png";
  if (!logoSrc.includes("localhost") && !logoSrc.includes("127.0.0.1")) {
    logoSrc = logoSrc.replace("http://", "https://");
  }

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

  // ===========================
  // CETAK PDF (STYLE SESUAI)
  // ===========================
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
    doc.text(profil?.nama_barbershop, pageWidth / 2, 12, { align: "center" });

    doc.setFontSize(12);
    doc.text("LAPORAN PENGELUARAN", pageWidth / 2, 18, { align: "center" });

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
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(periodeText, pageWidth / 2, 24, { align: "center" });

    // === TABEL ===
    const headers = [
      [
        "No",
        "Store",
        "Tanggal",
        "Kategori",
        "Keterangan",
        "Jumlah Pengeluaran",
      ],
    ];

    const rows = data.map((d, i) => [
      i + 1,
      d.store,
      formatTanggalID(d.tanggal),
      d.kategori,
      d.deskripsi || "-",
      `Rp ${Number(d.jumlah).toLocaleString("id-ID")}`,
    ]);

    const totalJumlah = data.reduce((sum, d) => sum + (d.jumlah || 0), 0);

    rows.push([
      {
        content: "Total Pengeluaran",
        colSpan: 5,
        styles: { halign: "right", fontStyle: "bold" },
      },
      {
        content: `Rp ${totalJumlah.toLocaleString("id-ID")}`,
        styles: { halign: "center", fontStyle: "bold" },
      },
    ]);

    autoTable(doc, {
      startY: 30,
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

    // === BLOK TANDA TANGAN ===
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

    // === SAVE PDF ===
    doc.save(
      `Laporan_Pengeluaran_${new Date().toISOString().slice(0, 10)}.pdf`,
    );
  };

  // === KOLOM TABLE WEB ===
  const columns = [
    { key: "no", label: "#" },
    { key: "store", label: "Store" },
    { key: "tanggal", label: "Tanggal" },
    { key: "kategori", label: "Kategori" },
    { key: "keterangan", label: "Keterangan" },
    { key: "jumlah", label: "Jumlah" },
  ];

  return (
    <MainLayout current="laporan">
      {(searchTerm) => {
        const filteredData = useMemo(() => {
          if (!searchTerm) return data;
          const lower = searchTerm.toLowerCase();
          return data.filter(
            (d) =>
              d.store.toLowerCase().includes(lower) ||
              d.kategori.toLowerCase().includes(lower) ||
              d.keterangan.toLowerCase().includes(lower) ||
              d.tanggal.toLowerCase().includes(lower) ||
              String(d.jumlah).includes(lower),
          );
        }, [searchTerm, data]);

        const tableData = useMemo(
          () =>
            filteredData.map((d, i) => ({
              no: i + 1,
              store: d.store,
              tanggal: formatTanggal(d.tanggal),
              kategori: (
                <span className="capitalize text-slate-700">{d.kategori}</span>
              ),
              keterangan: d.deskripsi || "-",
              jumlah: <span>{formatRupiah(d.jumlah)}</span>,
            })),
          [filteredData],
        );

        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">
            <BackButton to="/laporan" />
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  Laporan Pengeluaran
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Rekap seluruh biaya operasional, pembelian barang, dan
                  pengeluaran kas lainnya.
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
              {/* Filter Jenis */}
              <div className="flex items-center gap-2">
                <label className="text-gray-600 font-medium text-sm">
                  Jenis:
                </label>
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

              {/* Filter Store */}
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

              {/* Filter Kategori */}
              <div className="flex items-center gap-2">
                <label className="text-gray-600 font-medium text-sm">
                  Kategori:
                </label>
                <select
                  value={kategoriPengeluaran}
                  onChange={(e) => setKategoriPengeluaran(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
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
                  <label className="text-gray-600 text-sm">Tanggal:</label>
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
                  <label className="text-gray-600 text-sm">Bulan:</label>
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

            {/* TABLE */}
            {loading ? (
              <p className="text-gray-500 italic">Memuat laporan...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : tableData.length === 0 ? (
              <p className="text-gray-500 italic">Tidak ada data.</p>
            ) : (
              <TableData columns={columns} data={tableData} />
            )}
          </div>
        );
      }}
    </MainLayout>
  );
}
