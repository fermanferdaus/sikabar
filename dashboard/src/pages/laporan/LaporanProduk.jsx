import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import TableData from "../../components/TableData";
import { FileText, Store, Calendar, ArrowLeft } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import formatRupiah from "../../utils/formatRupiah";
import { formatPeriode } from "../../utils/dateFormatter";
import { formatKodeProduk } from "../../utils/formatProduk";
import useFetchStore from "../../hooks/useFetchStore";
import useProfil from "../../hooks/useProfil";

export default function LaporanProduk() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();
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
  const { profil } = useProfil();
  let logoSrc = profil?.logo_url || "/Logo1.png";
  if (!logoSrc.includes("localhost") && !logoSrc.includes("127.0.0.1")) {
    logoSrc = logoSrc.replace("http://", "https://");
  }

  // 🔥 PERBAIKAN SATU-SATUNYA DI SINI 🔥
  const { data: storeData, loading: loadingStore } = useFetchStore();

  // ======================================================
  // FETCH DATA
  // ======================================================
  const fetchData = async () => {
    try {
      setLoading(true);

      let url = `${API_URL}/laporan/produk?`;

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

  // ======================================================
  // FORMAT TABLE
  // ======================================================
  const tableData = useMemo(
    () =>
      data.map((d, i) => ({
        no: i + 1,
        store: d.nama_store || "-",
        kode_produk: formatKodeProduk(d.id_produk),
        nama_produk: d.nama_produk,
        satuan: "pcs",
        harga_awal: formatRupiah(d.harga_awal),
        harga_jual: formatRupiah(d.harga_jual),
        jumlah: d.jumlah_stok,
        _search: `${d.nama_store} ${d.nama_produk}`.toLowerCase(),
      })),
    [data]
  );

  const filterSearch = (s) =>
    tableData.filter((d) => d._search.includes(s.toLowerCase()));

  // ======================================================
  // PDF EXPORT
  // ======================================================
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
    doc.text(profil?.nama, pageWidth / 2, 12, { align: "center" });

    doc.setFontSize(12);
    doc.text("LAPORAN DATA PRODUK", pageWidth / 2, 18, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    // === FORMAT TANGGAL INDONESIA ===
    const formatTanggalID = (tgl) => {
      const d = new Date(tgl);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    };

    // === PERIODE TEXT ===
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
      periodeText = "Semua Data Produk";
    }

    // === CETAK PERIODE DI HEADER ===
    doc.text(periodeText, pageWidth / 2, 24, { align: "center" });

    // === TABLE ===
    const headers = [
      [
        "No",
        "Cabang",
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
      d.nama_store || "-",
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
        colSpan: 7,
        styles: { halign: "right", fontStyle: "bold" },
      },
      {
        content: totalStok.toLocaleString("id-ID"),
        styles: { halign: "center", fontStyle: "bold" },
      },
    ]);

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

    // === BLOK TANDA TANGAN ===
    const now = new Date();
    const tanggalID = now.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const ownerName = localStorage.getItem("nama_user") || "-";

    let ttdY = doc.lastAutoTable.finalY + 12;
    const ttdX = pageWidth - 80;

    doc.setFontSize(11);
    doc.text(`Bandar Lampung, ${tanggalID}`, ttdX, ttdY);

    ttdY += 7;
    doc.text("Owner,", ttdX, ttdY);

    ttdY += 25;
    doc.text(ownerName, ttdX, ttdY);

    doc.save(`Laporan_Produk_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const columns = [
    { key: "no", label: "#" },
    { key: "store", label: "Cabang" },
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
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  Laporan Data Produk
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Rekap seluruh data produk berdasarkan filter yang dipilih.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-start sm:justify-end">
                <button
                  onClick={handlePrintPDF}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 
                 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm"
                >
                  <FileText size={16} />
                  Cetak PDF
                </button>

                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2.5 rounded-lg text-sm font-medium"
                >
                  <ArrowLeft size={16} /> Kembali
                </button>
              </div>
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
                <Store size={16} className="text-gray-500" />
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  disabled={loadingStore}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                  <Calendar size={16} className="text-gray-500" />
                  <input
                    type="date"
                    value={periodeAkhir}
                    onChange={(e) => setPeriodeAkhir(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

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
