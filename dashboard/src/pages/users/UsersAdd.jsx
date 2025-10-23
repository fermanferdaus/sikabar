import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchUsers from "../../hooks/useFetchUsers";
import useFetchStore from "../../hooks/useFetchStore";

export default function UsersAdd() {
  const { addUser } = useFetchUsers();
  const { data: stores } = useFetchStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    nama_user: "",
    username: "",
    password: "",
    role: "kasir",
    id_store: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nama_user || !form.username || !form.password) {
      setError("Nama, username, dan password wajib diisi!");
      return;
    }

    if ((form.role === "kasir" || form.role === "capster") && !form.id_store) {
      setError("Store wajib dipilih untuk kasir atau capster!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await addUser(form);
      localStorage.setItem(
        "userMessage",
        JSON.stringify({
          type: "success",
          text: `User "${form.nama_user}" berhasil ditambahkan.`,
        })
      );
      navigate("/users");
    } catch (err) {
      console.error("❌ Gagal menambahkan user:", err);
      setError("Gagal menambahkan user: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout current="users">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 transition-all duration-300">
        {/* Header */}
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Tambah Pengguna Baru
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Lengkapi informasi di bawah untuk menambah akun pengguna.
          </p>
        </div>

        {/* Alert Error */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* === Baris 1: Nama & Username === */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={form.nama_user}
                onChange={(e) =>
                  setForm({ ...form, nama_user: e.target.value })
                }
                placeholder="Masukkan nama lengkap"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Masukkan username unik"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                required
              />
            </div>
          </div>

          {/* === Baris 2: Password & Role === */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimal 6 karakter"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role Pengguna
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              >
                <option value="admin">Admin</option>
                <option value="kasir">Kasir</option>
                <option value="capster">Capster</option>
              </select>
            </div>
          </div>

          {/* === Baris 3: Store (Full Width) === */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Store{" "}
              {(form.role === "kasir" || form.role === "capster") && (
                <span className="text-red-500">*</span>
              )}
            </label>
            <select
              value={form.id_store}
              onChange={(e) => setForm({ ...form, id_store: e.target.value })}
              className={`w-full border rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
                (form.role === "kasir" || form.role === "capster") &&
                !form.id_store
                  ? "border-red-400"
                  : "border-gray-300"
              }`}
            >
              <option value="">Pilih Store</option>
              {stores.map((s) => (
                <option key={s.id_store} value={s.id_store}>
                  {s.nama_store}
                </option>
              ))}
            </select>
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate("/users")}
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
              {loading ? "Menyimpan..." : "Simpan User"}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
