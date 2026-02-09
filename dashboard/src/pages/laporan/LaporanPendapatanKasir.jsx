import { useState, useEffect, useMemo } from "react";
import MainLayout from "../../layouts/MainLayout";
import TableData from "../../components/TableData";
import { FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import formatRupiah from "../../utils/formatRupiah";
import { formatPeriode } from "../../utils/dateFormatter";
import useProfil from "../../hooks/useProfil";
import BackButton from "../../components/BackButton";

export default function LaporanPendapatanKasir() {
  const [data, setData] = useState(null);
  const [filterType, setFilterType] = useState("Bulanan");
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

  const fetchData = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/laporan/pendapatan-store?id_store=${id_store}&`;

      if (filterType === "Bulanan") {
        url += `filter=bulan&bulan=${bulan}`;
      }

      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setData(json.data);

        setStoreName(
          json.store ||
            json.data?.store ||
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
  }, [filterType, bulan]);

  const tableData = useMemo(() => {
    if (!data) return [];

    return [
      {
        keterangan: "Pendapatan Kotor",
        jumlah: formatRupiah(data.pendapatan_kotor),
      },

      {
        keterangan: "Komisi Kapster",
        jumlah: formatRupiah(data.komisi_capster),
      },

      { keterangan: "Gaji Kapster", jumlah: formatRupiah(data.gaji_capster) },
      { keterangan: "Gaji Kasir", jumlah: formatRupiah(data.gaji_kasir) },

      { keterangan: "Bonus Kapster", jumlah: formatRupiah(data.bonus_capster) },
      { keterangan: "Bonus Kasir", jumlah: formatRupiah(data.bonus_kasir) },

      {
        keterangan: "Kasbon Kapster",
        jumlah: formatRupiah(data.kasbon_capster || 0),
      },
      {
        keterangan: "Kasbon Kasir",
        jumlah: formatRupiah(data.kasbon_kasir || 0),
      },

      {
        keterangan: "Potongan Kapster",
        jumlah: formatRupiah(data.potongan_capster || 0),
      },
      {
        keterangan: "Potongan Kasir",
        jumlah: formatRupiah(data.potongan_kasir || 0),
      },

      {
        keterangan: "Pengeluaran Cabang",
        jumlah: formatRupiah(data.pengeluaran),
      },

      {
        keterangan: "Pendapatan Bersih",
        jumlah: formatRupiah(data.pendapatan_bersih),
        isBold: true,
      },
    ].map((item, index) => ({
      no: index + 1,
      ...item,
    }));
  }, [data]);

  const handlePrintPDF = () => {
    if (!data) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const kasirName = localStorage.getItem("nama_user") || "-";

    // =========================
    // LOGO (KIRI ATAS)
    // =========================
    const logo = new Image();
    logo.src = logoSrc;
    doc.addImage(logo, "PNG", 44, 10, 20, 20);

    // =========================
    // HEADER (CENTER, TIDAK TABRAK)
    // =========================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(profil?.nama_barbershop, pageWidth / 2, 14, {
      align: "center",
    });

    doc.setFontSize(12);
    doc.text("LAPORAN PENDAPATAN CABANG", pageWidth / 2, 20, {
      align: "center",
    });

    doc.setFontSize(11);
    doc.text(storeName, pageWidth / 2, 25, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Periode Bulan: ${formatPeriode(bulan)}`, pageWidth / 2, 30, {
      align: "center",
    });

    // =========================
    // TABLE DATA + NO
    // =========================
    const rows = [
      ["Pendapatan Kotor", data.pendapatan_kotor],
      ["Komisi Kapster", data.komisi_capster],
      ["Gaji Kapster", data.gaji_capster],
      ["Gaji Kasir", data.gaji_kasir],
      ["Bonus Kapster", data.bonus_capster],
      ["Bonus Kasir", data.bonus_kasir],
      ["Kasbon Kapster", data.kasbon_capster || 0],
      ["Kasbon Kasir", data.kasbon_kasir || 0],
      ["Potongan Kapster", data.potongan_capster || 0],
      ["Potongan Kasir", data.potongan_kasir || 0],
      ["Pengeluaran Cabang", data.pengeluaran],
      ["Pendapatan Bersih", data.pendapatan_bersih, true],
    ].map((r, i) => [
      i + 1,
      r[0],
      {
        content: formatRupiah(r[1]),
        styles: r[2] ? { fontStyle: "bold" } : {},
      },
    ]);

    autoTable(doc, {
      startY: 36,
      head: [["No", "Keterangan", "Jumlah"]],
      body: rows,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        halign: "center",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 14 },
        1: { cellWidth: "auto" },
        2: { halign: "right", cellWidth: 45 },
      },
      bodyStyles: { textColor: [0, 0, 0] },
      margin: { left: 15, right: 15 },
    });

    // =========================
    // TTD (ANTI TERPOTONG)
    // =========================
    let ttdY = doc.lastAutoTable.finalY + 15;
    const ttdX = pageWidth - 70;

    if (ttdY + 40 > pageHeight) {
      doc.addPage();
      ttdY = 30;
    }

    const nowID = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    doc.setFontSize(11);
    doc.text(`Bandar Lampung, ${nowID}`, ttdX, ttdY);
    ttdY += 7;
    doc.text("Kasir,", ttdX, ttdY);
    ttdY += 25;
    doc.text(kasirName, ttdX, ttdY);

    // =========================
    // SAVE
    // =========================
    doc.save(
      `Laporan_Pendapatan_Cabang_${new Date().toISOString().slice(0, 10)}.pdf`,
    );
  };

  const columns = [
    {
      key: "no",
      label: "#",
      render: (row) => (
        <span className="block text-center text-xs text-gray-400">
          {row.no}
        </span>
      ),
    },
    {
      key: "keterangan",
      label: "Keterangan",
      render: (row) => (
        <span className={row.isBold ? "font-semibold" : ""}>
          {row.keterangan}
        </span>
      ),
    },
    {
      key: "jumlah",
      label: "Jumlah",
      render: (row) => (
        <span
          className={`block text-right ${row.isBold ? "font-semibold" : ""}`}
        >
          {row.jumlah}
        </span>
      ),
    },
  ];

  return (
    <MainLayout current="laporan">
      {() => (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">
          <BackButton to="/laporan/kasir" />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-b border-gray-100 pb-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-800">
                Laporan Pendapatan Cabang — <span>{storeName}</span>
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Ringkasan pendapatan bersih cabang.
              </p>
            </div>

            <button
              onClick={handlePrintPDF}
              className="self-start sm:self-auto flex items-center gap-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm"
            >
              <FileText size={16} />
              Cetak PDF
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <label className="text-gray-600 font-medium text-sm">
                Bulan:
              </label>
              <input
                type="month"
                value={bulan}
                onChange={(e) => setBulan(e.target.value + "-01")}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm"
              />
            </div>
          </div>

          {loading ? (
            <p className="text-gray-500 italic">Memuat data...</p>
          ) : !data ? (
            <p className="text-gray-500 italic">Tidak ada data.</p>
          ) : (
            <TableData columns={columns} data={tableData} />
          )}
        </div>
      )}
    </MainLayout>
  );
}
