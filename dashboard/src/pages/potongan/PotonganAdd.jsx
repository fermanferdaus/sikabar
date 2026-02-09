import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchPotongan from "../../hooks/useFetchPotongan";
import useFetchKasbon from "../../hooks/useFetchKasbon";

export default function PotonganAdd() {
  const navigate = useNavigate();
  const { savePotongan } = useFetchPotongan();
  const { fetchCapstersAndKasirs } = useFetchKasbon();

  // ==========================
  // STATE
  // ==========================
  const [roleType, setRoleType] = useState("capster");
  const [capsters, setCapsters] = useState([]);
  const [kasirs, setKasirs] = useState([]);

  const [form, setForm] = useState({
    id_capster: "",
    id_kasir: "",
    jumlah_potongan: "",
    jumlahFormatted: "",
    keterangan: "",
    tanggal_potong: new Date().toISOString().split("T")[0],
  });

  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // ==========================
  // LOAD DATA CAPSTER & KASIR
  // ==========================
  useEffect(() => {
    const loadPegawai = async () => {
      setLoading(true);
      const { capsters, kasirs } = await fetchCapstersAndKasirs();
      setCapsters(capsters || []);
      setKasirs(kasirs || []);
      setLoading(false);
    };
    loadPegawai();
  }, []);

  // ==========================
  // FORMAT RUPIAH
  // ==========================
  const formatRupiah = (val) => {
    const num = val.replace(/\D/g, "");
    return num ? `Rp${Number(num).toLocaleString("id-ID")}` : "";
  };

  const handleJumlahChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setForm({
      ...form,
      jumlah_potongan: value,
      jumlahFormatted: formatRupiah(value),
    });
  };

  // ==========================
  // SUBMIT DATA
  // ==========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (
      !form.jumlah_potongan ||
      !form.keterangan ||
      (roleType === "capster" && !form.id_capster) ||
      (roleType === "kasir" && !form.id_kasir)
    ) {
      setErrorMsg("Semua kolom wajib diisi!");
      return;
    }

    setLoadingSubmit(true);

    // 🔥 FIX PENTING: id_kasir HARUS DIKIRIM, bukan id_user
    const payload = {
      tipe_potongan: "umum",
      id_capster: roleType === "capster" ? form.id_capster : null,
      id_kasir: roleType === "kasir" ? form.id_kasir : null,
      jumlah_potongan: Number(form.jumlah_potongan),
      keterangan: form.keterangan,
      tanggal_potong: form.tanggal_potong,
    };

    const res = await savePotongan(payload);

    if (res.success) {
      localStorage.setItem(
        "potonganMessage",
        JSON.stringify({
          type: "success",
          text: "Potongan umum berhasil ditambahkan!",
        })
      );
      navigate("/potongan");
    } else {
      setErrorMsg(res.message || "Gagal menambahkan potongan.");
    }

    setLoadingSubmit(false);
  };

  // ==========================
  // RENDER UI (SAMA DENGAN KASBON ADD)
  // ==========================
  return (
    <MainLayout current="Potongan">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 transition-all duration-300 w-full">
        {/* Header */}
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Tambah Potongan Umum
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Catat potongan pegawai (capster/kasir) karena alasan umum.
          </p>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <p className="text-gray-500 italic mb-6">Memuat data pegawai...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Baris 1 */}
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
                      ...form,
                      id_capster: "",
                      id_kasir: "",
                    });
                  }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700"
                >
                  <option value="capster">Capster</option>
                  <option value="kasir">Kasir</option>
                </select>
              </div>

              {/* Pilih Pegawai */}
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
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700"
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
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700"
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

            {/* Baris 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Potongan (Rp)
                </label>
                <input
                  type="text"
                  value={form.jumlahFormatted}
                  onChange={handleJumlahChange}
                  placeholder="Masukkan nominal potongan"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Potong
                </label>
                <input
                  type="date"
                  value={form.tanggal_potong}
                  onChange={(e) =>
                    setForm({ ...form, tanggal_potong: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700"
                  required
                />
              </div>
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keterangan
              </label>
              <textarea
                value={form.keterangan}
                onChange={(e) =>
                  setForm({ ...form, keterangan: e.target.value })
                }
                placeholder="Contoh: Potongan karena keterlambatan"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700"
                rows="3"
                required
              />
            </div>

            {/* Tombol */}
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
