import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchKomisiSetting from "../../hooks/useFetchKomisiSetting";
import { formatTanggalJam } from "../../utils/dateFormatter";

export default function KomisiEdit() {
  const { id } = useParams();
  const { data, updateKomisi } = useFetchKomisiSetting();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    id_capster: "",
    nama_capster: "",
    nama_store: "",
    persentase_capster: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Ambil data komisi sesuai ID
  useEffect(() => {
    if (!data || data.length === 0) return;

    const komisi = data.find((item) => String(item.id_setting) === String(id));
    if (komisi) {
      setForm({
        id_capster: komisi.id_capster,
        nama_capster: komisi.nama_capster,
        nama_store: komisi.nama_store,
        persentase_capster: Math.floor(komisi.persentase_capster),
      });
      setError(null);
    } else {
      setError("Data pengaturan komisi tidak ditemukan!");
    }
  }, [id, data]);

  // 🔢 Hanya angka bulat
  const handlePercentageChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setForm({ ...form, persentase_capster: value });
  };

  // 💾 Simpan perubahan
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.persentase_capster) {
      setError("Persentase wajib diisi!");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await updateKomisi(id, {
        id_capster: form.id_capster,
        persentase_capster: form.persentase_capster,
      });

      localStorage.setItem(
        "komisiMessage",
        JSON.stringify({
          type: "success",
          text: `Perubahan komisi untuk ${form.nama_capster} berhasil disimpan.`,
        })
      );
      navigate("/komisi");
    } catch (err) {
      console.error("❌ Error update komisi:", err);
      setError("Gagal menyimpan perubahan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout current="komisi setting">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 transition-all duration-300">
        {/* Header */}
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Edit Komisi Capster
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ubah nilai persentase pembagian komisi untuk capster berikut.
          </p>
        </div>

        {/* Error Notifikasi */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* === Informasi Capster === */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Capster
              </label>
              <input
                type="text"
                value={form.nama_capster || ""}
                disabled
                className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                *Nama capster tidak dapat diubah.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cabang Barbershop
              </label>
              <input
                type="text"
                value={form.nama_store || ""}
                disabled
                className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                *Cabang diambil dari data capster.
              </p>
            </div>
          </div>

          {/* === Persentase Komisi === */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Persentase Komisi (%)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={form.persentase_capster}
              onChange={handlePercentageChange}
              placeholder="Masukkan angka bulat (misal: 35)"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              required
            />
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
              disabled={loading}
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 rounded-lg font-medium text-white transition ${
                loading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#0e57b5] hover:bg-[#0b4894]"
              }`}
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>

        {/* Info Update Terakhir */}
        {form.updated_at && (
          <p className="text-xs text-gray-500 mt-4 text-right">
            Terakhir diperbarui: {formatTanggalJam(form.updated_at)}
          </p>
        )}
      </div>
    </MainLayout>
  );
}
