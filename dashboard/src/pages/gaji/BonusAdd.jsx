import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchBonus from "../../hooks/useFetchBonus";

export default function BonusAdd() {
  const navigate = useNavigate();
  const { saveBonus } = useFetchBonus();

  const [roleType, setRoleType] = useState("capster");
  const [capsters, setCapsters] = useState([]);
  const [kasirs, setKasirs] = useState([]);

  const [form, setForm] = useState({
    id_capster: "",
    id_kasir: "",
    judul_bonus: "",
    jumlah: "",
    jumlahFormatted: "",
    periode: "",
    keterangan: "",
  });

  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  /* ========================================================
     🔹 Ambil data Capster & Kasir (VERSI BARU)
  ======================================================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [resCap, resKas] = await Promise.all([
          fetch(`${API_URL}/capster`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/kasir`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const capData = await resCap.json();
        const kasData = await resKas.json();

        setCapsters(capData || []);
        setKasirs(kasData || []);
      } catch (err) {
        console.error("❌ Gagal ambil data capster/kasir:", err);
        setErrorMsg("Gagal memuat data capster & kasir.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ========================================================
     💰 Format angka ke Rupiah
  ======================================================== */
  const formatRupiah = (value) => {
    const number = value.replace(/\D/g, "");
    return number ? `Rp${Number(number).toLocaleString("id-ID")}` : "";
  };

  const handleJumlahChange = (e) => {
    const numericValue = e.target.value.replace(/\D/g, "");
    setForm({
      ...form,
      jumlah: numericValue,
      jumlahFormatted: formatRupiah(numericValue),
    });
  };

  /* ========================================================
     💾 Submit handler (VERSI BARU)
  ======================================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.judul_bonus ||
      !form.jumlah ||
      (roleType === "capster" && !form.id_capster) ||
      (roleType === "kasir" && !form.id_kasir)
    ) {
      setErrorMsg("Semua kolom wajib diisi!");
      return;
    }

    setLoadingSubmit(true);
    setErrorMsg(null);

    const payload = {
      id_capster: roleType === "capster" ? form.id_capster : null,
      id_kasir: roleType === "kasir" ? form.id_kasir : null,
      judul_bonus: form.judul_bonus,
      jumlah: form.jumlah,
      periode: form.periode,
      keterangan: form.keterangan || "-",
    };

    const res = await saveBonus(payload);
    if (res.success) {
      localStorage.setItem(
        "bonusMessage",
        JSON.stringify({
          type: "success",
          text: `Bonus "${form.judul_bonus}" berhasil ditambahkan.`,
        }),
      );
      navigate("/gaji");
    } else {
      setErrorMsg(res.message || "Bonus sudah ada pada periode ini.");
    }

    setLoadingSubmit(false);
  };

  /* ========================================================
     🎨 RENDER (TIDAK DIUBAH SAMA SEKALI)
  ======================================================== */
  return (
    <MainLayout current="gaji">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 transition-all duration-300">
        {/* === Header === */}
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Tambah Bonus
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Berikan bonus tambahan untuk capster atau kasir.
          </p>
        </div>

        {/* === Alert Error === */}
        {errorMsg && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 italic mb-6">
            Memuat data capster & kasir...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Baris 1: Jabatan & Nama */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pilih Jabatan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pilih Jabatan
                </label>
                <select
                  value={roleType}
                  onChange={(e) => {
                    setRoleType(e.target.value);
                    setForm({
                      id_capster: "",
                      id_kasir: "",
                      judul_bonus: "",
                      jumlah: "",
                      jumlahFormatted: "",
                      periode: "",
                      keterangan: "",
                    });
                  }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                >
                  <option value="capster">Capster</option>
                  <option value="kasir">Kasir</option>
                </select>
              </div>

              {/* Pilih Nama */}
              {roleType === "capster" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pilih Capster
                  </label>
                  <select
                    value={form.id_capster}
                    onChange={(e) =>
                      setForm({ ...form, id_capster: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    required
                  >
                    <option value="">-- Pilih Capster --</option>
                    {capsters.map((c) => (
                      <option key={c.id_capster} value={c.id_capster}>
                        {c.nama_capster} — {c.nama_store}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pilih Kasir
                  </label>
                  <select
                    value={form.id_kasir}
                    onChange={(e) =>
                      setForm({ ...form, id_kasir: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    required
                  >
                    <option value="">-- Pilih Kasir --</option>
                    {kasirs.map((k) => (
                      <option key={k.id_kasir} value={k.id_kasir}>
                        {k.nama_kasir} — {k.nama_store}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Baris 2: Judul & Nominal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Bonus
                </label>
                <input
                  type="text"
                  value={form.judul_bonus}
                  onChange={(e) =>
                    setForm({ ...form, judul_bonus: e.target.value })
                  }
                  placeholder="Contoh: Bonus THR / Penjualan Tertinggi"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nominal Bonus
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.jumlahFormatted || ""}
                  onChange={handleJumlahChange}
                  placeholder="Masukkan nominal bonus"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Baris 3: Tanggal & Periode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Periode Bonus
                </label>
                <input
                  type="month"
                  value={form.periode}
                  onChange={(e) =>
                    setForm({ ...form, periode: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keterangan (Opsional)
                </label>
                <textarea
                  value={form.keterangan}
                  onChange={(e) =>
                    setForm({ ...form, keterangan: e.target.value })
                  }
                  placeholder="Tuliskan alasan atau catatan pemberian bonus..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  rows="3"
                />
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
                disabled={loadingSubmit}
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={loadingSubmit}
                className={`px-6 py-2.5 rounded-lg font-medium text-white transition ${
                  loadingSubmit
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-[#0e57b5] hover:bg-[#0b4894]"
                }`}
              >
                {loadingSubmit ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        )}
      </div>
    </MainLayout>
  );
}
