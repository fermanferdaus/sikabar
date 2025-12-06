import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import TableData from "../../components/TableData";
import { FileText, Store, Calendar, ArrowLeft } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import useFetchStore from "../../hooks/useFetchStore";
import formatRupiah from "../../utils/formatRupiah";
import useProfil from "../../hooks/useProfil";
import { formatTanggal, formatPeriode } from "../../utils/dateFormatter";

export default function LaporanArusKas() {
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
  const { data: storeData, loading: loadingStore } = useFetchStore();
  const { profil } = useProfil();

  let logoSrc = profil?.logo_url || "/Logo1.png";
  if (!logoSrc.includes("localhost") && !logoSrc.includes("127.0.0.1")) {
    logoSrc = logoSrc.replace("http://", "https://");
  }

  // ================================
  // FETCH DATA
  // ================================
  const fetchData = async () => {
    setLoading(true);

    const makeUrl = (idStore = null) => {
      let url = `${API_URL}/laporan/arus-kas?`;
      if (idStore) url += `store=${idStore}&`;

      if (filterType === "Harian") url += `filter=hari&tanggal=${tanggal}`;
      if (filterType === "Bulanan") url += `filter=bulan&bulan=${bulan}`;
      if (filterType === "Periode")
        url += `filter=periode&startDate=${periodeMulai}&endDate=${periodeAkhir}`;

      return url;
    };

    let list = [];

    if (selectedStore === "Semua") {
      for (const s of storeData) {
        const res = await fetch(makeUrl(s.id_store));
        const json = await res.json();
        if (json.success) list.push({ store: s.nama_store, ...json });
      }
    } else {
      const stName = storeData.find(
        (s) => s.id_store == selectedStore
      )?.nama_store;
      const res = await fetch(makeUrl(selectedStore));
      const json = await res.json();
      if (json.success) list.push({ store: stName, ...json });
    }

    setData(list);
    setLoading(false);
  };

  useEffect(() => {
    if (storeData.length) fetchData();
  }, [
    selectedStore,
    filterType,
    tanggal,
    bulan,
    periodeMulai,
    periodeAkhir,
    storeData,
  ]);

  // ================================
  // TABLE DATA
  // ================================
  const tableData = useMemo(
    () =>
      data.map((d, i) => ({
        no: i + 1,
        store: d.store,
        pendapatan_jasa: formatRupiah(d.detail.pendapatan_jasa),
        pendapatan_produk: formatRupiah(d.detail.pendapatan_produk),
        potongan_kasbon: formatRupiah(d.detail.potongan_kasbon),
        komisi: formatRupiah(d.detail.komisi),
        pengeluaran: formatRupiah(d.detail.pengeluaran),
        kasbon: formatRupiah(d.detail.kasbon_keluar),
        bonus: formatRupiah(d.detail.bonus),
        kas_masuk: formatRupiah(d.kas_masuk),
        kas_keluar: formatRupiah(d.kas_keluar), // 🔥 LANGSUNG DARI API
        saldo: formatRupiah(d.saldo_akhir), // 🔥 LANGSUNG DARI API
        _search: `${d.store}`.toLowerCase(),
      })),
    [data]
  );

  const filterSearch = (s) =>
    tableData.filter((d) => d._search.includes(s.toLowerCase()));

  // ================================
  // PDF EXPORT
  // ================================
  const handlePrintPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const ownerName = localStorage.getItem("nama_user") || "-";

    const tglID = (tgl) =>
      new Date(tgl).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

    // LOGO
    const logo = new Image();
    logo.src = logoSrc;
    doc.addImage(logo, "PNG", 80, 6, 22, 22);

    // HEADER
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(profil?.nama, pageWidth / 2, 12, { align: "center" });

    doc.setFontSize(12);
    doc.text("LAPORAN ARUS KAS", pageWidth / 2, 18, {
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

    // PERIODE
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
      periodeText = "Semua Data Arus Kas";
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(periodeText, pageWidth / 2, 24, { align: "center" });

    // TABLE HEADER
    const headers = [
      [
        "No",
        "Cabang",
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

    // ROW DATA
    const rows = data.map((d, i) => [
      i + 1,
      d.store,
      `Rp ${Number(d.detail.pendapatan_jasa || 0).toLocaleString("id-ID")}`,
      `Rp ${Number(d.detail.pendapatan_produk || 0).toLocaleString("id-ID")}`,
      `Rp ${Number(d.detail.potongan_kasbon || 0).toLocaleString("id-ID")}`,
      `Rp ${Number(d.detail.komisi || 0).toLocaleString("id-ID")}`,
      `Rp ${Number(d.detail.pengeluaran || 0).toLocaleString("id-ID")}`,
      `Rp ${Number(d.detail.kasbon_keluar || 0).toLocaleString("id-ID")}`,
      `Rp ${Number(d.detail.bonus || 0).toLocaleString("id-ID")}`,
      `Rp ${Number(d.kas_masuk || 0).toLocaleString("id-ID")}`,
      `Rp ${Number(d.kas_keluar || 0).toLocaleString("id-ID")}`,
      `Rp ${Number(d.saldo_akhir || 0).toLocaleString("id-ID")}`,
    ]);

    // === TOTAL ===
    const total = {
      jasa: data.reduce((t, x) => t + Number(x.detail.pendapatan_jasa || 0), 0),
      produk: data.reduce(
        (t, x) => t + Number(x.detail.pendapatan_produk || 0),
        0
      ),
      kasbon: data.reduce(
        (t, x) => t + Number(x.detail.potongan_kasbon || 0),
        0
      ),
      komisi: data.reduce((t, x) => t + Number(x.detail.komisi || 0), 0),
      pengeluaran: data.reduce(
        (t, x) => t + Number(x.detail.pengeluaran || 0),
        0
      ),
      kasbon_keluar: data.reduce(
        (t, x) => t + Number(x.detail.kasbon_keluar || 0),
        0
      ),
      bonus: data.reduce((t, x) => t + Number(x.detail.bonus || 0), 0),
      kas_masuk: data.reduce((t, x) => t + Number(x.kas_masuk || 0), 0),
      kas_keluar: data.reduce((t, x) => t + Number(x.kas_keluar || 0), 0),
      saldo: data.reduce((t, x) => t + Number(x.saldo_akhir || 0), 0),
    };

    rows.push([
      {
        content: "Total",
        colSpan: 2,
        styles: { halign: "right", fontStyle: "bold" },
      },
      {
        content: `Rp ${total.jasa.toLocaleString("id-ID")}`,
        styles: { halign: "right", fontStyle: "bold" },
      },
      {
        content: `Rp ${total.produk.toLocaleString("id-ID")}`,
        styles: { halign: "right", fontStyle: "bold" },
      },
      {
        content: `Rp ${total.kasbon.toLocaleString("id-ID")}`,
        styles: { halign: "right", fontStyle: "bold" },
      },
      {
        content: `Rp ${total.komisi.toLocaleString("id-ID")}`,
        styles: { halign: "right", fontStyle: "bold" },
      },
      {
        content: `Rp ${total.pengeluaran.toLocaleString("id-ID")}`,
        styles: { halign: "right", fontStyle: "bold" },
      },
      {
        content: `Rp ${total.kasbon_keluar.toLocaleString("id-ID")}`,
        styles: { halign: "right", fontStyle: "bold" },
      },
      {
        content: `Rp ${total.bonus.toLocaleString("id-ID")}`,
        styles: { halign: "right", fontStyle: "bold" },
      },
      {
        content: `Rp ${total.kas_masuk.toLocaleString("id-ID")}`,
        styles: { halign: "right", fontStyle: "bold" },
      },
      {
        content: `Rp ${total.kas_keluar.toLocaleString("id-ID")}`,
        styles: { halign: "right", fontStyle: "bold" },
      },
      {
        content: `Rp ${total.saldo.toLocaleString("id-ID")}`,
        styles: { halign: "right", fontStyle: "bold" },
      },
    ]);

    // DRAW
    autoTable(doc, {
      startY: 30,
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
      // 👉 SET RIGHT ALIGN UNTUK KOLOM ANGKA
      columnStyles: {
        2: { halign: "right" }, // Pend. Jasa
        3: { halign: "right" }, // Pend. Produk
        4: { halign: "right" }, // Pot. Kasbon
        5: { halign: "right" }, // Komisi
        6: { halign: "right" }, // Pengeluaran
        7: { halign: "right" }, // Kasbon Keluar
        8: { halign: "right" }, // Bonus
        9: { halign: "right" }, // Kas Masuk
        10: { halign: "right" }, // Kas Keluar
        11: { halign: "right" }, // Saldo Akhir
      },
      bodyStyles: { halign: "center" },
      margin: { left: 15, right: 15 },
    });

    // SIGNATURE
    const ttdX = pageWidth - 80;
    let ttdY = doc.lastAutoTable.finalY + 12;
    const now = tglID(new Date());

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Bandar Lampung, ${now}`, ttdX, ttdY);
    doc.text("Owner,", ttdX, ttdY + 7);
    doc.text(ownerName, ttdX, ttdY + 32);

    doc.save(`Laporan_Arus_Kas_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // ================================
  // TABLE COLUMNS
  // ================================
  const columns = [
    { key: "no", label: "#" },
    { key: "store", label: "Cabang" },
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

  return (
    <MainLayout current="laporan">
      {(searchTerm) => {
        const filtered = filterSearch(searchTerm);

        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
              <div className="text-left">
                <h1 className="text-xl font-semibold text-slate-800">
                  Laporan Arus Kas
                </h1>
                <p className="text-sm text-gray-500">
                  Rekap arus kas masuk & keluar setiap cabang.
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

            {/* FILTERS */}
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
                <Store size={16} className="text-gray-500" />
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
            ) : filtered.length === 0 ? (
              <p className="text-gray-500 italic">Tidak ada data.</p>
            ) : (
              <TableData columns={columns} data={filtered}>
                <tfoot>
                  <tr className="font-bold bg-gray-100">
                    <td colSpan={2} className="text-left px-4 py-3">
                      Total
                    </td>

                    <td className="text-left px-4 py-3">
                      {formatRupiah(
                        filtered.reduce(
                          (s, d) =>
                            s +
                            Number(d.pendapatan_jasa.replace(/[^0-9-]/g, "")),
                          0
                        )
                      )}
                    </td>

                    <td className="text-left px-4 py-3">
                      {formatRupiah(
                        filtered.reduce(
                          (s, d) =>
                            s +
                            Number(d.pendapatan_produk.replace(/[^0-9-]/g, "")),
                          0
                        )
                      )}
                    </td>

                    <td className="text-left px-4 py-3">
                      {formatRupiah(
                        filtered.reduce(
                          (s, d) =>
                            s +
                            Number(d.potongan_kasbon.replace(/[^0-9-]/g, "")),
                          0
                        )
                      )}
                    </td>

                    <td className="text-left px-4 py-3">
                      {formatRupiah(
                        filtered.reduce(
                          (s, d) =>
                            s + Number(d.komisi.replace(/[^0-9-]/g, "")),
                          0
                        )
                      )}
                    </td>

                    <td className="text-left px-4 py-3">
                      {formatRupiah(
                        filtered.reduce(
                          (s, d) =>
                            s + Number(d.pengeluaran.replace(/[^0-9-]/g, "")),
                          0
                        )
                      )}
                    </td>

                    <td className="text-left px-4 py-3">
                      {formatRupiah(
                        filtered.reduce(
                          (s, d) =>
                            s + Number(d.kasbon.replace(/[^0-9-]/g, "")),
                          0
                        )
                      )}
                    </td>

                    <td className="text-left px-4 py-3">
                      {formatRupiah(
                        filtered.reduce(
                          (s, d) => s + Number(d.bonus.replace(/[^0-9-]/g, "")),
                          0
                        )
                      )}
                    </td>

                    <td className="text-left px-4 py-3">
                      {formatRupiah(
                        filtered.reduce(
                          (s, d) =>
                            s + Number(d.kas_masuk.replace(/[^0-9-]/g, "")),
                          0
                        )
                      )}
                    </td>

                    <td className="text-left px-4 py-3">
                      {formatRupiah(
                        filtered.reduce(
                          (s, d) =>
                            s + Number(d.kas_keluar.replace(/[^0-9-]/g, "")),
                          0
                        )
                      )}
                    </td>

                    <td className="text-left px-4 py-3">
                      {formatRupiah(
                        filtered.reduce(
                          (s, d) => s + Number(d.saldo.replace(/[^0-9-]/g, "")),
                          0
                        )
                      )}
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
