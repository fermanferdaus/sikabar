import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import MainLayout from "../../layouts/MainLayout";
import useFetchGajiSetting from "../../hooks/useFetchGajiSetting";
import useFetchBonus from "../../hooks/useFetchBonus";
import TableData from "../../components/TableData";
import ConfirmModal from "../../components/ConfirmModal";

import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatTanggal, formatPeriode } from "../../utils/dateFormatter";

export default function Gaji() {
  const {
    data: gaji,
    loading: loadGaji,
    deleteGaji,
    refresh: refreshGaji,
  } = useFetchGajiSetting();

  const {
    data: bonus,
    loading: loadBonus,
    deleteBonus,
    refresh: refreshBonus,
    updateBonusStatus,
  } = useFetchBonus();

  const [showModal, setShowModal] = useState(false);
  const [targetType, setTargetType] = useState("");
  const [targetId, setTargetId] = useState(null);
  const [notif, setNotif] = useState(null);

  const openModal = (type, id) => {
    setTargetType(type);
    setTargetId(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTargetType("");
    setTargetId(null);
  };

  const handleConfirmDelete = async () => {
    let res;
    if (targetType === "gaji") {
      res = await deleteGaji(targetId);
      await refreshGaji();
    } else {
      res = await deleteBonus(targetId);
      await refreshBonus();
    }

    setNotif({
      type: res?.success ? "success" : "error",
      text: res?.success
        ? targetType === "gaji"
          ? "Data gaji berhasil dihapus."
          : "Data bonus berhasil dihapus."
        : res?.message || "Gagal menghapus data.",
    });

    closeModal();
    setTimeout(() => setNotif(null), 4000);
  };

  useEffect(() => {
    const msg =
      localStorage.getItem("gajiMessage") ||
      localStorage.getItem("bonusMessage");
    if (msg) {
      setNotif(JSON.parse(msg));
      localStorage.removeItem("gajiMessage");
      localStorage.removeItem("bonusMessage");
      setTimeout(() => setNotif(null), 4000);
    }
  }, []);

  return (
    <MainLayout current="gaji">
      {(searchTerm) => {
        const search = searchTerm.toLowerCase();

        const filteredGaji = gaji.filter(
          (g) =>
            g.nama?.toLowerCase().includes(search) ||
            g.jabatan?.toLowerCase().includes(search) ||
            g.nama_store?.toLowerCase().includes(search) ||
            g.periode?.toLowerCase().includes(search)
        );

        const filteredBonus = bonus.filter(
          (b) =>
            b.nama?.toLowerCase().includes(search) ||
            b.jabatan?.toLowerCase().includes(search) ||
            b.judul_bonus?.toLowerCase().includes(search) ||
            b.keterangan?.toLowerCase().includes(search) ||
            b.periode?.toLowerCase().includes(search)
        );

        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-gray-100 pb-3">
              <div>
                <h1 className="text-lg font-semibold text-slate-700">
                  Daftar Gaji Pokok
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Kelola gaji untuk setiap pegawai.
                </p>
              </div>

              <div className="order-1 sm:order-2 w-full sm:w-auto flex justify-start sm:justify-end">
                <Link
                  to="/gaji/add"
                  className="flex items-center gap-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all"
                >
                  <Plus size={16} />
                  Tambah Gaji
                </Link>
              </div>
            </div>

            {/* ALERT NOTIF */}
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

            {/* ===== SECTION GAJI POKOK ===== */}
            <section className="space-y-6">
              {loadGaji ? (
                <p className="text-gray-500">Memuat data gaji...</p>
              ) : filteredGaji.length === 0 ? (
                <p className="text-gray-500 italic">Tidak ada data.</p>
              ) : (
                <TableData
                  columns={[
                    { key: "nama", label: "Nama" },
                    { key: "jabatan", label: "Jabatan" },
                    { key: "nama_store", label: "Cabang" },
                    { key: "gaji_pokok", label: "Gaji Pokok" },
                    { key: "periode", label: "Periode" },
                    { key: "updated_at", label: "Diperbarui" },
                    { key: "aksi", label: "Aksi" },
                  ]}
                  data={filteredGaji.map((g) => ({
                    ...g,
                    gaji_pokok:
                      "Rp " + Number(g.gaji_pokok || 0).toLocaleString("id-ID"),
                    updated_at: g.updated_at
                      ? formatTanggal(g.updated_at.replace(" ", "T"))
                      : "-",
                    aksi: (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            (window.location.href = `/gaji/edit/${g.id_gaji_setting}`)
                          }
                          className="p-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white rounded-md"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => openModal("gaji", g.id_gaji_setting)}
                          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ),
                  }))}
                />
              )}
            </section>

            {/* GARIS PEMBATAS */}
            <div className="border-t border-gray-100" />

            {/* ===== SECTION BONUS ===== */}
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-gray-100 pb-3">
                <div>
                  <h1 className="text-lg font-semibold text-slate-700">
                    Daftar Bonus
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Kelola Bonus untuk setiap pegawai.
                  </p>
                </div>
                <div className="order-1 sm:order-2 w-full sm:w-auto flex justify-start sm:justify-end">
                  <Link
                    to="/gaji/bonus/add"
                    className="flex items-center gap-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all"
                  >
                    <Plus size={16} />
                    Tambah Bonus
                  </Link>
                </div>
              </div>

              {loadBonus ? (
                <p className="text-gray-500">Memuat data bonus...</p>
              ) : filteredBonus.length === 0 ? (
                <p className="text-gray-500 italic">Tidak ada data.</p>
              ) : (
                <TableData
                  columns={[
                    { key: "nama", label: "Nama" },
                    { key: "jabatan", label: "Jabatan" },
                    { key: "judul_bonus", label: "Judul" },
                    { key: "jumlah", label: "Jumlah" },
                    { key: "periode", label: "Periode" },
                    { key: "tanggal_diberikan", label: "Tanggal Diberikan" },
                    { key: "status", label: "Status" },
                    { key: "keterangan", label: "Keterangan" },
                    { key: "aksi", label: "Aksi" },
                  ]}
                  data={filteredBonus.map((b) => ({
                    ...b,
                    jumlah:
                      "Rp " + Number(b.jumlah || 0).toLocaleString("id-ID"),
                    periode: formatPeriode(b.periode),
                    tanggal_diberikan: b.tanggal
                      ? formatTanggal(b.tanggal)
                      : "-",
                    status: (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          b.status === "sudah_diberikan"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {b.status === "sudah_diberikan"
                          ? "Sudah Diberikan"
                          : "Belum Diberikan"}
                      </span>
                    ),
                    aksi: (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            (window.location.href = `/gaji/bonus/edit/${b.id_bonus}`)
                          }
                          className="p-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white rounded-md"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => openModal("bonus", b.id_bonus)}
                          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                          title="Hapus Bonus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ),
                  }))}
                />
              )}
            </section>

            {/* ===== MODAL HAPUS ===== */}
            <ConfirmModal
              open={showModal}
              onClose={closeModal}
              onConfirm={handleConfirmDelete}
              message={
                targetType === "gaji"
                  ? "Apakah Anda yakin ingin menghapus data gaji ini?"
                  : "Apakah Anda yakin ingin menghapus data bonus ini?"
              }
            />
          </div>
        );
      }}
    </MainLayout>
  );
}
