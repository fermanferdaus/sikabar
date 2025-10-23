import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import MainLayout from "../../layouts/MainLayout";
import useFetchKomisi from "../../hooks/useFetchKomisi";
import { formatTanggalJam } from "../../utils/dateFormatter";
import TableData from "../../components/TableData";
import { ArrowLeft } from "lucide-react";

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

  return (
    <MainLayout current="komisi">
      {(searchTerm) => {
        const filteredRiwayat = useMemo(() => {
          if (!komisi?.riwayat) return [];
          const date = new Date(selectedDate);
          return komisi.riwayat
            .filter((item) => {
              const itemDate = new Date(item.tanggal);
              return filterType === "Harian"
                ? itemDate.getDate() === date.getDate() &&
                    itemDate.getMonth() === date.getMonth() &&
                    itemDate.getFullYear() === date.getFullYear()
                : itemDate.getMonth() === date.getMonth() &&
                    itemDate.getFullYear() === date.getFullYear();
            })
            .filter((r) =>
              r.service?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }, [komisi, selectedDate, filterType, searchTerm]);

        const totalKotor = filteredRiwayat.reduce(
          (sum, r) => sum + (r.harga ?? 0),
          0
        );
        const totalBersih = filteredRiwayat.reduce(
          (sum, r) => sum + (r.komisi ?? 0),
          0
        );

        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6 transition-all duration-300">
            {/* === Header === */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  Komisi {komisi?.nama_capster || ""}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Riwayat komisi capster berdasarkan periode harian atau
                  bulanan.
                </p>
              </div>

              <button
                onClick={() => navigate("/komisi")}
                className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2.5 rounded-lg font-medium text-sm transition-all"
              >
                <ArrowLeft size={16} /> Kembali
              </button>
            </div>

            {/* === Filter === */}
            <div className="flex flex-wrap items-center gap-4 bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <label className="text-gray-600 font-medium text-sm">
                  Tipe:
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Harian">Harian</option>
                  <option value="Bulanan">Bulanan</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-gray-600 font-medium text-sm">
                  Tanggal:
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* === Konten === */}
            {loading ? (
              <p className="text-gray-500">Memuat data...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <>
                <SummaryCards
                  totalKotor={totalKotor}
                  totalBersih={totalBersih}
                />
                <RiwayatTable riwayat={filteredRiwayat} />
              </>
            )}
          </div>
        );
      }}
    </MainLayout>
  );
}

function SummaryCards({ totalKotor, totalBersih }) {
  return (
    <div className="grid sm:grid-cols-2 gap-6 mb-2">
      <div className="p-5 bg-white shadow-sm rounded-xl text-center transition hover:-translate-y-1 hover:shadow-md duration-300">
        <p className="text-gray-500">Pendapatan Kotor</p>
        <h2 className="text-3xl font-bold text-blue-600 mt-1">
          Rp {totalKotor.toLocaleString("id-ID")}
        </h2>
      </div>
      <div className="p-5 bg-white shadow-sm rounded-xl text-center transition hover:-translate-y-1 hover:shadow-md duration-300">
        <p className="text-gray-500">Pendapatan Bersih (Komisi)</p>
        <h2 className="text-3xl font-bold text-green-600 mt-1">
          Rp {totalBersih.toLocaleString("id-ID")}
        </h2>
      </div>
    </div>
  );
}

function RiwayatTable({ riwayat }) {
  if (!riwayat || riwayat.length === 0)
    return (
      <p className="text-gray-500 italic text-center py-4">
        Tidak ada data untuk periode ini.
      </p>
    );

  const columns = [
    { key: "no", label: "#" },
    { key: "tanggal", label: "Tanggal" },
    { key: "service", label: "Layanan" },
    { key: "harga", label: "Harga" },
    { key: "komisi", label: "Komisi" },
  ];

  const data = riwayat.map((r, i) => ({
    no: i + 1,
    tanggal: formatTanggalJam(r.tanggal),
    service: r.service,
    harga: (
      <div className="text-left">
        Rp {(r.harga ?? 0).toLocaleString("id-ID")}
      </div>
    ),
    komisi: (
      <div className="text-left text-green-600 font-semibold">
        Rp {(r.komisi ?? 0).toLocaleString("id-ID")}
      </div>
    ),
  }));

  return <TableData columns={columns} data={data} />;
}
