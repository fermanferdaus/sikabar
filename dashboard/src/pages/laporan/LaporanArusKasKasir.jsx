import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import TableData from "../../components/TableData";
import { FileText, Calendar, ArrowLeft } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import formatRupiah from "../../utils/formatRupiah";
import useProfil from "../../hooks/useProfil";
import { formatPeriode } from "../../utils/dateFormatter";

export default function LaporanArusKasKasir() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const id_store = localStorage.getItem("id_store");
  const [storeName, setStoreName] = useState(
    localStorage.getItem("nama_store") || "-"
  );

  const { profil } = useProfil();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [filterType, setFilterType] = useState("Harian");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7));
  const [periodeMulai, setPeriodeMulai] = useState("");
  const [periodeAkhir, setPeriodeAkhir] = useState("");

  let logoSrc = profil?.logo_url || "/Logo1.png";
  if (!logoSrc.includes("localhost") && !logoSrc.includes("127.0.0.1")) {
    logoSrc = logoSrc.replace("http://", "https://");
  }

  // ============================
  // FETCH DATA
  // ============================
  const fetchData = async () => {
    setLoading(true);

    let url = `${API_URL}/laporan/arus-kas-kasir?id_store=${id_store}&`;

    if (filterType === "Harian") url += `filter=hari&tanggal=${tanggal}`;
    if (filterType === "Bulanan") url += `filter=bulan&bulan=${bulan}`;
    if (filterType === "Periode")
      url += `filter=periode&startDate=${periodeMulai}&endDate=${periodeAkhir}`;

    const res = await fetch(url);
    const json = await res.json();

    if (json.success) {
      setData(json);
      setStoreName(json.store); // ⬅ ambil dari backend
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [filterType, tanggal, bulan, periodeMulai, periodeAkhir]);

  // ============================
  // TABLE DATA
  // ============================
  const tableData = useMemo(() => {
    if (!data) return [];

    return [
      {
        no: 1,
        pendapatan_jasa: formatRupiah(data.detail.pendapatan_jasa),
        pendapatan_produk: formatRupiah(data.detail.pendapatan_produk),
        potongan_kasbon: formatRupiah(data.detail.potongan_kasbon),
        komisi: formatRupiah(data.detail.komisi),
        pengeluaran: formatRupiah(data.detail.pengeluaran),
        kasbon: formatRupiah(data.detail.kasbon_keluar),
        bonus: formatRupiah(data.detail.bonus),
        kas_masuk: formatRupiah(data.kas_masuk),
        kas_keluar: formatRupiah(data.kas_keluar),
        saldo: formatRupiah(data.saldo_akhir),
        _search: "",
      },
    ];
  }, [data]);

  const columns = [
    { key: "no", label: "#" },
    { key: "pendapatan_jasa", label: "Pendapatan Jasa" },
    { key: "pendapatan_produk", label: "Pendapatan Produk" },
    { key: "potongan_kasbon", label: "Potongan Kasbon" },
    { key: "komisi", label: "Komisi" },
    { key: "pengeluaran", label: "Pengeluaran" },
    { key: "kasbon", label: "Kasbon Keluar" },
    { key: "bonus", label: "Bonus" },
    { key: "kas_masuk", label: "Kas Masuk" },
    { key: "kas_keluar", label: "Kas Keluar" },
    { key: "saldo", label: "Saldo Akhir" },
  ];

  // ============================
  // PRINT PDF
  // ============================
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

    // LOGO (posisi & ukuran sesuai template)
    const logo = new Image();
    logo.src = logoSrc;
    doc.addImage(logo, "PNG", 80, 6, 22, 22);

    // ============================
    // HEADER STYLE SAMA LAPORAN JASA
    // ============================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(profil?.nama, pageWidth / 2, 12, { align: "center" });

    doc.setFontSize(12);
    doc.text("LAPORAN ARUS KAS CABANG", pageWidth / 2, 18, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(storeName, pageWidth / 2, 23, { align: "center" });

    // ============================
    // PERIODE
    // ============================
    let periodeText = "";
    if (filterType === "Harian") periodeText = `Tanggal: ${tglID(tanggal)}`;
    else if (filterType === "Bulanan")
      periodeText = `Periode Bulan: ${formatPeriode(bulan)}`;
    else
      periodeText = `Periode: ${tglID(periodeMulai)} s.d. ${tglID(
        periodeAkhir
      )}`;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(periodeText, pageWidth / 2, 28, { align: "center" });

    // ============================
    // TABLE
    // ============================
    const headers = [
      [
        "No",
        "Pendapatan Jasa",
        "Pendapatan Produk",
        "Potongan Kasbon",
        "Komisi",
        "Pengeluaran",
        "Kasbon Keluar",
        "Bonus",
        "Kas Masuk",
        "Kas Keluar",
        "Saldo Akhir",
      ],
    ];

    const rows = [
      [
        1,
        formatRupiah(data.detail.pendapatan_jasa),
        formatRupiah(data.detail.pendapatan_produk),
        formatRupiah(data.detail.potongan_kasbon),
        formatRupiah(data.detail.komisi),
        formatRupiah(data.detail.pengeluaran),
        formatRupiah(data.detail.kasbon_keluar),
        formatRupiah(data.detail.bonus),
        formatRupiah(data.kas_masuk),
        formatRupiah(data.kas_keluar),
        formatRupiah(data.saldo_akhir),
      ],
    ];

    // ============================
    // TOTAL
    // ============================
    const total = {
      jasa: Number(data.detail?.pendapatan_jasa || 0),
      produk: Number(data.detail?.pendapatan_produk || 0),
      kasbon: Number(data.detail?.potongan_kasbon || 0),
      komisi: Number(data.detail?.komisi || 0),
      pengeluaran: Number(data.detail?.pengeluaran || 0),
      kasbon_keluar: Number(data.detail?.kasbon_keluar || 0),
      bonus: Number(data.detail?.bonus || 0),
      kas_masuk: Number(data.kas_masuk || 0),
      kas_keluar: Number(data.kas_keluar || 0),
      saldo: Number(data.saldo_akhir || 0),
    };

    // PUSH TOTAL ROW
    rows.push([
      {
        content: "Total",
        colSpan: 1,
        styles: { halign: "center", fontStyle: "bold" },
      },
      {
        content: formatRupiah(total.jasa),
        styles: { halign: "right", fontStyle: "bold" },
      },
      {
        content: formatRupiah(total.produk),
        styles: { halign: "right", fontStyle: "bold" },
      },
      {
        content: formatRupiah(total.kasbon),
        styles: { halign: "right", fontStyle: "bold" },
      },
      {
        content: formatRupiah(total.komisi),
        styles: { halign: "right", fontStyle: "bold" },
      },
      {
        content: formatRupiah(total.pengeluaran),
        styles: { halign: "right", fontStyle: "bold" },
      },
      {
        content: formatRupiah(total.kasbon_keluar),
        styles: { halign: "right", fontStyle: "bold" },
      },
      {
        content: formatRupiah(total.bonus),
        styles: { halign: "right", fontStyle: "bold" },
      },
      {
        content: formatRupiah(total.kas_masuk),
        styles: { halign: "right", fontStyle: "bold" },
      },
      {
        content: formatRupiah(total.kas_keluar),
        styles: { halign: "right", fontStyle: "bold" },
      },
      {
        content: formatRupiah(total.saldo),
        styles: { halign: "right", fontStyle: "bold" },
      },
    ]);

    autoTable(doc, {
      startY: 34,
      head: headers,
      body: rows,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 3, textColor: [0, 0, 0] },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
        6: { halign: "right" },
        7: { halign: "right" },
        8: { halign: "right" },
        9: { halign: "right" },
        10: { halign: "right" },
      },

      bodyStyles: { halign: "center", textColor: [0, 0, 0] },
      margin: { left: 15, right: 15 },
    });

    // ============================
    // TANDA TANGAN
    // ============================
    let ttdY = doc.lastAutoTable.finalY + 12;
    const ttdX = pageWidth - 80;
    const now = tglID(new Date());

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Bandar Lampung, ${now}`, ttdX, ttdY);
    doc.text("Kasir,", ttdX, ttdY + 7);
    doc.text(kasirName, ttdX, ttdY + 32);

    doc.save(
      `Laporan_Arus_Kas_Kasir_${new Date().toISOString().slice(0, 10)}.pdf`
    );
  };

  return (
    <MainLayout current="laporan">
      {(searchTerm) => {
        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  Laporan Arus Kas — <span>{storeName}</span>
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Rekap arus kas masuk & keluar
                </p>
              </div>

              <div className="flex items-center gap-3">
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

            {/* FILTER */}
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

            {/* TABLE */}
            {loading ? (
              <p className="text-gray-500 italic">Memuat data...</p>
            ) : !data ? (
              <p className="text-gray-500 italic">Tidak ada data.</p>
            ) : (
              <TableData columns={columns} data={tableData}>
                <tfoot>
                  <tr className="font-bold bg-gray-100">
                    <td className="text-left px-4 py-3" colSpan={1}>
                      Total
                    </td>

                    <td className="text-left px-4 py-3">
                      {tableData[0].pendapatan_jasa}
                    </td>
                    <td className="text-left px-4 py-3">
                      {tableData[0].pendapatan_produk}
                    </td>
                    <td className="text-left px-4 py-3">
                      {tableData[0].potongan_kasbon}
                    </td>
                    <td className="text-left px-4 py-3">
                      {tableData[0].komisi}
                    </td>
                    <td className="text-left px-4 py-3">
                      {tableData[0].pengeluaran}
                    </td>
                    <td className="text-left px-4 py-3">
                      {tableData[0].kasbon}
                    </td>
                    <td className="text-left px-4 py-3">
                      {tableData[0].bonus}
                    </td>
                    <td className="text-left px-4 py-3">
                      {tableData[0].kas_masuk}
                    </td>
                    <td className="text-left px-4 py-3">
                      {tableData[0].kas_keluar}
                    </td>
                    <td className="text-left px-4 py-3">
                      {tableData[0].saldo}
                    </td>
                  </tr>
                </tfoot>
              </TableData>
            )}
          </div>
        );
      }}
    </MainLayout>
  );
}
