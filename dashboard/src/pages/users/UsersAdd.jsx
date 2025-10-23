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
  const [form, setForm] = useState({
    nama_user: "",
    username: "",
    password: "",
    role: "kasir",
    id_store: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validasi wajib
    if (!form.nama_user || !form.username || !form.password)
      return alert("Nama, username, dan password wajib diisi!");

    if ((form.role === "kasir" || form.role === "capster") && !form.id_store)
      return alert("Store wajib dipilih untuk kasir atau capster!");

    setLoading(true);
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
      localStorage.setItem(
        "userMessage",
        JSON.stringify({
          type: "error",
          text: `Gagal menambahkan user: ${err.message}`,
        })
      );
      navigate("/users");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout current="users">
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">
        Tambah User Baru
      </h1>

      <div className="bg-white border rounded-xl p-8 shadow-sm max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nama */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={form.nama_user}
              onChange={(e) => setForm({ ...form, nama_user: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="Masukkan nama lengkap"
              required
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Username
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="Masukkan username"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="Minimal 6 karakter"
              required
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Role
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
            >
              <option value="admin">Admin</option>
              <option value="kasir">Kasir</option>
              <option value="capster">Capster</option>
            </select>
          </div>

          {/* Store */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Store{" "}
              {(form.role === "kasir" || form.role === "capster") && (
                <span className="text-red-500">*</span>
              )}
            </label>
            <select
              value={form.id_store}
              onChange={(e) => setForm({ ...form, id_store: e.target.value })}
              className={`w-full border rounded-lg px-4 py-2 ${
                (form.role === "kasir" || form.role === "capster") &&
                !form.id_store
                  ? "border-red-400"
                  : ""
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

          {/* Tombol */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/users")}
              className="bg-gray-200 hover:bg-gray-300 px-5 py-2 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
