// src/pages/keuangan/Komisi.jsx
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import TableData from "../../components/TableData";
import ConfirmModal from "../../components/ConfirmModal";
import useFetchKomisi from "../../hooks/useFetchKomisi";
import useFetchKomisiSetting from "../../hooks/useFetchKomisiSetting";
import { Pencil, Trash2, Plus } from "lucide-react";
import { formatTanggalJam } from "../../utils/dateFormatter";

export default function Komisi() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  // FILTER
  const [filterType, setFilterType] = useState("Bulanan");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // FETCH DATA
  const { komisi, komisiDetail, loading, error } = useFetchKomisi(
    null,
    filterType,
    selectedDate
  );

  const data = role === "capster" ? komisiDetail : komisi;

  // FETCH KOMISI SETTING ADMIN
  const {
    data: komisiSetting,
    loading: settingsLoading,
    error: settingsError,
    deleteKomisi,
  } = useFetchKomisiSetting();

  // MODAL DELETE
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [notif, setNotif] = useState(null);

  const handleDelete = (id, storeName) => {
    setSelectedId(id);
    setSelectedStore(storeName);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteKomisi(selectedId);
      setNotif({
        type: "success",
        text: `Pengaturan komisi untuk "${selectedStore}" berhasil dihapus.`,
      });
    } catch {
      setNotif({ type: "error", text: "Gagal menghapus pengaturan komisi" });
    } finally {
      setShowModal(false);
      setTimeout(() => setNotif(null), 4000);
    }
  };

  return (
    <MainLayout current="komisi">
      {(searchTerm) => {
        if (role === "capster") {
          const filteredRiwayat = useMemo(() => {
            if (!data?.riwayat) return [];
            const date = new Date(selectedDate);

            return data.riwayat.filter((item) => {
              const itemDate = new Date(item.tanggal);
              return filterType === "Harian"
                ? itemDate.getDate() === date.getDate()
                : itemDate.getMonth() === date.getMonth();
            });
          }, [data, filterType, selectedDate]);

          const totalKotor = filteredRiwayat.reduce(
            (s, r) => s + (r.harga ?? 0),
            0
          );
          const totalBersih = filteredRiwayat.reduce(
            (s, r) => s + (r.komisi ?? 0),
            0
          );

          return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
              <h1 className="text-xl font-semibold text-slate-800">
                Komisi Saya
              </h1>
              <FilterBar
                filterType={filterType}
                setFilterType={setFilterType}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
              <SummaryCards totalKotor={totalKotor} totalBersih={totalBersih} />
              <RiwayatTable riwayat={filteredRiwayat} />
            </div>
          );
        }

        // ================= ADMIN VIEW =================
        const filteredRekap = data.filter(
          (k) =>
            k.nama_capster?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            k.nama_store?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const filteredSetting = komisiSetting.filter((s) =>
          s.nama_store.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-10">
            {/* ================== REKAP ================== */}
            <section className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <h1 className="text-xl font-semibold text-slate-800">
                    Rekap Komisi Kapster
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Rekap komisi seluruh capster per cabang.
                  </p>
                </div>
              </div>

              <FilterBar
                filterType={filterType}
                setFilterType={setFilterType}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />

              {loading ? (
                <p>Memuat data...</p>
              ) : (
                <KomisiAdmin data={filteredRekap} navigate={navigate} />
              )}
            </section>

            <div className="border-t border-gray-200" />

            {/* ================== PENGATURAN KOMISI ================== */}
            <section className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <h1 className="text-xl font-semibold text-slate-800">
                    Pengaturan Komisi Kapster
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Atur persentase komisi untuk setiap capster.
                  </p>
                </div>

                <button
                  onClick={() => navigate("/komisi/komisi-setting/add")}
                  className="flex items-center gap-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white px-4 py-2.5 rounded-xl text-sm font-medium"
                >
                  <Plus size={16} /> Tambah Komisi
                </button>
              </div>

              {notif && (
                <div
                  className={`px-4 py-3 rounded-lg text-sm font-medium border ${
                    notif.type === "success"
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  {notif.text}
                </div>
              )}

              {settingsLoading ? (
                <p>Memuat data komisi...</p>
              ) : settingsError ? (
                <p>{settingsError}</p>
              ) : (
                <KomisiSettingTable
                  data={filteredSetting}
                  handleDelete={handleDelete}
                  navigate={navigate}
                />
              )}

              <ConfirmModal
                open={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={confirmDelete}
                message={`Apakah yakin ingin menghapus komisi capster "${selectedStore}"?`}
              />
            </section>
          </div>
        );
      }}
    </MainLayout>
  );
}

/* ======================== SUB COMPONENTS ======================== */

function FilterBar({
  filterType,
  setFilterType,
  selectedDate,
  setSelectedDate,
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 bg-white border border-gray-100 rounded-xl p-4">
      <select
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
        className="border border-gray-100 rounded-md px-2 py-1 text-sm"
      >
        <option value="Harian">Harian</option>
        <option value="Bulanan">Bulanan</option>
      </select>

      <input
        type={filterType === "Harian" ? "date" : "month"}
        value={
          filterType === "Harian" ? selectedDate : selectedDate.slice(0, 7)
        }
        onChange={(e) =>
          setSelectedDate(
            filterType === "Harian" ? e.target.value : e.target.value + "-01"
          )
        }
        className="border border-gray-100 rounded-md px-2 py-1 text-sm"
      />
    </div>
  );
}

function KomisiAdmin({ data, navigate }) {
  const columns = [
    { key: "no", label: "#" },
    { key: "nama_capster", label: "Kapster" },
    { key: "nama_store", label: "Cabang" },
    { key: "total_komisi", label: "Total Komisi" },
    { key: "aksi", label: "Aksi" },
  ];

  const newData = data.map((k, i) => ({
    no: i + 1,
    nama_capster: k.nama_capster,
    nama_store: k.nama_store,
    total_komisi: (
      <span className="font-semibold text-green-600">
        Rp {Number(k.total_komisi).toLocaleString("id-ID")}
      </span>
    ),
    aksi: (
      <button
        onClick={() => navigate(`/komisi/${k.id_capster}`)}
        className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md"
      >
        Lihat
      </button>
    ),
  }));

  return <TableData columns={columns} data={newData} />;
}

function KomisiSettingTable({ data, navigate, handleDelete }) {
  const columns = [
    { key: "no", label: "#" },
    { key: "nama_capster", label: "Nama Kapster" },
    { key: "nama_store", label: "Cabang" },
    { key: "persentase_capster", label: "Persentase (%)" },
    { key: "updated_at", label: "Update" },
    { key: "aksi", label: "Aksi" },
  ];

  const tableData = data.map((item, i) => ({
    no: i + 1,
    nama_capster: item.nama_capster,
    nama_store: item.nama_store,
    updated_at: formatTanggalJam(item.updated_at),
    persentase_capster: (
      <span className="text-blue-600 font-medium">
        {Math.floor(item.persentase_capster)}%
      </span>
    ),
    aksi: (
      <div className="flex items-center gap-2">
        <button
          onClick={() =>
            navigate(`/komisi/komisi-setting/edit/${item.id_setting}`)
          }
          className="p-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white rounded-md"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => handleDelete(item.id_setting, item.nama_capster)}
          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
        >
          <Trash2 size={16} />
        </button>
      </div>
    ),
  }));

  return <TableData columns={columns} data={tableData} />;
}
