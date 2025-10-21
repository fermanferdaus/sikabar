import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login gagal");

      // 🧠 Simpan token dan role
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      // 🧩 Simpan juga data user penting (agar transaksi & capster tahu store-nya)
      if (data.user) {
        localStorage.setItem("id_user", data.user.id_user);
        localStorage.setItem("id_store", data.user.id_store);
        localStorage.setItem("nama_user", data.user.nama_user || "");
      }

      // 🚪 Redirect sesuai role
      if (data.role === "admin") navigate("/dashboard");
      else if (data.role === "kasir") navigate("/dashboard");
      else if (data.role === "capster") navigate("/komisi");
      else navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-96 border border-gray-100">
        <h1 className="text-2xl font-bold text-center text-amber-600 mb-6">
          Barber<span className="text-gray-800">System</span>
        </h1>

        {error && (
          <div className="text-red-500 text-sm text-center mb-3">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Username
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amber-600 text-white py-2 rounded-lg font-semibold hover:bg-amber-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
