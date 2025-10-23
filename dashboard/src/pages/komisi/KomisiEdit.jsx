import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchKomisiSetting from "../../hooks/useFetchKomisiSetting";
import useFetchStore from "../../hooks/useFetchStore";

export default function KomisiEdit() {
  const { id } = useParams();
  const { data, updateKomisi } = useFetchKomisiSetting();
  const {
    data: stores,
    loading: loadingStores,
    error: errorStores,
  } = useFetchStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    id_store: "",
    persentase_capster: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Ambil data komisi sesuai ID
  useEffect(() => {
    if (!data || data.length === 0) return; // ⏳ tunggu data benar-benar terisi dulu

    const komisi = data.find((item) => String(item.id_setting) === String(id));
    if (komisi) {
      setForm({
        id_store: komisi.id_store,
        persentase_capster: Math.floor(komisi.persentase_capster),
      });
      setError(null); // ✅ hapus error ketika data valid
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
    if (!form.id_store || !form.persentase_capster) {
      setError("Semua kolom wajib diisi!");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await updateKomisi(id, form);

      localStorage.setItem(
        "komisiMessage",
        JSON.stringify({
          type: "success",
          text: "Perubahan pengaturan komisi berhasil disimpan.",
        })
      );
      navigate("/komisi-setting");
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
            Edit Pengaturan Komisi
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ubah nilai persentase pembagian komisi untuk toko terkait.
          </p>
        </div>

        {/* Loading/Error */}
        {loadingStores && (
          <p className="text-gray-500 italic mb-6">Memuat data store...</p>
        )}
        {errorStores && <p className="text-red-500 mb-6">{errorStores}</p>}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        {!loadingStores && !errorStores && (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* === Baris 1: Store & Persentase === */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pilih Store (tidak bisa diubah) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Toko
                </label>
                <select
                  value={form.id_store}
                  disabled
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-100 text-gray-600 cursor-not-allowed"
                >
                  <option value="">
                    {stores.find((s) => s.id_store === form.id_store)
                      ?.nama_store || "Memuat..."}
                  </option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  *Toko tidak dapat diubah.
                </p>
              </div>

              {/* Persentase Capster */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Persentase Capster (%)
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
            </div>

            {/* Tombol Aksi */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate("/komisi-setting")}
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
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        )}
      </div>
    </MainLayout>
  );
}
