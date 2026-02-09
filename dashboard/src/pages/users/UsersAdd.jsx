import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchStore from "../../hooks/useFetchStore";

export default function UsersAdd() {
  const { data: stores } = useFetchStore();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const [usernameError, setUsernameError] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const [form, setForm] = useState({
    nama_user: "",
    username: "",
    password: "",
    role: "kasir",
    id_store: "",
    id_capster: "",
    id_kasir: "",
  });

  /* ================================
     🔍 CEK USERNAME DUPLIKAT
  ================================= */
  const handleUsernameChange = async (e) => {
    const username = e.target.value.trim();
    setForm({ ...form, username });
    setUsernameError(null);

    if (username.length < 3) return;

    try {
      setCheckingUsername(true);
      const res = await fetch(`${API_URL}/users/check-username/${username}`);
      const data = await res.json();
      if (data.exists) setUsernameError("Username sudah digunakan!");
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingUsername(false);
    }
  };

  /* ================================
     🔍 AUTO SEARCH NAMA (kasir/capster)
  ================================= */
  const handleNamaChange = async (e) => {
    const nama = e.target.value;

    setForm({
      ...form,
      nama_user: nama,
      id_capster: "",
      id_kasir: "",
    });

    setSuggestions([]);

    if (nama.length < 3) return;

    try {
      setSearching(true);
      const res = await fetch(`${API_URL}/users/search/${nama}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok && data) {
        setSuggestions(Array.isArray(data) ? data : [data]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  /* ================================
     🟢 PILIH NAMA
  ================================= */
  const handleSelectSuggestion = (item) => {
    if (item.role === "kasir") {
      setForm({
        ...form,
        nama_user: item.nama,
        role: "kasir",
        id_store: item.id_store,
        id_kasir: item.id_kasir,
        id_capster: "",
      });
    } else if (item.role === "capster") {
      setForm({
        ...form,
        nama_user: item.nama,
        role: "capster",
        id_store: item.id_store,
        id_capster: item.id_capster,
        id_kasir: "",
      });
    }
    setSuggestions([]);
  };

  /* ================================
     📝 SUBMIT FORM
  ================================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.nama_user || !form.username || !form.password)
      return setError("Nama, username, dan password wajib diisi!");

    if (usernameError) return setError("Username sudah digunakan!");

    if ((form.role === "kasir" || form.role === "capster") && !form.id_store)
      return setError("Store wajib dipilih!");

    if (form.role === "kasir" && !form.id_kasir)
      return setError("Nama kasir tidak valid! Periksa kembali nama pegawai anda.");

    if (form.role === "capster" && !form.id_capster)
      return setError("Nama capster tidak valid! Periksa kembali nama pegawai anda.");

    if (form.role === "admin") {
      form.id_store = null;
      form.id_kasir = null;
      form.id_capster = null;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem(
        "userMessage",
        JSON.stringify({
          type: "success",
          text: `User "${form.nama_user}" berhasil ditambahkan.`,
        })
      );

      navigate("/users");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     UI
  ================================= */
  return (
    <MainLayout current="users">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 relative">
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Tambah Pengguna Baru
          </h1>
          <p className="text-sm text-gray-500">Lengkapi informasi berikut.</p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ================= Nama + Username ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama */}
            <div className="relative">
              <label className="text-sm font-medium text-gray-700">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={form.nama_user}
                onChange={handleNamaChange}
                placeholder="Ketik minimal 3 huruf"
                className="w-full border border-gray-300 rounded-lg px-4 py-3
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                required
              />

              {searching && (
                <p className="text-xs text-blue-500 mt-1">Mencari...</p>
              )}

              {suggestions.length > 0 && (
                <ul className="absolute w-full bg-white border rounded-lg shadow-lg mt-1 z-10 max-h-48 overflow-auto">
                  {suggestions.map((item, i) => (
                    <li
                      key={i}
                      onClick={() => handleSelectSuggestion(item)}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                    >
                      <div className="font-medium">{item.nama}</div>
                      <div className="text-xs text-gray-500">
                        {item.role.toUpperCase()} — {item.nama_store}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                value={form.username}
                onChange={handleUsernameChange}
                placeholder="Masukkan username unik"
                className={`w-full border border-gray-300 rounded-lg px-4 py-3
                            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
             ${usernameError ? "border-red-500" : "border-gray-300"}`}
                required
              />

              {checkingUsername && (
                <p className="text-xs text-blue-500 mt-1">Memeriksa...</p>
              )}
              {usernameError && (
                <p className="text-xs text-red-500 mt-1">{usernameError}</p>
              )}
            </div>
          </div>

          {/* ================= Password + Role ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Role</label>
              <select
                value={form.role}
                onChange={(e) =>
                  setForm({
                    ...form,
                    role: e.target.value,
                    id_capster: "",
                    id_kasir: "",
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              >
                <option value="admin">Owner</option>
                <option value="kasir">Kasir</option>
                <option value="capster">Capster</option>
              </select>
            </div>
          </div>

          {/* ================= Store ================= */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Cabang{" "}
              {(form.role === "kasir" || form.role === "capster") && (
                <span className="text-red-500">*</span>
              )}
            </label>

            <select
              value={form.id_store}
              onChange={(e) => setForm({ ...form, id_store: e.target.value })}
              className={`w-full border border-gray-300 rounded-lg px-4 py-3
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

          {/* ================= Button ================= */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading || checkingUsername}
              className={`px-6 py-2.5 rounded-lg text-white ${
                loading ? "bg-gray-300" : "bg-[#0e57b5] hover:bg-[#0b4894]"
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
