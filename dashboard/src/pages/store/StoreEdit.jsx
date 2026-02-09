import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchStore from "../../hooks/useFetchStore";

export default function StoreEdit() {
  const { id } = useParams();
  const { data, updateStore, loading: loadingStores } = useFetchStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({ nama_store: "", alamat_store: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Ambil data store ketika data sudah dimuat
  useEffect(() => {
    if (!loadingStores && data.length > 0) {
      const store = data.find((s) => String(s.id_store) === String(id));
      if (store) {
        setForm({
          nama_store: store.nama_store,
          alamat_store: store.alamat_store,
        });
        setError(null); // hapus error
      } else {
        setError("Data store tidak ditemukan.");
      }
    }
  }, [id, data, loadingStores]);

  // 💾 Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nama_store.trim() || !form.alamat_store.trim()) {
      setError("Semua kolom wajib diisi!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateStore(id, form);

      localStorage.setItem(
        "storeMessage",
        JSON.stringify({
          type: "success",
          text: `Data store "${form.nama_store}" berhasil diperbarui.`,
        })
      );

      navigate("/store");
    } catch (err) {
      console.error("❌ Gagal memperbarui store:", err);
      setError("Gagal memperbarui store: " + err.message);

      localStorage.setItem(
        "storeMessage",
        JSON.stringify({
          type: "error",
          text: `Gagal memperbarui store: ${err.message}`,
        })
      );
    } finally {
      setLoading(false);
    }
  };

  // 💫 Loading indikator
  if (loadingStores) {
    return (
      <MainLayout current="store">
        <div className="p-10 text-gray-500 text-center">
          Memuat data store...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout current="store">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 transition-all duration-300">
        {/* === Header === */}
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Edit Data Cabang
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ubah informasi cabang yang sudah terdaftar di sistem.
          </p>
        </div>

        {/* === Alert Error === */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
            {error}
          </div>
        )}

        {/* === Form === */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Cabang
            </label>
            <input
              type="text"
              value={form.nama_store}
              onChange={(e) => setForm({ ...form, nama_store: e.target.value })}
              placeholder="Masukkan nama store"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat Store
            </label>
            <input
              type="text"
              value={form.alamat_store}
              onChange={(e) =>
                setForm({ ...form, alamat_store: e.target.value })
              }
              placeholder="Masukkan alamat lengkap"
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
      </div>
    </MainLayout>
  );
}
