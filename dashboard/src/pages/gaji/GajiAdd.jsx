import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchGajiSetting from "../../hooks/useFetchGajiSetting";

export default function GajiAdd() {
  const navigate = useNavigate();
  const { saveGaji } = useFetchGajiSetting();

  const [roleType, setRoleType] = useState("capster");
  const [capsters, setCapsters] = useState([]);
  const [kasirs, setKasirs] = useState([]);
  const [form, setForm] = useState({
    id_capster: "",
    id_kasir: "",
    gaji_pokok: "",
    gajiFormatted: "",
    periode: "Bulanan",
  });

  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  /* ========================================================
     🔹 Ambil data Capster & Kasir (langsung dari /kasir)
  ======================================================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [resCap, resKasir] = await Promise.all([
          fetch(`${API_URL}/capster`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/kasir`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const capData = await resCap.json();
        const kasirData = await resKasir.json();

        setCapsters(capData || []);
        setKasirs(kasirData || []);
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
     💰 Format Rupiah
  ======================================================== */
  const formatRupiah = (value) => {
    const number = value.replace(/\D/g, "");
    return number ? `Rp${Number(number).toLocaleString("id-ID")}` : "";
  };

  const handleGajiChange = (e) => {
    const numericValue = e.target.value.replace(/\D/g, "");
    setForm({
      ...form,
      gaji_pokok: numericValue,
      gajiFormatted: formatRupiah(numericValue),
    });
  };

  /* ========================================================
     💾 Submit handler
  ======================================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.gaji_pokok ||
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
      gaji_pokok: form.gaji_pokok,
      periode: form.periode,
    };

    const res = await saveGaji(payload);
    if (res.success) {
      localStorage.setItem(
        "gajiMessage",
        JSON.stringify({
          type: "success",
          text: `Gaji pokok berhasil ditambahkan untuk ${roleType}.`,
        })
      );
      navigate("/gaji");
    } else {
      setErrorMsg(res.message || "Nama ini sudah memiliki data gaji pokok.");
    }

    setLoadingSubmit(false);
  };

  /* ========================================================
     🎨 UI
  ======================================================== */
  return (
    <MainLayout current="gaji">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 transition-all duration-300">
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Tambah Gaji Pokok
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Atur gaji pokok untuk capster atau kasir.
          </p>
        </div>

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
            {/* Baris 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pilih Role */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Pilih Jabatan
                </label>
                <select
                  value={roleType}
                  onChange={(e) => {
                    setRoleType(e.target.value);
                    setForm({
                      id_capster: "",
                      id_kasir: "",
                      gaji_pokok: "",
                      gajiFormatted: "",
                      periode: "Bulanan",
                    });
                  }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="capster">Capster</option>
                  <option value="kasir">Kasir</option>
                </select>
              </div>

              {/* Pilih Nama */}
              {roleType === "capster" ? (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Pilih Capster
                  </label>
                  <select
                    value={form.id_capster}
                    onChange={(e) =>
                      setForm({ ...form, id_capster: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium mb-1">
                    Pilih Kasir
                  </label>
                  <select
                    value={form.id_kasir}
                    onChange={(e) =>
                      setForm({ ...form, id_kasir: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium mb-1">
                  Nominal Gaji Pokok
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.gajiFormatted || ""}
                  onChange={handleGajiChange}
                  placeholder="Masukkan nominal gaji"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Periode
                </label>
                <select
                  value={form.periode}
                  onChange={(e) =>
                    setForm({ ...form, periode: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Bulanan">Bulanan</option>
                </select>
              </div>
            </div>

            {/* Tombol */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={loadingSubmit}
                className={`px-6 py-2.5 rounded-lg text-white ${
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
