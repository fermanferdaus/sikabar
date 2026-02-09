import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchBonus from "../../hooks/useFetchBonus";

export default function BonusEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { updateBonus } = useFetchBonus();

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
     🔹 Ambil data capster, kasir & detail bonus
  ======================================================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [resCap, resKas, resBonus] = await Promise.all([
          fetch(`${API_URL}/capster`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/kasir`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/gaji/bonus/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const capData = await resCap.json();
        const kasData = await resKas.json();
        const bonusData = await resBonus.json();

        // FIX UTAMA: pastikan array
        setCapsters(capData.data || capData || []);
        setKasirs(kasData.data || kasData || []);

        if (bonusData) {
          const isCapster = !!bonusData.id_capster;
          setRoleType(isCapster ? "capster" : "kasir");

          setForm({
            id_capster: bonusData.id_capster || "",
            id_kasir: bonusData.id_kasir || bonusData.id_user || "",
            judul_bonus: bonusData.judul_bonus || "",
            jumlah: bonusData.jumlah || "",
            jumlahFormatted: bonusData.jumlah
              ? `Rp${Number(bonusData.jumlah).toLocaleString("id-ID")}`
              : "",
            periode: bonusData.periode || "",
            keterangan: bonusData.keterangan || "",
          });
        }
      } catch (err) {
        console.error("❌ Error BonusEdit:", err);
        setErrorMsg("Gagal memuat data bonus untuk diedit.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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
     💾 Submit Bonus
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
      keterangan: form.keterangan,
    };

    const res = await updateBonus(id, payload);

    if (res.success) {
      localStorage.setItem(
        "bonusMessage",
        JSON.stringify({
          type: "success",
          text: `Bonus "${form.judul_bonus}" berhasil diperbarui.`,
        }),
      );
      navigate("/gaji");
    } else {
      setErrorMsg(res.message);
    }

    setLoadingSubmit(false);
  };

  /* ========================================================
     🎨 RENDER (STYLE TIDAK DIUBAH)
  ======================================================== */
  return (
    <MainLayout current="gaji">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 transition-all duration-300">
        {/* Header */}
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Edit Bonus</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ubah detail bonus yang sudah diberikan untuk capster atau kasir.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 italic mb-6">
            Memuat data bonus untuk diedit...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Baris 1: Jabatan & Nama */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jabatan
                </label>
                <select
                  value={roleType}
                  disabled
                  className="w-full border border-gray-300 bg-gray-100 text-gray-600 rounded-lg px-4 py-3 cursor-not-allowed"
                >
                  <option value="capster">Capster</option>
                  <option value="kasir">Kasir</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {roleType === "capster" ? "Nama Capster" : "Nama Kasir"}
                </label>

                <select
                  value={
                    roleType === "capster" ? form.id_capster : form.id_kasir
                  }
                  disabled
                  className="w-full border border-gray-300 bg-gray-100 text-gray-600 rounded-lg px-4 py-3 cursor-not-allowed"
                >
                  <option value="">
                    -- Pilih {roleType === "capster" ? "Capster" : "Kasir"} --
                  </option>

                  {(roleType === "capster" ? capsters : kasirs).map((p) => (
                    <option
                      key={roleType === "capster" ? p.id_capster : p.id_kasir}
                      value={roleType === "capster" ? p.id_capster : p.id_kasir}
                    >
                      {roleType === "capster"
                        ? `${p.nama_capster} — ${p.nama_store}`
                        : `${p.nama_kasir} — ${p.nama_store}`}
                    </option>
                  ))}
                </select>
              </div>
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
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
                  value={form.jumlahFormatted}
                  onChange={handleJumlahChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  rows="3"
                />
              </div>
            </div>

            {/* Tombol */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                disabled={loadingSubmit}
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={loadingSubmit}
                className={`px-6 py-2.5 rounded-lg text-white font-medium ${
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
