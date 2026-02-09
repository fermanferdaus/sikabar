import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import TableData from "../../components/TableData";
import ConfirmModal from "../../components/ConfirmModal";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { formatTanggal } from "../../utils/dateFormatter";
import { formatKasirID, formatCapsterID } from "../../utils/formatID";

export default function Kasbon() {
  const [kasbon, setKasbon] = useState([]);
  const [filterType, setFilterType] = useState("Bulanan");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [alertMsg, setAlertMsg] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchKasbon = async () => {
      try {
        setLoading(true);
        const periode =
          filterType === "Bulanan" ? selectedDate.slice(0, 7) : selectedDate;

        const res = await fetch(`${API_URL}/kasbon?periode=${periode}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const result = await res.json();
        if (result.success) setKasbon(result.data || []);
        else {
          setKasbon([]);
          setErrorMsg("Gagal memuat data kasbon dari server.");
        }
      } catch (err) {
        setErrorMsg("Terjadi kesalahan saat memuat data kasbon.");
      } finally {
        setLoading(false);
      }
    };

    fetchKasbon();
  }, [filterType, selectedDate]);

  useEffect(() => {
    const savedMsg = localStorage.getItem("kasbonMessage");
    if (savedMsg) {
      setAlertMsg(JSON.parse(savedMsg));
      localStorage.removeItem("kasbonMessage");
      setTimeout(() => setAlertMsg(null), 4000);
    }
  }, []);

  const confirmDelete = (id) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/kasbon/${deletingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();
      if (result.success) {
        setKasbon((prev) =>
          prev.filter((item) => item.id_kasbon !== deletingId)
        );
        setAlertMsg({ type: "success", text: "Kasbon berhasil dihapus!" });
      } else {
        setAlertMsg({ type: "error", text: "Gagal menghapus kasbon." });
      }
    } catch {
      setAlertMsg({
        type: "error",
        text: "Terjadi kesalahan saat menghapus kasbon.",
      });
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setTimeout(() => setAlertMsg(null), 4000);
    }
  };

  return (
    <MainLayout current="Kasbon">
      {(searchTerm) => {
        const keyword = searchTerm.toLowerCase();

        const filtered = kasbon.filter((k) => {
          return (
            (k.nama || "").toLowerCase().includes(keyword) ||
            (k.nama_store || "").toLowerCase().includes(keyword) ||
            (k.keterangan || "").toLowerCase().includes(keyword) ||
            (k.status || "").toLowerCase().includes(keyword) ||
            String(k.jumlah_total || "").includes(keyword) ||
            String(k.sisa_kasbon || "").includes(keyword) ||
            formatTanggal(k.tanggal).toLowerCase().includes(keyword)
          );
        });

        const columns = [
          { key: "no", label: "#" },
          { key: "id_pengguna", label: "ID Pegawai" },
          { key: "nama", label: "Nama" },
          { key: "nama_store", label: "Cabang" },
          { key: "jumlah_total", label: "Total Kasbon" },
          { key: "sisa_kasbon", label: "Sisa Kasbon" },
          { key: "jumlah_cicilan", label: "Cicilan" },
          { key: "cicilan_terbayar", label: "Terbayar" },
          { key: "keterangan", label: "Keterangan" },
          { key: "tanggal", label: "Tanggal" },
          { key: "aksi", label: "Aksi" },
        ];

        const data = filtered.map((k, i) => ({
          no: i + 1,
          id_pengguna: (
            <span className="font-semibold text-slate-700">
              {k.id_kasir
                ? formatKasirID(k.id_kasir)
                : k.id_capster
                ? formatCapsterID(k.id_capster)
                : "-"}
            </span>
          ),
          nama: k.nama,
          nama_store: k.nama_store,
          jumlah_total: (
            <span className="text-blue-600 font-medium">
              Rp {Number(k.jumlah_total).toLocaleString("id-ID")}
            </span>
          ),
          sisa_kasbon: (
            <span
              className={`font-semibold ${
                Number(k.sisa_kasbon) > 0 ? "text-orange-600" : "text-green-600"
              }`}
            >
              Rp {Number(k.sisa_kasbon).toLocaleString("id-ID")}
            </span>
          ),
          jumlah_cicilan: k.jumlah_cicilan,
          cicilan_terbayar: k.cicilan_terbayar,
          keterangan: k.keterangan || "-",
          tanggal: formatTanggal(k.tanggal),
          aksi: (
            <div className="flex items-left justify-left gap-2">
              <button
                onClick={() =>
                  (window.location.href = `/kasbon/edit/${k.id_kasbon}`)
                }
                className="p-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white rounded-md"
              >
                <Pencil size={16} />
              </button>

              <button
                onClick={() => confirmDelete(k.id_kasbon)}
                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ),
        }));

        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  Data Kasbon Pegawai
                </h1>
                <p className="text-sm text-gray-500">
                  Lihat dan kelola kasbon pegawai.
                </p>
              </div>

              <div className="flex justify-start sm:justify-end w-auto">
                <button
                  onClick={() => navigate("/kasbon/add")}
                  className="flex items-center gap-2 bg-[#0e57b5] hover:bg-[#0b4894] 
                 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm"
                >
                  <Plus size={16} /> Tambah Kasbon
                </button>
              </div>
            </div>

            {alertMsg && (
              <div
                className={`px-4 py-3 rounded-lg text-sm font-medium border ${
                  alertMsg.type === "success"
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {alertMsg.text}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-6 bg-white border border-gray-100 rounded-xl p-4">
              {/* Tipe Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Tipe:
                </label>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm 
                 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Harian">Harian</option>
                  <option value="Bulanan">Bulanan</option>
                </select>
              </div>

              {/* Input Tanggal / Bulan */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  {filterType === "Harian" ? "Tanggal:" : "Bulan:"}
                </label>

                {filterType === "Harian" ? (
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm
                   focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                ) : (
                  <input
                    type="month"
                    value={selectedDate.slice(0, 7)}
                    onChange={(e) => setSelectedDate(e.target.value + "-01")}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm
                   focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                )}
              </div>
            </div>

            {loading ? (
              <p className="text-gray-500 italic">Memuat data kasbon...</p>
            ) : errorMsg ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex gap-2">
                <AlertTriangle size={18} /> {errorMsg}
              </div>
            ) : (
              <TableData columns={columns} data={data} />
            )}

            <ConfirmModal
              open={confirmOpen}
              title="Konfirmasi Hapus Kasbon"
              message="Apakah Anda yakin ingin menghapus kasbon ini?"
              onClose={() => setConfirmOpen(false)}
              onConfirm={handleDelete}
              loading={deleting}
            />
          </div>
        );
      }}
    </MainLayout>
  );
}
