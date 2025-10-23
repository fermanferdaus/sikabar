import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchKomisiSetting from "../../hooks/useFetchKomisiSetting";
import useFetchStore from "../../hooks/useFetchStore";

export default function KomisiAdd() {
  const { addKomisi } = useFetchKomisiSetting();
  const {
    data: stores,
    loading: loadingStores,
    error: errorStores,
  } = useFetchStore();

  const [form, setForm] = useState({ id_store: "", persentase_capster: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 🔢 Hanya angka bulat
  const handlePercentageChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setForm({ ...form, persentase_capster: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.id_store || !form.persentase_capster) {
      setError("Semua kolom wajib diisi!");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await addKomisi(form);
      localStorage.setItem(
        "komisiMessage",
        JSON.stringify({
          type: "success",
          text: "Pengaturan komisi berhasil ditambahkan.",
        })
      );
      navigate("/komisi-setting");
    } catch (err) {
      setError("Gagal menambah pengaturan komisi: " + err.message);
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
            Tambah Pengaturan Komisi
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Atur persentase pembagian komisi untuk setiap toko.
          </p>
        </div>

        {/* Loading / Error */}
        {loadingStores && (
          <p className="text-gray-500 italic mb-6">Memuat data store...</p>
        )}
        {errorStores && <p className="text-red-500 mb-6">{errorStores}</p>}

        {/* Alert Error */}
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
              {/* Pilih Toko */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pilih Toko
                </label>
                <select
                  value={form.id_store}
                  onChange={(e) =>
                    setForm({ ...form, id_store: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  required
                >
                  <option value="">-- Pilih Toko --</option>
                  {stores.map((s) => (
                    <option key={s.id_store} value={s.id_store}>
                      {s.nama_store}
                    </option>
                  ))}
                </select>
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
                  placeholder="Misal: 35"
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
                {loading ? "Menyimpan..." : "Simpan Pengaturan"}
              </button>
            </div>
          </form>
        )}
      </div>
    </MainLayout>
  );
}
