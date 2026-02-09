import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useProfil from "../../hooks/useProfil";
import Footer from "../../components/Footer";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const { profil } = useProfil();
  const logoSrc = profil?.logo_url;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login gagal");

      // Simpan data user
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      if (data.user) {
        localStorage.setItem("id_user", data.user.id_user);
        localStorage.setItem("id_store", data.user.id_store || "");
        localStorage.setItem("nama_user", data.user.nama_user || "");
      }

      // Redirect sesuai role
      if (data.role === "admin") navigate("/dashboard");
      else if (data.role === "kasir") {
        localStorage.setItem("id_kasir", data.user.id_kasir);
        localStorage.setItem("id_store", data.user.id_store || "");
        localStorage.setItem(
          "nama_user",
          data.user.nama_kasir || data.user.nama_user || "",
        );
        navigate("/dashboard/kasir");
        window.location.reload();
      } else if (data.role === "capster") {
        localStorage.setItem("id_capster", data.user.id_capster);
        localStorage.setItem("id_store", data.user.id_store || "");
        localStorage.setItem(
          "nama_user",
          data.user.nama_capster || data.user.nama_user || "",
        );
        navigate("/dashboard/capster");
        window.location.reload();
      } else navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="bg-white/90 backdrop-blur-sm shadow-xl border border-gray-100 rounded-2xl px-10 py-10 w-full max-w-md transition-all duration-300">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <img
            src={logoSrc}
            alt="Logo"
            className="mx-auto w-25 h-25 mb-3 drop-shadow-sm"
          />
          <h1 className="text-2xl font-bold text-gray-800 tracking-wide">
            {profil?.nama_barbershop || "Barbershop"}
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Sistem Informasi Keuangan Barbershop
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 px-4 py-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400 transition"
              placeholder="Masukkan username"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400 transition"
              placeholder="Masukkan password"
              required
            />
          </div>

          {/* Tombol Login */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-lg font-semibold text-white shadow-sm transition ${
              loading
                ? "bg-[#0b4894] cursor-not-allowed"
                : "bg-[#0e57b5] hover:bg-[#0b4894]"
            }`}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        {/* Footer kecil */}
        <div className="w-full mt-8">
          <Footer />
        </div>
      </div>
    </div>
  );
}
