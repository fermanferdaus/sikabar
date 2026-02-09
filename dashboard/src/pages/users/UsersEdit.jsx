import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchUsers from "../../hooks/useFetchUsers";
import useFetchStore from "../../hooks/useFetchStore";

export default function UsersEdit() {
  const { id } = useParams();
  const { data: users, updateUser } = useFetchUsers();
  const { data: stores } = useFetchStore();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameExists, setUsernameExists] = useState(false);

  const [form, setForm] = useState({
    nama_user: "",
    username: "",
    password: "",
    role: "",
    id_store: "",
    id_capster: "",
    id_kasir: "",
  });

  /* ============================================================
     🔎 Ambil data user berdasarkan ID
  ============================================================ */
  useEffect(() => {
    if (!users || users.length === 0) return;

    const user = users.find((u) => String(u.id_user) === String(id));
    if (!user) {
      setError("Data user tidak ditemukan!");
      return;
    }

    setForm({
      nama_user: user.nama_user,
      username: user.username,
      password: "",
      role: user.role,
      id_store: user.id_store || "",
      id_capster: user.id_capster || "",
      id_kasir: user.id_kasir || "",
    });

    setError(null);
  }, [id, users]);

  /* ============================================================
     🔍 Cek Username Duplikat
  ============================================================ */
  const checkUsername = async (username) => {
    if (!username || username.length < 3) return;

    try {
      setCheckingUsername(true);
      const res = await fetch(
        `${API_URL}/users/check-username/${username}?exclude=${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setUsernameExists(data.exists);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value.trim();
    setForm({ ...form, username: value });

    if (value.length >= 3) checkUsername(value);
    else setUsernameExists(false);
  };

  /* ============================================================
     📝 Submit Update
  ============================================================ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.nama_user || !form.username)
      return setError("Nama dan username wajib diisi.");

    if (usernameExists)
      return setError("Username sudah digunakan oleh pengguna lain!");

    if ((form.role === "kasir" || form.role === "capster") && !form.id_store)
      return setError("Store wajib dipilih!");

    // Jika admin → hapus semua relasi
    let body = { ...form };
    if (form.role === "admin") {
      body.id_store = null;
      body.id_capster = null;
      body.id_kasir = null;
    }

    setLoading(true);

    try {
      await updateUser(id, body);

      localStorage.setItem(
        "userMessage",
        JSON.stringify({
          type: "success",
          text: `User "${form.nama_user}" berhasil diperbarui.`,
        })
      );

      navigate("/users");
    } catch (err) {
      setError("Gagal memperbarui user: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     UI
  ============================================================ */
  return (
    <MainLayout current="users">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10">
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Edit Data User
          </h1>
          <p className="text-sm text-gray-500">Perbarui informasi user.</p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* =================== 1. Nama & Username =================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama */}
            <div>
              <label className="block text-sm font-medium">Nama Lengkap</label>
              <input
                type="text"
                value={form.nama_user}
                onChange={(e) =>
                  setForm({ ...form, nama_user: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={handleUsernameChange}
                className={`w-full border rounded-lg px-4 py-3 
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
                ${usernameExists ? "border-red-500" : "border-gray-300"}`}
                required
              />
              {checkingUsername && (
                <p className="text-xs text-blue-500 mt-1">Memeriksa...</p>
              )}
              {usernameExists && (
                <p className="text-xs text-red-500 mt-1">
                  Username sudah digunakan!
                </p>
              )}
            </div>
          </div>

          {/* =================== 2. Password + Role =================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium">Password Baru</label>
              <input
                type="password"
                placeholder="Opsional"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              >
                <option value="admin">Owner</option>
                <option value="kasir">Kasir</option>
                <option value="capster">Capster</option>
              </select>
            </div>
          </div>

          {/* =================== 3. Store =================== */}
          <div>
            <label className="block text-sm font-medium">
              Cabang (wajib untuk kasir & capster)
            </label>
            <select
              value={form.id_store}
              onChange={(e) => setForm({ ...form, id_store: e.target.value })}
              className={`w-full border rounded-lg px-4 py-3 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
              ${
                (form.role === "kasir" || form.role === "capster") &&
                !form.id_store
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            >
              <option value="">Pilih Cabang</option>
              {stores.map((s) => (
                <option key={s.id_store} value={s.id_store}>
                  {s.nama_store}
                </option>
              ))}
            </select>
          </div>

          {/* =================== Tombol =================== */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 
              hover:bg-gray-50 transition font-medium"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading || usernameExists}
              className={`px-6 py-2.5 rounded-lg text-white 
              ${
                loading || usernameExists
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
