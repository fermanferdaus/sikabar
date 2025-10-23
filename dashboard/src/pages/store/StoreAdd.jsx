import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchStore from "../../hooks/useFetchStore";

export default function StoreAdd() {
  const { addStore } = useFetchStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nama_store: "", alamat: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi input
    if (!form.nama_store || !form.alamat) {
      setTimeout(() => alert("Semua kolom wajib diisi!"), 0);
      return;
    }

    setLoading(true);
    try {
      await addStore({
        nama_store: form.nama_store,
        alamat_store: form.alamat, // kirim key yang sesuai
      });

      // ✅ Simpan pesan sukses ke localStorage agar bisa ditampilkan di halaman Store
      localStorage.setItem(
        "storeMessage",
        JSON.stringify({
          type: "success",
          text: `Store "${form.nama_store}" berhasil ditambahkan.`,
        })
      );

      navigate("/store");
    } catch (err) {
      // Jika gagal, kirim pesan error
      localStorage.setItem(
        "storeMessage",
        JSON.stringify({
          type: "error",
          text: `Gagal menambahkan store: ${err.message}`,
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
        Tambah Store Baru
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
              value={form.alamat}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
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
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
