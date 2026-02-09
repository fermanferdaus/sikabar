import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import TableData from "../../../components/TableData";
import { FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import formatRupiah from "../../../utils/formatRupiah";
import { formatPeriode } from "../../../utils/dateFormatter";
import useProfil from "../../../hooks/useProfil";
import BackButton from "../../../components/BackButton";
import useNamaOwner from "../../../hooks/useNamaOwner";

export default function LaporanPendapatanDetail() {
  const { id_store } = useParams();

  const [data, setData] = useState(null);
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(false);
  const [storeName, setStoreName] = useState("-");

  const API_URL = import.meta.env.VITE_API_URL;
  const { profil } = useProfil();
  const { namaOwner, loading: loadingOwner } = useNamaOwner();

  let logoSrc = profil?.logo_url || "/Logo1.png";
  if (!logoSrc.includes("localhost") && !logoSrc.includes("127.0.0.1")) {
    logoSrc = logoSrc.replace("http://", "https://");
  }

  const fetchData = async () => {
    try {
      setLoading(true);

      const url = `${API_URL}/laporan/pendapatan-store?id_store=${id_store}&filter=bulan&bulan=${bulan}`;

      const res = await fetch(url);
      const json = await res.json();

      if (json.success) {
        setData(json.data);
        setStoreName(json.store || json.data?.store || "-");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [bulan, id_store]);

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

    const doc = new jsPDF("portrait", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const logo = new Image();
    logo.src = logoSrc;
    doc.addImage(logo, "PNG", 44, 10, 20, 20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(profil?.nama_barbershop, pageWidth / 2, 14, { align: "center" });

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

    const rows = tableData.map((r) => [
      r.no,
      r.keterangan,
      {
        content: r.jumlah,
        styles: r.isBold ? { fontStyle: "bold" } : {},
      },
    ]);

    autoTable(doc, {
      startY: 36,
      head: [["No", "Keterangan", "Jumlah"]],
      body: rows,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        halign: "center",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 14 },
        2: { halign: "right", cellWidth: 45 },
      },
      bodyStyles: { textColor: [0, 0, 0] },
      margin: { left: 15, right: 15 },
    });

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

    doc.text(`Bandar Lampung, ${nowID}`, pageWidth - 70, ttdY);
    doc.text("Owner,", pageWidth - 70, ttdY + 7);
    ttdY += 25;
    doc.text(loadingOwner ? "-" : namaOwner, ttdX, ttdY);

    doc.save(
      `Laporan_Pendapatan_${storeName}_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`,
    );
  };

  const columns = [
    { key: "no", label: "#" },
    { key: "keterangan", label: "Keterangan" },
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
          <BackButton to="/laporan/pendapatan" />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-b border-gray-100 pb-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-800">
                Laporan Pendapatan Cabang — <span>{storeName}</span>
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Detail pendapatan cabang per bulan.
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

          <div className="flex items-center gap-2 border border-gray-100 rounded-xl p-4">
            <label className="text-gray-600 font-medium text-sm">Bulan:</label>
            <input
              type="month"
              value={bulan}
              onChange={(e) => setBulan(e.target.value + "-01")}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            />
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
