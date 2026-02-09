import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchStore from "../../hooks/useFetchStore";

export default function StoreAdd() {
  const { addStore } = useFetchStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nama_store: "", alamat: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nama_store.trim() || !form.alamat.trim()) {
      setError("Semua kolom wajib diisi!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/store`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          nama_store: form.nama_store,
          alamat_store: form.alamat,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // 🔴 Jika backend mengirim pesan duplikat
        if (
          data.message &&
          data.message.includes("Nama store sudah terdaftar")
        ) {
          setError("Nama store sudah terdaftar!");
          return;
        }
        throw new Error(data.message || "Gagal menambah store");
      }

      // ✅ Simpan pesan sukses ke localStorage
      localStorage.setItem(
        "storeMessage",
        JSON.stringify({
          type: "success",
          text: `Store "${form.nama_store}" berhasil ditambahkan.`,
        })
      );

      navigate("/store");
    } catch (err) {
      console.error("❌ Gagal menambah store:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout current="store">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 transition-all duration-300">
        {/* === Header === */}
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Tambah Cabang Baru
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Lengkapi informasi di bawah untuk menambahkan cabang baru.
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
          {/* Nama Store */}
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

          {/* Alamat Store */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat Store
            </label>
            <input
              type="text"
              value={form.alamat}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
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
