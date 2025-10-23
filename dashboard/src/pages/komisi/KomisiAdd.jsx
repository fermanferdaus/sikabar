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
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id_store || !form.persentase_capster) {
      alert("Semua kolom wajib diisi!");
      return;
    }

    setLoading(true);
    try {
      await addKomisi(form);

      // 💬 Simpan notifikasi untuk halaman KomisiSetting
      localStorage.setItem(
        "komisiMessage",
        JSON.stringify({
          type: "success",
          text: "Pengaturan komisi berhasil ditambahkan.",
        })
      );

      // ⏩ Langsung redirect
      navigate("/komisi-setting");
    } catch (err) {
      alert("Gagal menambah pengaturan komisi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔢 Hanya izinkan angka bulat
  const handlePercentageChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setForm({ ...form, persentase_capster: value });
  };

  return (
    <MainLayout current="komisi setting">
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">
        Tambah Pengaturan Komisi
      </h1>

      {loadingStores ? (
        <p className="text-gray-500">Memuat data store...</p>
      ) : errorStores ? (
        <p className="text-red-500">{errorStores}</p>
      ) : (
        <div className="bg-white border rounded-xl p-8 shadow-sm max-w-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* === Pilih Store === */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Pilih Toko
              </label>
              <select
                value={form.id_store}
                onChange={(e) => setForm({ ...form, id_store: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-amber-500"
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

            {/* === Persentase Capster === */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Persentase Capster (%)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={form.persentase_capster}
                onChange={handlePercentageChange}
                placeholder="Masukkan angka bulat (misal: 35)"
                className="w-full border rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            {/* === Tombol Aksi === */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate("/komisi-setting")}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-lg font-medium transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </MainLayout>
  );
}
