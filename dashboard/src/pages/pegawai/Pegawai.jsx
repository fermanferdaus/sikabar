import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import TableData from "../../components/TableData";
import ConfirmModal from "../../components/ConfirmModal";
import useFetchCapster from "../../hooks/useFetchCapster";
import useCapsterActions from "../../hooks/useCapsterActions";
import { useKasir } from "../../hooks/useKasir";
import { formatCapsterID, formatKasirID } from "../../utils/formatID";
import { Pencil, Trash2, Plus } from "lucide-react";

export default function Pegawai() {
  const role = localStorage.getItem("role");

  const {
    capsters,
    loading: capsterLoading,
    error: capsterError,
  } = useFetchCapster();
  const { deleteCapster } = useCapsterActions();

  const [capsterAlert, setCapsterAlert] = useState(null);
  const [showCapsterModal, setShowCapsterModal] = useState(false);
  const [selectedCapster, setSelectedCapster] = useState(null);
  const [deletingCapster, setDeletingCapster] = useState(false);

  useEffect(() => {
    const message = localStorage.getItem("capsterMessage");
    if (message) {
      setCapsterAlert(JSON.parse(message));
      localStorage.removeItem("capsterMessage");
      const timer = setTimeout(() => setCapsterAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  const openDeleteCapsterModal = (capster) => {
    setSelectedCapster(capster);
    setShowCapsterModal(true);
  };

  const confirmDeleteCapster = async () => {
    if (!selectedCapster) return;
    setDeletingCapster(true);
    try {
      await deleteCapster(selectedCapster.id_capster);
      setShowCapsterModal(false);
      setSelectedCapster(null);
      setCapsterAlert({
        type: "success",
        text: `Kapster "${selectedCapster.nama_capster}" berhasil dihapus.`,
      });
      setTimeout(() => setCapsterAlert(null), 4000);
    } catch (err) {
      setCapsterAlert({
        type: "error",
        text: "Gagal menghapus kapster: " + err.message,
      });
      setTimeout(() => setCapsterAlert(null), 4000);
    } finally {
      setDeletingCapster(false);
    }
  };

  const {
    kasir,
    loading: kasirLoading,
    error: kasirError,
    deleteKasir,
    alert: kasirAlert,
    setAlert: setKasirAlert,
  } = useKasir();

  const [showKasirModal, setShowKasirModal] = useState(false);
  const [selectedKasir, setSelectedKasir] = useState(null);
  const [deletingKasir, setDeletingKasir] = useState(false);

  const openDeleteKasirModal = (kasirItem) => {
    setSelectedKasir(kasirItem);
    setShowKasirModal(true);
  };

  const confirmDeleteKasir = async () => {
    if (!selectedKasir) return;
    setDeletingKasir(true);

    try {
      await deleteKasir(selectedKasir.id_kasir);

      setShowKasirModal(false);
      setSelectedKasir(null);
      setKasirAlert({
        type: "success",
        text: `Kasir "${selectedKasir.nama_kasir}" berhasil dihapus.`,
      });

      setTimeout(() => setKasirAlert(null), 4000);
    } catch (err) {
      setKasirAlert({
        type: "error",
        text: "Gagal menghapus kasir: " + err.message,
      });
      setTimeout(() => setKasirAlert(null), 4000);
    } finally {
      setDeletingKasir(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <MainLayout current="pegawai">
      {(searchTerm) => {
        // ===================== FILTER DATA =====================
        const filteredCapster = (capsters || []).filter(
          (c) =>
            c.nama_capster.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.nama_store.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const filteredKasir = (kasir || []).filter(
          (k) =>
            k.nama_kasir.toLowerCase().includes(searchTerm.toLowerCase()) ||
            k.nama_store.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // ===================== KOLOM & DATA CAPSTER =====================
        const capsterColumns = [
          { key: "no", label: "#" },
          { key: "id_capster", label: "ID Pegawai" },
          { key: "nama_capster", label: "Nama" },
          { key: "nama_store", label: "Cabang" },
          { key: "telepon", label: "Telepon" },
          { key: "email", label: "Email" },
          { key: "alamat", label: "Alamat" },
          { key: "jenis_kelamin", label: "Gender" },
          { key: "ttl", label: "Tempat & Tanggal Lahir" },
        ];
        if (role === "admin")
          capsterColumns.push({ key: "aksi", label: "Aksi" });

        const capsterData = filteredCapster.map((c, i) => {
          const formattedDate = c.tanggal_lahir
            ? formatDate(c.tanggal_lahir)
            : null;

          return {
            no: i + 1,
            id_capster: (
              <span className="font-semibold text-slate-700">
                {formatCapsterID(c.id_capster)}
              </span>
            ),
            nama_capster: c.nama_capster,
            nama_store: c.nama_store,
            telepon: c.telepon || "-",
            email: c.email || "-",
            alamat: c.alamat || "-",
            jenis_kelamin: c.jenis_kelamin || "-",
            ttl:
              c.tempat_lahir || formattedDate
                ? `${c.tempat_lahir || "-"}, ${formattedDate || "-"}`
                : "-",
            ...(role === "admin" && {
              aksi: (
                <div className="flex items-center justify-left gap-2">
                  <Link
                    to={`/pegawai/capster/edit/${c.id_capster}`}
                    className="p-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white rounded-md"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </Link>
                  <button
                    onClick={() => openDeleteCapsterModal(c)}
                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                    title="Hapus"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ),
            }),
          };
        });

        // ===================== KOLOM & DATA KASIR =====================
        const kasirColumns = [
          { key: "no", label: "#" },
          { key: "id_kasir", label: "ID Pegawai" },
          { key: "nama_kasir", label: "Nama" },
          { key: "nama_store", label: "Cabang" },
          { key: "telepon", label: "Telepon" },
          { key: "email", label: "Email" },
          { key: "alamat", label: "Alamat" },
          { key: "jenis_kelamin", label: "Gender" },
          { key: "ttl", label: "Tempat & Tanggal Lahir" },
        ];
        if (role === "admin") kasirColumns.push({ key: "aksi", label: "Aksi" });

        const kasirData = filteredKasir.map((k, i) => ({
          no: i + 1,
          id_kasir: (
            <span className="font-semibold text-slate-700">
              {formatKasirID(k.id_kasir)}
            </span>
          ),
          nama_kasir: k.nama_kasir,
          nama_store: k.nama_store,
          telepon: k.telepon || "-",
          email: k.email || "-",
          alamat: k.alamat || "-",
          jenis_kelamin: k.jenis_kelamin || "-",
          ttl: `${k.tempat_lahir || "-"}, ${formatDate(k.tanggal_lahir)}`,
          ...(role === "admin" && {
            aksi: (
              <div className="flex items-center gap-2">
                <Link
                  to={`/pegawai/kasir/edit/${k.id_kasir}`}
                  className="p-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white rounded-md"
                  title="Edit"
                >
                  <Pencil size={16} />
                </Link>
                <button
                  onClick={() => openDeleteKasirModal(k)}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                  title="Hapus"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ),
          }),
        }));

        // ===================== LAYOUT 1 CARD MENYATU =====================
        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">
            {/* ========= SECTION CAPSTER (ATAS) ========= */}
            <section className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-gray-100 pb-4">
                <div>
                  <h1 className="text-xl font-semibold text-slate-800">
                    Data Kapster
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Kelola daftar kapster beserta data diri lengkap mereka.
                  </p>
                </div>

                {role === "admin" && (
                  <div className="order-1 sm:order-2 w-full sm:w-auto flex justify-start sm:justify-end">
                    <Link
                      to="/pegawai/capster/add"
                      className="flex items-center gap-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all"
                    >
                      <Plus size={16} />
                      Tambah Kapster
                    </Link>
                  </div>
                )}
              </div>

              {/* Alert Capster */}
              {capsterAlert && (
                <div
                  className={`px-4 py-3 rounded-lg text-sm font-medium border ${
                    capsterAlert.type === "success"
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  {capsterAlert.text}
                </div>
              )}

              {/* Tabel Capster */}
              {capsterLoading ? (
                <p className="text-gray-500">Memuat data kapster...</p>
              ) : capsterError ? (
                <p className="text-red-500">{capsterError}</p>
              ) : filteredCapster.length === 0 ? (
                <p className="text-gray-500">Kapster tidak ditemukan.</p>
              ) : (
                <TableData
                  columns={capsterColumns}
                  data={capsterData}
                  searchTerm={searchTerm}
                />
              )}
            </section>

            {/* Garis pemisah */}
            <div className="border-t border-gray-100" />

            {/* ========= SECTION KASIR (BAWAH) ========= */}
            <section className="space-y-6 pt-2">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-gray-100 pb-4">
                <div>
                  <h1 className="text-xl font-semibold text-slate-800">
                    Data Kasir
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Kelola kasir untuk setiap cabang barbershop.
                  </p>
                </div>

                {role === "admin" && (
                  <div className="order-1 sm:order-2 w-full sm:w-auto flex justify-start sm:justify-end">
                    <Link
                      to="/pegawai/kasir/add"
                      className="flex items-center gap-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all"
                    >
                      <Plus size={16} />
                      Tambah Kasir
                    </Link>
                  </div>
                )}
              </div>

              {/* Alert Kasir */}
              {kasirAlert && (
                <div
                  className={`px-4 py-3 rounded-lg text-sm font-medium border ${
                    kasirAlert.type === "success"
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  {kasirAlert.text}
                </div>
              )}

              {/* Tabel Kasir */}
              {kasirLoading ? (
                <p className="text-gray-500">Memuat data kasir...</p>
              ) : kasirError ? (
                <p className="text-red-500">{kasirError}</p>
              ) : filteredKasir.length === 0 ? (
                <p className="text-gray-500">Kasir tidak ditemukan.</p>
              ) : (
                <TableData
                  columns={kasirColumns}
                  data={kasirData}
                  searchTerm={searchTerm}
                />
              )}
            </section>

            {/* Modal Hapus Capster */}
            <ConfirmModal
              open={showCapsterModal}
              onClose={() => setShowCapsterModal(false)}
              onConfirm={confirmDeleteCapster}
              loading={deletingCapster}
              message={
                selectedCapster
                  ? `Apakah Anda yakin ingin menghapus kapster "${selectedCapster.nama_capster}"?`
                  : "Apakah Anda yakin ingin menghapus data ini?"
              }
            />

            {/* Modal Hapus Kasir */}
            <ConfirmModal
              open={showKasirModal}
              onClose={() => setShowKasirModal(false)}
              onConfirm={confirmDeleteKasir}
              loading={deletingKasir}
              message={
                selectedKasir
                  ? `Apakah Anda yakin ingin menghapus kasir "${selectedKasir.nama_kasir}"?`
                  : "Apakah Anda yakin ingin menghapus data ini?"
              }
            />
          </div>
        );
      }}
    </MainLayout>
  );
}
