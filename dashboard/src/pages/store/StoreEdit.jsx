import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchStore from "../../hooks/useFetchStore";

export default function StoreEdit() {
  const { id } = useParams();
  const { data, updateStore } = useFetchStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({ nama_store: "", alamat_store: "" });
  const [loading, setLoading] = useState(false);

  // 🔹 Ambil data store berdasarkan ID dan tampilkan di form
  useEffect(() => {
    const store = data.find((s) => String(s.id_store) === String(id));
    if (store) {
      setForm({
        nama_store: store.nama_store,
        alamat_store: store.alamat_store, // ✅ gunakan field yang sesuai DB
      });
    }
  }, [id, data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama_store || !form.alamat_store)
      return alert("Semua kolom wajib diisi!");
    setLoading(true);
    try {
      await updateStore(id, form);

      // ✅ Simpan pesan sukses agar muncul di halaman store
      localStorage.setItem(
        "storeMessage",
        JSON.stringify({
          type: "success",
          text: `Data store "${form.nama_store}" berhasil diperbarui.`,
        })
      );

      navigate("/store");
    } catch (err) {
      localStorage.setItem(
        "storeMessage",
        JSON.stringify({
          type: "error",
          text: `Gagal memperbarui store: ${err.message}`,
        })
      );
      navigate("/store");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout current="store">
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">
        Edit Data Store
      </h1>

      <div className="bg-white border rounded-xl p-8 shadow-sm max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* === Nama Store === */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Nama Store
            </label>
            <input
              type="text"
              value={form.nama_store}
              onChange={(e) => setForm({ ...form, nama_store: e.target.value })}
              placeholder="Masukkan nama store"
              className="w-full border rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          {/* === Alamat Store === */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Alamat Store
            </label>
            <input
              type="text"
              value={form.alamat_store}
              onChange={(e) =>
                setForm({ ...form, alamat_store: e.target.value })
              }
              placeholder="Masukkan alamat store"
              className="w-full border rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          {/* === Tombol Aksi === */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/store")}
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
    </MainLayout>
  );
}
