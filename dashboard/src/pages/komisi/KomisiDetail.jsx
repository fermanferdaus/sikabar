import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import MainLayout from "../../layouts/MainLayout";
import useFetchKomisi from "../../hooks/useFetchKomisi";
import { formatTanggalJam } from "../../utils/dateFormatter";

export default function KomisiDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [filterType, setFilterType] = useState("Bulanan");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const { komisi, loading, error } = useFetchKomisi(
    id,
    filterType,
    selectedDate
  );

  const filteredRiwayat = useMemo(() => {
    if (!komisi?.riwayat) return [];
    const date = new Date(selectedDate);
    return komisi.riwayat.filter((item) => {
      const itemDate = new Date(item.tanggal);
      return filterType === "Harian"
        ? itemDate.getDate() === date.getDate() &&
            itemDate.getMonth() === date.getMonth() &&
            itemDate.getFullYear() === date.getFullYear()
        : itemDate.getMonth() === date.getMonth() &&
            itemDate.getFullYear() === date.getFullYear();
    });
  }, [komisi, selectedDate, filterType]);

  const totalKotor = filteredRiwayat.reduce(
    (sum, r) => sum + (r.harga ?? 0),
    0
  );
  const totalBersih = filteredRiwayat.reduce(
    (sum, r) => sum + (r.komisi ?? 0),
    0
  );

  return (
    <MainLayout current="komisi">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">
          Komisi {komisi?.nama_capster || ""}
        </h1>
        <button
          type="button"
          onClick={() => navigate("/komisi")}
          className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2.5 rounded-lg font-medium transition-all"
        >
          ← Kembali
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Memuat data...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <FilterBar
            filterType={filterType}
            setFilterType={setFilterType}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
          <SummaryCards
            totalKotor={totalKotor}
            totalBersih={totalBersih}
            filterType={filterType}
          />
          <RiwayatTable riwayat={filteredRiwayat} />
        </>
      )}
    </MainLayout>
  );
}

/* === Komponen kecil reuse === */
function FilterBar({
  filterType,
  setFilterType,
  selectedDate,
  setSelectedDate,
}) {
  return (
    <div className="flex flex-wrap gap-4 items-center bg-white p-4 border rounded-xl shadow-sm mb-6">
      <div className="flex items-center gap-2">
        <label className="text-gray-600 font-medium">Tipe:</label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border rounded-md px-2 py-1 text-sm"
        >
          <option value="Harian">Harian</option>
          <option value="Bulanan">Bulanan</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-gray-600 font-medium">Tanggal:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded-md px-2 py-1 text-sm"
        />
      </div>
    </div>
  );
}

function SummaryCards({ totalKotor, totalBersih }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4 mb-6">
      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <p className="text-gray-500">Pendapatan Kotor</p>
        <h2 className="text-3xl font-semibold text-blue-600 mt-1">
          Rp {totalKotor.toLocaleString("id-ID")}
        </h2>
      </div>
      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <p className="text-gray-500">Pendapatan Bersih (Komisi)</p>
        <h2 className="text-3xl font-semibold text-green-600 mt-1">
          Rp {totalBersih.toLocaleString("id-ID")}
        </h2>
      </div>
    </div>
  );
}

function RiwayatTable({ riwayat }) {
  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-100 text-gray-700 text-sm">
          <tr>
            <th className="p-3 border text-left">Tanggal</th>
            <th className="p-3 border text-left">Service</th>
            <th className="p-3 border text-right">Harga</th>
            <th className="p-3 border text-right">Komisi</th>
          </tr>
        </thead>
        <tbody>
          {riwayat.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center text-gray-500 p-4">
                Tidak ada data untuk periode ini.
              </td>
            </tr>
          ) : (
            riwayat.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="p-3 border text-sm text-gray-700">
                  {formatTanggalJam(r.tanggal)}
                </td>
                <td className="p-3 border">{r.service}</td>
                <td className="p-3 border text-right">
                  Rp {(r.harga ?? 0).toLocaleString("id-ID")}
                </td>
                <td className="p-3 border text-right text-green-600 font-semibold">
                  Rp {(r.komisi ?? 0).toLocaleString("id-ID")}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
