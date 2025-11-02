import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchGajiSetting from "../../hooks/useFetchGajiSetting";

export default function GajiAdd() {
  const navigate = useNavigate();
  const { saveGaji } = useFetchGajiSetting();

  const [roleType, setRoleType] = useState("capster"); // default capster
  const [capsters, setCapsters] = useState([]);
  const [kasirs, setKasirs] = useState([]);
  const [form, setForm] = useState({
    id_capster: "",
    id_user: "",
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
     🔹 Ambil data Capster & Kasir
  ======================================================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [resCap, resKasir] = await Promise.all([
          fetch(`${API_URL}/capster`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const capData = await resCap.json();
        const userData = await resKasir.json();

        setCapsters(capData || []);
        setKasirs(userData.filter((u) => u.role === "kasir"));
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
     💰 Format angka ke Rupiah (auto format)
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
      (roleType === "kasir" && !form.id_user)
    ) {
      setErrorMsg("Semua kolom wajib diisi!");
      return;
    }

    setLoadingSubmit(true);
    setErrorMsg(null);

    const payload = {
      id_capster: roleType === "capster" ? form.id_capster : null,
      id_user: roleType === "kasir" ? form.id_user : null,
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
     🎨 RENDER
  ======================================================== */
  return (
    <MainLayout current="gaji">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 transition-all duration-300">
        {/* === Header === */}
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Tambah Gaji Pokok
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Atur gaji pokok untuk capster atau kasir.
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
            {/* Baris 1: Role & Nama */}
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
                      id_user: "",
                      gaji_pokok: "",
                      gajiFormatted: "",
                      periode: "Bulanan",
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
                    value={form.id_user}
                    onChange={(e) =>
                      setForm({ ...form, id_user: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    required
                  >
                    <option value="">-- Pilih Kasir --</option>
                    {kasirs.map((k) => (
                      <option key={k.id_user} value={k.id_user}>
                        {k.nama_user} — {k.username}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Baris 2: Nominal & Periode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nominal Gaji Pokok */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nominal Gaji Pokok
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.gajiFormatted || ""}
                  onChange={handleGajiChange}
                  placeholder="Masukkan nominal gaji"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  required
                />
              </div>

              {/* Periode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Periode
                </label>
                <select
                  value={form.periode}
                  onChange={(e) =>
                    setForm({ ...form, periode: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                >
                  <option value="Bulanan">Bulanan</option>
                  {/* <option value="Mingguan">Mingguan</option> */}
                </select>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate("/gaji")}
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
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loadingSubmit ? "Menyimpan..." : "Simpan Gaji"}
              </button>
            </div>
          </form>
        )}
      </div>
    </MainLayout>
  );
}
