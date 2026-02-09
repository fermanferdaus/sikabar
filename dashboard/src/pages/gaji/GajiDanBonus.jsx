import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchGajiSetting from "../../hooks/useFetchGajiSetting";
import useFetchBonus from "../../hooks/useFetchBonus";
import TableData from "../../components/TableData";
import ConfirmModal from "../../components/ConfirmModal";
import { formatKasirID, formatCapsterID } from "../../utils/formatID";
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
    updateBonusStatus,
    refresh: refreshBonus,
  } = useFetchBonus();

  const [showModal, setShowModal] = useState(false);
  const [targetType, setTargetType] = useState("");
  const [targetId, setTargetId] = useState(null);
  const [notif, setNotif] = useState(null);

  const [bonusFilterType, setBonusFilterType] = useState("Bulanan");
  const [bonusSelectedDate, setBonusSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

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
            g.periode?.toLowerCase().includes(search),
        );

        const filteredBonus = bonus.filter((b) => {
          const keywordMatch =
            b.nama?.toLowerCase().includes(search) ||
            b.jabatan?.toLowerCase().includes(search) ||
            b.judul_bonus?.toLowerCase().includes(search) ||
            b.keterangan?.toLowerCase().includes(search) ||
            b.periode?.toLowerCase().includes(search);

          // filter periode
          if (!b.periode) return false;

          const periodeBonus = b.periode.slice(0, 7); // YYYY-MM
          const selectedPeriode =
            bonusFilterType === "Bulanan"
              ? bonusSelectedDate.slice(0, 7)
              : bonusSelectedDate;

          const periodeMatch =
            bonusFilterType === "Bulanan"
              ? periodeBonus === selectedPeriode
              : b.periode === selectedPeriode;

          return keywordMatch && periodeMatch;
        });

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
                    { key: "no", label: "#" },
                    { key: "id_pengguna", label: "ID Pegawai" },
                    { key: "nama", label: "Nama" },
                    { key: "jabatan", label: "Posisi" },
                    { key: "nama_store", label: "Cabang" },
                    { key: "gaji_pokok", label: "Gaji Pokok" },
                    { key: "periode", label: "Periode" },
                    { key: "updated_at", label: "Diperbarui" },
                    { key: "aksi", label: "Aksi" },
                  ]}
                  data={filteredGaji.map((g, i) => {
                    let idPengguna = "-";

                    if (g.id_kasir) {
                      idPengguna = formatKasirID(g.id_kasir);
                    }

                    if (g.id_capster) {
                      idPengguna = formatCapsterID(g.id_capster);
                    }

                    return {
                      ...g,
                      no: i + 1,
                      id_pengguna: (
                        <span className="font-semibold text-slate-700">
                          {idPengguna}
                        </span>
                      ),
                      gaji_pokok:
                        "Rp " +
                        Number(g.gaji_pokok || 0).toLocaleString("id-ID"),
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
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => openModal("gaji", g.id_gaji_setting)}
                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ),
                    };
                  })}
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

              <div className="flex flex-wrap items-center gap-6 bg-white border border-gray-100 rounded-xl p-4">
                {/* Input Bulan / Tanggal */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Periode Bonus:
                  </label>

                  {bonusFilterType === "Harian" ? (
                    <input
                      type="date"
                      value={bonusSelectedDate}
                      onChange={(e) => setBonusSelectedDate(e.target.value)}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  ) : (
                    <input
                      type="month"
                      value={bonusSelectedDate.slice(0, 7)}
                      onChange={(e) =>
                        setBonusSelectedDate(e.target.value + "-01")
                      }
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  )}
                </div>
              </div>

              {loadBonus ? (
                <p className="text-gray-500">Memuat data bonus...</p>
              ) : filteredBonus.length === 0 ? (
                <p className="text-gray-500 italic">Tidak ada data.</p>
              ) : (
                <TableData
                  columns={[
                    { key: "no", label: "#" },
                    { key: "id_pengguna", label: "ID Pegawai" },
                    { key: "nama", label: "Nama" },
                    { key: "jabatan", label: "Posisi" },
                    { key: "judul_bonus", label: "Judul" },
                    { key: "jumlah", label: "Jumlah" },
                    { key: "periode", label: "Periode Bonus" },
                    { key: "status", label: "Status" },
                    { key: "keterangan", label: "Keterangan" },
                    { key: "aksi", label: "Aksi" },
                  ]}
                  data={filteredBonus.map((b, i) => {
                    let idPengguna = "-";

                    if (b.id_kasir) {
                      idPengguna = formatKasirID(b.id_kasir);
                    }

                    if (b.id_capster) {
                      idPengguna = formatCapsterID(b.id_capster);
                    }

                    return {
                      ...b,
                      no: i + 1,
                      id_pengguna: (
                        <span className="font-semibold text-slate-700">
                          {idPengguna}
                        </span>
                      ),
                      jumlah:
                        "Rp " + Number(b.jumlah || 0).toLocaleString("id-ID"),
                      periode: formatPeriode(b.periode),
                      status: (
                        <select
                          value={b.status}
                          onChange={async (e) => {
                            const res = await updateBonusStatus(
                              b.id_bonus,
                              e.target.value,
                            );

                            setNotif({
                              type: res.success ? "success" : "error",
                              text: res.message,
                            });

                            setTimeout(() => setNotif(null), 3000);
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer
                          ${
                            b.status === "sudah_diberikan"
                              ? "bg-green-100 text-green-700 border-green-300"
                              : "bg-yellow-100 text-yellow-700 border-yellow-300"
                          }
                        `}
                        >
                          <option value="belum_diberikan">
                            Belum Diberikan
                          </option>
                          <option value="sudah_diberikan">
                            Sudah Diberikan
                          </option>
                        </select>
                      ),
                      aksi: (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              (window.location.href = `/gaji/bonus/edit/${b.id_bonus}`)
                            }
                            className="p-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white rounded-md"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => openModal("bonus", b.id_bonus)}
                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ),
                    };
                  })}
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
