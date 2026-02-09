import MainLayout from "../../../layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import useFetchTransaksiAdmin from "../../../hooks/useFetchTransaksi";
import TableData from "../../../components/TableData";
import BackButton from "../../../components/BackButton";

export default function LaporanPendapatan() {
  const [filterType] = useState("Bulanan");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [laporan, setLaporan] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const navigate = useNavigate();
  const { data, loading, error } = useFetchTransaksiAdmin(filterType, tanggal);

  const API_URL = import.meta.env.VITE_API_URL;
  const bulan = tanggal.slice(0, 7);

  const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(angka) || 0);

  // =========================
  // FETCH PENDAPATAN BERSIH PER CABANG
  // =========================
  useEffect(() => {
    if (!data || data.length === 0) return;

    const fetchDetail = async () => {
      try {
        setLoadingDetail(true);

        const results = await Promise.all(
          data.map(async (d) => {
            const res = await fetch(
              `${API_URL}/laporan/pendapatan-store?id_store=${d.id_store}&bulan=${bulan}`,
            );
            const json = await res.json();

            return {
              id_store: d.id_store,
              nama_store: d.nama_store,
              pendapatan_bersih: json.data?.pendapatan_bersih || 0,
            };
          }),
        );

        setLaporan(results);
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchDetail();
  }, [data, bulan, API_URL]);

  // =========================
  // TOTAL BERSIH (SUMMARY)
  // =========================
  const totalBersih = useMemo(() => {
    return laporan.reduce(
      (sum, d) => sum + Number(d.pendapatan_bersih || 0),
      0,
    );
  }, [laporan]);

  const columns = [
    { key: "no", label: "#" },
    { key: "nama_store", label: "Cabang" },
    { key: "pendapatan_bersih", label: "Pendapatan Bersih" },
    { key: "aksi", label: "Aksi" },
  ];

  const tableData = laporan.map((d, i) => ({
    no: i + 1,
    nama_store: d.nama_store,
    pendapatan_bersih: (
      <div className="text-left text-emerald-600 font-semibold">
        {formatRupiah(d.pendapatan_bersih)}
      </div>
    ),
    aksi: (
      <button
        onClick={() => navigate(`/laporan/pendapatan/${d.id_store}`)}
        className="bg-[#0e57b5] hover:bg-[#0b4894] text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
      >
        Detail
      </button>
    ),
  }));

  return (
    <MainLayout current="laporan">
      {(searchTerm) => {
        const searchedData = laporan.filter((d) =>
          d.nama_store.toLowerCase().includes(searchTerm.toLowerCase()),
        );

        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">
            <BackButton to="/laporan"/>
            {/* === Header === */}
            <div className="border-b border-gray-100 pb-4">
              <h1 className="text-xl font-semibold text-slate-800">
                Laporan Pendapatan Cabang
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Ringkasan pendapatan bersih seluruh cabang.
              </p>
            </div>

            {/* === Filter === */}
            <div className="flex items-center gap-2 border border-gray-100 rounded-xl p-4">
              <label className="text-gray-600 font-medium text-sm">
                Bulan :
              </label>
              <input
                type="month"
                value={bulan}
                onChange={(e) => setTanggal(e.target.value + "-01")}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm"
              />
            </div>

            {/* === Summary === */}
            {searchedData.length > 0 && (
              <div className="p-5 bg-white shadow-sm rounded-xl text-center">
                <p className="text-gray-500">Total Pendapatan Bersih</p>
                <h2 className="text-3xl font-bold text-emerald-600 mt-1">
                  {formatRupiah(totalBersih)}
                </h2>
              </div>
            )}

            {/* === Table === */}
            {loading || loadingDetail ? (
              <p className="text-gray-500 italic">Memuat data pendapatan...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : searchedData.length === 0 ? (
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
