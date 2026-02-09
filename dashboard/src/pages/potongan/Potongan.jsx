import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import TableData from "../../components/TableData";
import ConfirmModal from "../../components/ConfirmModal";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import useFetchPotongan from "../../hooks/useFetchPotongan";
import { formatTanggal } from "../../utils/dateFormatter";
import { formatKasirID, formatCapsterID } from "../../utils/formatID";

export default function Potongan() {
  const [potongan, setPotongan] = useState([]);
  const [filterType, setFilterType] = useState("Bulanan");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [alertMsg, setAlertMsg] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const { deletePotongan, loading: deleting } = useFetchPotongan();

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);

        const periode =
          filterType === "Bulanan"
            ? selectedDate.slice(0, 7)
            : selectedDate.split("T")[0];

        const res = await fetch(`${API_URL}/potongan?periode=${periode}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const result = await res.json();
        setPotongan(result.success ? result.data : []);
        if (!result.success) setErrorMsg("Gagal memuat data potongan.");
      } catch {
        setErrorMsg("Terjadi kesalahan saat memuat data potongan.");
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [filterType, selectedDate]);

  useEffect(() => {
    const saved = localStorage.getItem("potonganMessage");
    if (saved) {
      setAlertMsg(JSON.parse(saved));
      localStorage.removeItem("potonganMessage");
      setTimeout(() => setAlertMsg(null), 4000);
    }
  }, []);

  const confirmDelete = (id) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    const response = await deletePotongan(deletingId);

    if (response.success) {
      setPotongan((prev) =>
        prev.filter((item) => item.id_potongan !== deletingId)
      );
      setAlertMsg({ type: "success", text: "Potongan berhasil dihapus!" });
    } else {
      setAlertMsg({ type: "error", text: "Gagal menghapus potongan." });
    }

    setConfirmOpen(false);
    setDeletingId(null);
    setTimeout(() => setAlertMsg(null), 4000);
  };

  return (
    <MainLayout current="Potongan">
      {(searchTerm) => {
        const keyword = searchTerm.toLowerCase();

        const filtered = potongan.filter((p) => {
          const nama =
            p.nama_capster || p.nama_kasir || p.nama_user || p.nama || "";

          return (
            nama.toLowerCase().includes(keyword) ||
            (p.nama_store || "").toLowerCase().includes(keyword) ||
            (p.keterangan || "").toLowerCase().includes(keyword) ||
            String(p.jumlah || "").includes(keyword) ||
            formatTanggal(p.tanggal).toLowerCase().includes(keyword)
          );
        });

        const columns = [
          { key: "no", label: "#" },
          { key: "id_pengguna", label: "ID Pegawai" },
          { key: "nama", label: "Nama" },
          { key: "nama_store", label: "Cabang" },
          { key: "keterangan", label: "Keterangan" },
          { key: "jumlah", label: "Jumlah Potongan" },
          { key: "tanggal", label: "Tanggal" },
          { key: "aksi", label: "Aksi" },
        ];

        const data = filtered.map((p, i) => {
          const nama =
            p.nama_capster || p.nama_kasir || p.nama_user || p.nama || "-";

          return {
            no: i + 1,
            id_pengguna: (
              <span className="font-semibold text-slate-700">
                {p.id_kasir
                  ? formatKasirID(p.id_kasir)
                  : p.id_capster
                  ? formatCapsterID(p.id_capster)
                  : "-"}
              </span>
            ),
            nama,
            nama_store: p.nama_store || "-",
            keterangan: p.keterangan || "-",
            jumlah: (
              <span className="text-red-600 font-medium">
                Rp {Number(p.jumlah).toLocaleString("id-ID")}
              </span>
            ),
            tanggal: formatTanggal(p.tanggal),
            aksi: (
              <div className="flex items-left justify-left gap-2">
                <button
                  onClick={() =>
                    (window.location.href = `/potongan/edit/${p.id_potongan}`)
                  }
                  className="p-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white rounded-md"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>

                <button
                  onClick={() => confirmDelete(p.id_potongan)}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                  title="Hapus"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ),
          };
        });

        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  Data Potongan Pegawai
                </h1>
                <p className="text-sm text-gray-500">
                  Lihat dan kelola potongan pegawai.
                </p>
              </div>

              <div className="flex justify-start sm:justify-end">
                <button
                  onClick={() => navigate("/potongan/add")}
                  className="flex items-center gap-2 bg-[#0e57b5] hover:bg-[#0b4894] 
                 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow"
                >
                  <Plus size={16} /> Tambah Potongan
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

            {/* FILTER TANGGAL BARU */}
            <div className="flex flex-wrap items-center gap-6 bg-white border border-gray-100 rounded-xl p-4">
              {/* Tipe */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Tipe:
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Harian">Harian</option>
                  <option value="Bulanan">Bulanan</option>
                </select>
              </div>

              {/* Input tanggal/bulan */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  {filterType === "Harian" ? "Tanggal:" : "Bulan:"}
                </label>

                {filterType === "Harian" ? (
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <input
                    type="month"
                    value={selectedDate.slice(0, 7)}
                    onChange={(e) => setSelectedDate(e.target.value + "-01")}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            </div>

            {loading ? (
              <p className="text-gray-500 italic">Memuat data potongan...</p>
            ) : errorMsg ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex gap-2">
                <AlertTriangle size={18} /> {errorMsg}
              </div>
            ) : (
              <TableData columns={columns} data={data} />
            )}

            <ConfirmModal
              open={confirmOpen}
              title="Konfirmasi Hapus Potongan"
              message="Apakah Anda yakin ingin menghapus potongan ini?"
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
