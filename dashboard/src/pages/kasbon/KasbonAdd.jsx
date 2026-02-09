import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchKasbon from "../../hooks/useFetchKasbon";

export default function KasbonAdd() {
  const navigate = useNavigate();
  const { saveKasbon, fetchCapstersAndKasirs, fetchTotalKasbonAktif } =
    useFetchKasbon();

  const [roleType, setRoleType] = useState("capster");
  const [capsters, setCapsters] = useState([]);
  const [kasirs, setKasirs] = useState([]);
  const [kasbonLimitReached, setKasbonLimitReached] = useState(false);
  const [totalKasbonAktif, setTotalKasbonAktif] = useState(0);

  const LIMIT_KASBON = 5000000;

  const checkKasbonLimit = (list, id, key) => {
    const total = list
      .filter((k) => k[key] === id && k.status === "aktif")
      .reduce((sum, k) => sum + Number(k.sisa_kasbon), 0);

    return total >= LIMIT_KASBON;
  };

  const hitungKasbonAktif = (list, id, key) => {
    return list
      .filter((k) => k[key] === id && k.status === "aktif")
      .reduce((sum, k) => sum + Number(k.sisa_kasbon), 0);
  };

  const [form, setForm] = useState({
    id_capster: "",
    id_kasir: "",
    jumlah_total: "",
    jumlahFormatted: "",
    jumlah_cicilan: "",
    keterangan: "",
    tanggal_pinjam: new Date().toISOString().split("T")[0],
  });

  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  /* ========================================================
     🔹 Ambil Data Capster & Kasir
  ======================================================== */

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const { capsters, kasirs } = await fetchCapstersAndKasirs();
      setCapsters(capsters || []);
      setKasirs(kasirs || []);
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    const loadTotalKasbon = async () => {
      let total = 0;

      if (roleType === "capster" && form.id_capster) {
        total = await fetchTotalKasbonAktif({
          id_capster: form.id_capster,
        });
      }

      if (roleType === "kasir" && form.id_kasir) {
        total = await fetchTotalKasbonAktif({
          id_kasir: form.id_kasir,
        });
      }

      setTotalKasbonAktif(total);
      setKasbonLimitReached(total >= LIMIT_KASBON);
    };

    loadTotalKasbon();
  }, [form.id_capster, form.id_kasir, roleType]);

  useEffect(() => {
    if (kasbonLimitReached) {
      setErrorMsg("Batas kasbon maksimal adalah Rp5.000.000!");

      // 🔒 KUNCI FORM
      setForm((prev) => ({
        ...prev,
        jumlah_total: "",
        jumlahFormatted: "",
        jumlah_cicilan: "",
        keterangan: "",
      }));
    } else {
      setErrorMsg(null);
    }
  }, [kasbonLimitReached]);

  /* ========================================================
     💰 Format Rupiah
  ======================================================== */
  const formatRupiah = (val) => {
    const num = val.replace(/\D/g, "");
    return num ? `Rp${Number(num).toLocaleString("id-ID")}` : "";
  };

  const handleJumlahChange = (e) => {
    const value = Number(e.target.value.replace(/\D/g, ""));
    const totalSetelahInput = totalKasbonAktif + value;

    if (totalSetelahInput > LIMIT_KASBON) {
      setKasbonLimitReached(true);
      return; // ⛔ STOP DI SINI
    }

    setForm({
      ...form,
      jumlah_total: value,
      jumlahFormatted: formatRupiah(value.toString()),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    // 🔥 BLOKIR LANGSUNG JIKA SUDAH LIMIT
    if (totalKasbonAktif >= LIMIT_KASBON) {
      setErrorMsg("Batas kasbon maksimal adalah Rp5.000.000!");
      return;
    }

    // 🔥 BLOKIR JIKA TOTAL + INPUT MELEBIHI LIMIT
    if (totalKasbonAktif + Number(form.jumlah_total) > LIMIT_KASBON) {
      setErrorMsg("Jumlah kasbon melebihi batas maksimum Rp5.000.000");
      return;
    }

    if (
      !form.jumlah_total ||
      !form.jumlah_cicilan ||
      !form.keterangan ||
      (roleType === "capster" && !form.id_capster) ||
      (roleType === "kasir" && !form.id_kasir)
    ) {
      setErrorMsg("Semua kolom wajib diisi!");
      return;
    }

    setLoadingSubmit(true);

    const payload = {
      id_capster: roleType === "capster" ? form.id_capster : null,
      id_kasir: roleType === "kasir" ? form.id_kasir : null,
      jumlah_total: Number(form.jumlah_total),
      jumlah_cicilan: Number(form.jumlah_cicilan),
      keterangan: form.keterangan,
    };

    const res = await saveKasbon(payload);

    if (res.success) {
      navigate("/kasbon");
    } else {
      setErrorMsg(res.message || "Gagal menambahkan kasbon.");
    }

    setLoadingSubmit(false);
  };

  /* ========================================================
     🎨 RENDER (Style tidak saya ubah)
  ======================================================== */
  return (
    <MainLayout current="Kasbon">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 transition-all duration-300 w-full">
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Tambah Kasbon
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Catat kasbon baru untuk capster atau kasir.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
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
                      jumlah_total: "",
                      jumlahFormatted: "",
                      jumlah_cicilan: "",
                      keterangan: "",
                      tanggal_pinjam: new Date().toISOString().split("T")[0],
                    });
                  }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700"
                >
                  <option value="capster">Capster</option>
                  <option value="kasir">Kasir</option>
                </select>
              </div>

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

            {/* Baris 2: Nominal & Cicilan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Kasbon (Rp)
                </label>
                <input
                  disabled={kasbonLimitReached}
                  type="text"
                  value={form.jumlahFormatted}
                  onChange={handleJumlahChange}
                  placeholder="Masukkan nominal kasbon"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Cicilan
                </label>
                <input
                  disabled={kasbonLimitReached}
                  type="number"
                  value={form.jumlah_cicilan}
                  onChange={(e) =>
                    setForm({ ...form, jumlah_cicilan: e.target.value })
                  }
                  placeholder="Contoh: 5"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700"
                />
              </div>
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keterangan
              </label>
              <textarea
                disabled={kasbonLimitReached}
                value={form.keterangan}
                onChange={(e) =>
                  setForm({ ...form, keterangan: e.target.value })
                }
                placeholder="Contoh: Kasbon kebutuhan pribadi"
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
                disabled={loadingSubmit || kasbonLimitReached}
                className={`px-6 py-2.5 rounded-lg font-medium text-white transition ${
                  loadingSubmit || kasbonLimitReached
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-[#0e57b5] hover:bg-[#0b4894]"
                }`}
              >
                {kasbonLimitReached
                  ? "Limit Kasbon Tercapai"
                  : loadingSubmit
                  ? "Menyimpan..."
                  : "Simpan"}
              </button>
            </div>
          </form>
        )}
      </div>
    </MainLayout>
  );
}
