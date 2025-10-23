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

  // 🔹 Ambil data komisi sesuai ID
  useEffect(() => {
    const komisi = data.find((item) => String(item.id_setting) === String(id));
    if (komisi) {
      setForm({
        id_store: komisi.id_store,
        persentase_capster: Math.floor(komisi.persentase_capster),
      });
    }
  }, [id, data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id_store || !form.persentase_capster) {
      alert("Semua kolom wajib diisi!");
      return;
    }

    setLoading(true);
    try {
      await updateKomisi(id, form);

      // 💬 Simpan notifikasi untuk halaman KomisiSetting
      localStorage.setItem(
        "komisiMessage",
        JSON.stringify({
          type: "success",
          text: "Perubahan pengaturan komisi berhasil disimpan.",
        })
      );

      // ⏩ Langsung redirect
      navigate("/komisi-setting");
    } catch (err) {
      alert("Gagal menyimpan perubahan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔢 Hanya angka bulat
  const handlePercentageChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setForm({ ...form, persentase_capster: value });
  };

  return (
    <MainLayout current="komisi setting">
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">
        Edit Pengaturan Komisi
      </h1>

      {loadingStores ? (
        <p className="text-gray-500">Memuat data store...</p>
      ) : errorStores ? (
        <p className="text-red-500">{errorStores}</p>
      ) : (
        <div className="bg-white border rounded-xl p-8 shadow-sm max-w-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* === Pilih Store (tidak dapat diubah) === */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Toko
              </label>
              <select
                value={form.id_store}
                disabled
                className="w-full border rounded-lg px-4 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
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
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </MainLayout>
  );
}
