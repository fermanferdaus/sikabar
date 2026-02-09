import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchGajiSetting from "../../hooks/useFetchGajiSetting";

export default function GajiEdit() {
  const navigate = useNavigate();
  const { id } = useParams(); // id_gaji_setting
  const { data, updateGaji } = useFetchGajiSetting();

  const [form, setForm] = useState({
    id_capster: "",
    id_kasir: "",
    jabatan: "",
    nama: "",
    gaji_pokok: "",
    gajiFormatted: "",
    periode: "Bulanan",
  });

  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  /* ========================================================
     🔹 Ambil data gaji berdasarkan id_gaji_setting
  ======================================================== */
  useEffect(() => {
    if (!data || data.length === 0) return;

    const found = data.find((item) => item.id_gaji_setting === Number(id));
    if (!found) {
      setErrorMsg("Data gaji tidak ditemukan.");
      setLoading(false);
      return;
    }

    const cleanValue = parseInt(found.gaji_pokok);

    setForm({
      id_capster: found.jabatan === "Capster" ? found.id_capster : "",
      id_kasir: found.jabatan === "Kasir" ? found.id_kasir : "",
      jabatan: found.jabatan,
      nama: found.nama,
      gaji_pokok: cleanValue,
      gajiFormatted: formatRupiah(cleanValue.toString()),
      periode: found.periode || "Bulanan",
    });

    setLoading(false);
  }, [data, id]);

  /* ========================================================
     💰 Format Rupiah
  ======================================================== */
  const formatRupiah = (value) => {
    const number = value.replace(/\D/g, "");
    if (!number) return "";
    return `Rp${Number(number).toLocaleString("id-ID")}`;
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

    if (!form.gaji_pokok) {
      setErrorMsg("Nominal gaji wajib diisi!");
      return;
    }

    setLoadingSubmit(true);
    setErrorMsg(null);

    const payload = {
      id_capster: form.id_capster || null,
      id_kasir: form.id_kasir || null,
      gaji_pokok: form.gaji_pokok,
      periode: form.periode,
    };

    const res = await updateGaji(id, payload);

    if (res.success) {
      localStorage.setItem(
        "gajiMessage",
        JSON.stringify({
          type: "success",
          text: `Data gaji untuk ${form.nama} berhasil diperbarui.`,
        })
      );
      navigate("/gaji");
    } else {
      setErrorMsg(res.message);
    }

    setLoadingSubmit(false);
  };

  /* ========================================================
     🎨 RENDER
  ======================================================== */
  return (
    <MainLayout current="gaji">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 transition-all duration-300">
        {/* Header */}
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Edit Gaji Pokok
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ubah nominal atau periode gaji pokok capster/kasir.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 italic mb-6">Memuat data gaji...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Nama & Jabatan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nama */}
              <div>
                <label className="block text-sm font-medium mb-1">Nama</label>
                <input
                  type="text"
                  value={form.nama}
                  disabled
                  className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-gray-700 cursor-not-allowed"
                />
              </div>

              {/* Jabatan */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Jabatan
                </label>
                <input
                  type="text"
                  value={form.jabatan}
                  disabled
                  className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-gray-700 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Nominal & Periode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gaji Pokok */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nominal Gaji Pokok
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.gajiFormatted}
                  onChange={handleGajiChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Periode */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Periode
                </label>
                <select
                  value={form.periode}
                  onChange={(e) =>
                    setForm({ ...form, periode: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
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
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={loadingSubmit}
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
